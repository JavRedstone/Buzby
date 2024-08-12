<script lang="ts">
	import { currentMember } from '$lib/elements/stores/project-store';
	import ProjectOverview from './project-overview.svelte';
	import { fade, slide } from 'svelte/transition';
	import { PingConstants } from '$lib/elements/classes/data/chat/PingConstants';
	import { Ping } from '$lib/elements/classes/data/chat/Ping';
	import { ObjectHelper } from '$lib/elements/helpers/ObjectHelper';
	import { Member } from '$lib/elements/classes/data/project/Member';
	import { getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
	import { getFirestoreDoc } from '$lib/elements/firebase/firebase';
	import { DocumentReference } from 'firebase/firestore';
	import { getDocs } from 'firebase/firestore';
	import { where } from 'firebase/firestore';
	import { query } from 'firebase/firestore';
	import { getFirestoreCollection } from '$lib/elements/firebase/firebase';
	import { CollectionReference, type DocumentData } from 'firebase/firestore';
	import { Project } from '$lib/elements/classes/data/project/Project';
	import Snackbar from '$lib/elements/ui/general/snackbar.svelte';
	import { onMount } from 'svelte';
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import { StringHelper } from '$lib/elements/helpers/StringHelper';
	import { ProjectConstants } from '$lib/elements/classes/data/project/ProjectConstants';
	import Tooltip from '$lib/elements/ui/general/tooltip.svelte';
	import { MemberProject } from '$lib/elements/classes/data/project/MemberProject';

    let currMember: Member = null;

    let createOpen: boolean = false;
    let createProcessing: boolean = false;

    let projectName: string = "";
    let projectDescription: string = "";
    let projectColor: string = ObjectHelper.pickRandom(ProjectConstants.COLORS).hex;
    let memberEmails: string[] = [""];

    let snackbarOpen: boolean = false;
    let snackbarText: string = "";
    let snackbarType: string = "neutral";

    function createProject(): void {
        if (createProcessing) {
            return;
        } else {
            createProcessing = true;
        }
        
        if (projectName.trim() === "") {
            openSnackbar("Please enter a project name.", "error");
            createProcessing = false;
            return;
        }
        if (projectName.length > ProjectConstants.PROJECT_NAME_MAX_LENGTH) {
            openSnackbar(`Project name is too long. Max length is ${ProjectConstants.PROJECT_NAME_MAX_LENGTH} characters.`, "error");
            createProcessing = false;
            return;
        }
        if (projectDescription.trim() === "") {
            openSnackbar("Please enter a project description.", "error");
            createProcessing = false;
            return;
        }
        if (projectDescription.length > ProjectConstants.PROJECT_DESCRIPTION_MAX_LENGTH) {
            openSnackbar(`Project description is too long. Max length is ${ProjectConstants.PROJECT_DESCRIPTION_MAX_LENGTH} characters.`, "error");
            createProcessing = false;
            return;
        }
        if (projectColor.trim() === "") {
            openSnackbar("Please enter a project color.", "error");
            createProcessing = false;
            return;
        }
        
        memberEmails = memberEmails.filter((email) => email !== "").filter((email) => email.toLowerCase() !== currMember.email.toLowerCase()).filter((email, index, self) => self.indexOf(email) === index).map((email) => email.toLowerCase());
        
        if (memberEmails.length === 0) {
            memberEmails = [""];
            openSnackbar("Please add at least one member email.", "error");
            createProcessing = false;
            return;
        }

        if (memberEmails.length > ProjectConstants.MAX_NUM_MEMBERS) {
            openSnackbar(`You can only add up to ${ProjectConstants.MAX_NUM_MEMBERS} members to a project.`, "error");
            createProcessing = false;
            return;
        }
        
        if (createOpen && currMember) {
            let membersCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection("members");
            let membersQuery = query(membersCollection, where("email", "in", memberEmails));
            let memberIds: string[] = [];
            getDocs(membersQuery).then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    memberIds.push(doc.id);
                });

                if (memberIds.length > 0) {
                    createOpen = false;

                    memberIds.push(currMember.id);
                    let project: Project = new Project({
                        id: StringHelper.generateID(),
                        name: projectName,
                        description: projectDescription,
                        color: projectColor,
                        createdAtTemp: serverTimestamp(),
                    });

                    let projectDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("projects", project.id);
                    setDoc(projectDoc, project.compactify()).then(() => {
                        let ownerProject: MemberProject = new MemberProject({
                            id: StringHelper.generateID(),
                            memberId: currMember.id,
                            projectId: project.id,
                            isOwner: true,
                            hasJoined: true,
                            createdAtTemp: serverTimestamp(),
                        });
                        let memberProjectDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("memberProjects", ownerProject.id);
                        setDoc(memberProjectDoc, ownerProject.compactify()).then(() => {
                            for (let memberId of memberIds) {
                                if (memberId === currMember.id) {
                                    continue;
                                }
                                let memberProject: MemberProject = new MemberProject({
                                    id: StringHelper.generateID(),
                                    memberId: memberId,
                                    projectId: project.id,
                                    isOwner: false,
                                    hasJoined: false,
                                    createdAtTemp: serverTimestamp(),
                                });
                                let memberProjectDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("memberProjects", memberProject.id);
                                setDoc(memberProjectDoc, memberProject.compactify()).then(
                                    () => {
                                        let ping: Ping = new Ping({
                                            id: StringHelper.generateID(),
                                            memberId: memberId,
                                            projectId: project.id,
                                            type: PingConstants.TYPES.PROJECT,
                                            title: "Project request",
                                            message: `Member "${currMember.displayName}" requested to add you to the project "${project.name}."`,
                                            createdAtTemp: serverTimestamp(),
                                        });
                                        let pingDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("pings", ping.id);
                                        setDoc(pingDoc, ping.compactify());
                                    }
                                ).catch((error) => {
                                    openSnackbar("An error occurred while inviting members to the project.", "error");
                                    createProcessing = false;
                                });
                            }
                        }).catch((error) => {
                            openSnackbar("An error occurred while creating the project.", "error");
                            createProcessing = false;
                        });
                    }).catch((error) => {
                        openSnackbar("An error occurred while creating the project.", "error");
                        createProcessing = false;
                    });
                }
                else {
                    openSnackbar("No members found with the provided emails.", "error");
                    createProcessing = false;
                }
            });
        } else {
            openSnackbar("An error occurred while creating the project.", "error");
            createProcessing = false;
        }
    }

    function cancel(): void {
        projectName = "";
        projectDescription = "";
        projectColor = ObjectHelper.pickRandom(ProjectConstants.COLORS).hex;
        memberEmails = [""];
        createOpen = false;
    }

    function addEmail(): void {
        if (memberEmails.length < ProjectConstants.MAX_NUM_MEMBERS) {
            memberEmails = [...memberEmails, ""];
        }
        else {
            openSnackbar(`You can only add up to ${ProjectConstants.MAX_NUM_MEMBERS} members to a project.`, "error");
        }
    }

    function removeEmail(idx: number): void {
        if (memberEmails.length > 1) {
            memberEmails = memberEmails.filter((_, index) => index !== idx);
        }
        else {
            memberEmails = [""];
        }
    }

    function getCurrMember(): void {
        currentMember.subscribe((value) => {
            currMember = value;
        });
    }

    function openSnackbar(text: string, type: string): void {
        snackbarText = text;
        snackbarType = type;
        snackbarOpen = true;
    }

    onMount(() => {
        getCurrMember();
    });
</script>
<style>
    .overview-container {
        height: 100%;
        overflow-y: auto;
        padding: 16px;
        color: var(--grey-800);
    }

    .overview-create-project-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding-right: 12px;
        padding-top: 4px;
        padding-bottom: 4px;
        border: none;
        outline: none;
        border-radius: 8px;
        background-color: var(--primary);
        color: var(--grey-800);
        cursor: pointer;
        user-select: none;  

        transition: background-color var(--transition-duration), color var(--transition-duration);

        &:hover {
            background-color: var(--primary-dark);
            color: var(--grey-100);
        }
    }

    .overview-create-project-container {
        box-sizing: border-box;
        width: 100%;
        margin-top: 16px;
        padding: 16px;
        background-color: rgba(var(--primary-rgb), 0.025);
        border: 1px solid var(--primary);
        border-radius: 8px;
        user-select: none;
    }

    .overview-create-project-field {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
    }

    .overview-create-project-icon {
        margin-right: 8px;
        font-size: 36px;
        color: var(--grey-800);
    }

    .overview-create-project-close-icon {
        margin-left: 8px;
        font-size: 24px;
        color: var(--grey-800);
        cursor: pointer;

        transition: color var(--transition-duration);

        &:hover {
            color: var(--error);
        }
    }

    .overview-create-project-input {
        width: 100%;
        padding-left: 8px;
        padding-right: 8px;
        padding-top: 4px;
        padding-bottom: 4px;
        background-color: var(--grey-200);
        outline: none;
        border: 2px solid var(--grey-400);
        border-radius: 4px;
        font-size: 16px;
        color: var(--grey-800);

        transition: border-color var(--transition-duration);

        &:hover {
            border-color: var(--accent-light);
        }

        &:focus {
            border-color: var(--accent);
        }
    }

    .overview-create-project-color {
        box-sizing: border-box;
        width: 32px;
        height: 32px;
        margin-right: 8px;
        border: 4px solid transparent;
        border-radius: 16px;
        cursor: pointer;

        transition: border-color var(--transition-duration);
    }

    .overview-create-project-email-info {
        font-size: 10px;
        color: var(--grey-500);
        margin-bottom: 8px;
    }

    .overview-create-project-email-container {
        box-sizing: border-box;
        margin-bottom: 8px;
        padding: 8px;
        border: 1px solid var(--grey-400);
        border-radius: 4px;
    }

    .overview-create-project-add-member {
        padding-left: 8px;
        padding-right: 8px;
        padding-top: 4px;
        padding-bottom: 4px;
        color: var(--grey-800);
        border: 2px solid var(--grey-400);
        outline: none;
        border-radius: 4px;
        cursor: pointer;

        transition: border-color var(--transition-duration);

        &:hover {
            border-color: var(--accent-light);
        }
    }

    .overview-create-project-create {
        padding-left: 8px;
        padding-right: 8px;
        padding-top: 4px;
        padding-bottom: 4px;
        background-color: var(--primary);
        color: var(--grey-800);
        border: none;
        outline: none;
        border-radius: 4px;
        cursor: pointer;

        transition: background-color var(--transition-duration), color var(--transition-duration);

        &:hover {
            background-color: var(--accent);
            color: var(--grey-100);
        }
    }

    .overview-create-project-cancel {
        padding-left: 8px;
        padding-right: 8px;
        padding-top: 4px;
        padding-bottom: 4px;
        background-color: var(--grey-300);
        color: var(--grey-800);
        border: none;
        outline: none;
        border-radius: 4px;
        cursor: pointer;

        transition: background-color var(--transition-duration);

        &:hover {
            background-color: var(--grey-400);
        }
    }

    .overview-create-project-sorry {
        margin-top: 16px;
        margin-bottom: 16px;
        padding: 16px;
        background-color: rgba(var(--error-rgb), 0.025);
        border: 1px solid var(--error);
        border-radius: 8px;
        color: var(--error);
        user-select: none;
    }

    .overview-projects-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
        color: var(--grey-800);
    }

    .overview-requested-projects-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
        padding-bottom: 32px;
        color: var(--grey-800);
    }
</style>

<div class="overview-container" transition:fade={{duration: TransitionConstants.DURATION}}>
    <button class="overview-create-project-button" on:click={() => createOpen = true}>
        <span class="material-symbols-rounded">add</span>
        Create Project
    </button>
    
    {#if currMember && createOpen}
        <div class="overview-create-project-container" transition:slide={{duration: TransitionConstants.DURATION}}>
            {#if currMember.joinedProjects.length < ProjectConstants.MAX_NUM_PROJECTS}
                <div class="overview-create-project-field">
                    <span class="overview-create-project-icon material-symbols-rounded">badge</span>
                    <input class="overview-create-project-input" type="text" placeholder="Project Name" maxlength={ProjectConstants.PROJECT_NAME_MAX_LENGTH} bind:value={projectName} />
                </div>
                <div class="overview-create-project-field">
                    <span class="overview-create-project-icon material-symbols-rounded">description</span>
                    <input class="overview-create-project-input" type="text" placeholder="Project Description" maxlength={ProjectConstants.PROJECT_DESCRIPTION_MAX_LENGTH} bind:value={projectDescription} />
                </div>
                <div class="overview-create-project-field">
                    <span class="overview-create-project-icon material-symbols-rounded">colors</span>
                    {#each ProjectConstants.COLORS as color}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div class="overview-create-project-color" style="background-color: {color.hex}; {projectColor == color.hex ? 'border-color: var(--grey-800);' : ''}" on:click={() => projectColor = color.hex}>
                            <Tooltip>{color.displayName}</Tooltip>
                        </div>
                    {/each}
                </div>
                <div class="overview-create-project-email-container">
                    <div>Member emails</div>
                    <div class="overview-create-project-email-info">*If they have an account, they will be requested to join. Otherwise, they will not be added.</div>
                    {#each memberEmails as email, i}
                        <div class="overview-create-project-field" transition:slide={{duration: TransitionConstants.DURATION}}>
                            <span class="overview-create-project-icon material-symbols-rounded">email</span>
                            <input class="overview-create-project-input" placeholder="Member Email" bind:value={email} />
                            {#if memberEmails.length > 1}
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <!-- svelte-ignore a11y-no-static-element-interactions -->
                                <span class="overview-create-project-close-icon material-symbols-rounded" on:click={() => removeEmail(i)}>close</span>
                            {/if}
                        </div>
                    {/each}
                    {#if memberEmails.length < ProjectConstants.MAX_NUM_MEMBERS}
                        <button class="overview-create-project-add-member" type="button" on:click={addEmail}>Add Member</button>
                    {/if}
                </div>
                <button class="overview-create-project-create" on:click={createProject}>Create</button>
            {:else}
                <div class="overview-create-project-sorry">You have reached the project limit of {ProjectConstants.MAX_NUM_PROJECTS} project{ProjectConstants.MAX_NUM_PROJECTS > 1 ? 's' : ''}. Please delete a project to create a new one.</div>
            {/if}
            <button class="overview-create-project-cancel" on:click={cancel}>Cancel</button>
        </div>
    {/if}

    <h2>Projects</h2>
    <div class="overview-projects-container">
        {#if currMember}
            {#each currMember.joinedProjects as project}
                <ProjectOverview bind:project={project} isRequested={false} isOwner={project && project.owner ? project.owner.id === currMember.id : false} />
            {/each}
            {#if currMember.joinedProjects.length === 0}
                <div class="overview-no-projects">No projects found. Create one above!</div>
            {/if}
        {/if}
    </div>
    <h2>Requested Projects</h2>
    <div class="overview-requested-projects-container">
        {#if currMember}
            {#each currMember.requestedProjects as project}
                <ProjectOverview bind:project={project} isRequested={true} isOwner={false} />
            {/each}
            {#if currMember.requestedProjects.length === 0}
                <div class="overview-no-projects">No requested projects found. Receive a request to join a project!</div>
            {/if}
        {/if}
    </div>
</div>
<Snackbar type={snackbarType} bind:open={snackbarOpen}>{snackbarText}</Snackbar>