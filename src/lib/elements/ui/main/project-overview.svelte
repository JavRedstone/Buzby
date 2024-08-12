<script lang="ts">
	import { currentMember, projectSelected } from '$lib/elements/stores/project-store';
	import { CollectionReference, DocumentReference, deleteDoc, getDocs, query, serverTimestamp, setDoc, where, type DocumentData } from 'firebase/firestore';
	import { getFirestoreCollection, getFirestoreDoc } from '$lib/elements/firebase/firebase';
	import { scale } from 'svelte/transition';
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import { slide } from 'svelte/transition';
	import { Project } from "$lib/elements/classes/data/project/Project";
	import { ProjectConstants } from "$lib/elements/classes/data/project/ProjectConstants";
	import { onDestroy, onMount } from "svelte";
	import Tooltip from "../general/tooltip.svelte";
	import { Member } from '$lib/elements/classes/data/project/Member';
	import Snackbar from '../general/snackbar.svelte';
	import { Ping } from '$lib/elements/classes/data/chat/Ping';
	import { StringHelper } from '$lib/elements/helpers/StringHelper';
	import { PingConstants } from '$lib/elements/classes/data/chat/PingConstants';
	import { MemberProject } from '$lib/elements/classes/data/project/MemberProject';

    export let project: Project = null;
    export let isRequested: boolean = false;
    export let isOwner: boolean = false;

    let currMember: Member = null;
    
    let existed: boolean = false;

    let inviteEmail: string = "";
    let projectName: string = project.name;
    let projectDescription: string = project.description;
    let projectColor: string = ProjectConstants.COLORS[0].hex;

    let inviteOpen: boolean = false;
    let editOpen: boolean = false;
    let deleteOpen: boolean = false;
    let leaveOpen: boolean = false;

    let inviteProcessing: boolean = false;
    let editProcessing: boolean = false;
    let deleteProcessing: boolean = false;
    let leaveProcessing: boolean = false;
    let joinProcessing: boolean = false;
    let rejectProcessing: boolean = false;
    
    let snackbarOpen: boolean = false;
    let snackbarText: string = "";
    let snackbarType: string = "neutral";

    function gotoProject(): void {
        projectSelected.set(project.id);
        localStorage.setItem('selectedProjectId', project.id);
    }

    function getCurrMember(): void {
        currentMember.subscribe((value) => {
            currMember = value;
        });
    }

    function getProject(): void {
        if (project) {
            projectColor = project.color;
        }
    }

    function hideExtras(): void {
        inviteOpen = false;
        editOpen = false;
        deleteOpen = false;
        leaveOpen = false;

        inviteEmail = "";
        projectName = project.name;
        projectDescription = project.description;
        projectColor = project.color;
    }

    function inviteMember(): void {
        inviteOpen = !inviteOpen;
        editOpen = false;
        deleteOpen = false;
        leaveOpen = false;

        if (inviteOpen) {
            inviteEmail = "";
        } else {
            hideExtras();
        }
    }

    function editProject(): void {
        inviteOpen = false;
        editOpen = !editOpen;
        deleteOpen = false;
        leaveOpen = false;

        if (editOpen) {
            projectName = project.name;
            projectDescription = project.description;
            projectColor = project.color;
        } else {
            hideExtras();
        }
    }

    function deleteProject(): void {
        inviteOpen = false;
        editOpen = false;
        deleteOpen = !deleteOpen;
        leaveOpen = false;
    }

    function leaveProject(): void {
        inviteOpen = false;
        editOpen = false;
        deleteOpen = false;
        leaveOpen = !leaveOpen;
    }

    function inviteMemberConfirmed(): void {
        if (inviteProcessing) {
            return;
        } else {
            inviteProcessing = true;
        }

        if (inviteEmail.trim().length == 0) {
            openSnackbar("Please enter an email.", "error");
            inviteProcessing = false;
            return;
        }

        if (inviteEmail.toLocaleLowerCase() == currMember.email) {
            openSnackbar("You cannot invite yourself to a project.", "error");
            inviteProcessing = false;
            return;
        }

        if (project.members.length >= ProjectConstants.MAX_NUM_MEMBERS) {
            openSnackbar(`You can only add up to ${ProjectConstants.MAX_NUM_MEMBERS} members to a project.`, "error");
            inviteProcessing = false;
            return;
        }

        if (currMember) {
            let membersCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection("members");
            let membersQuery = query(membersCollection, where("email", "==", inviteEmail.toLowerCase()));
            let memberIds: string[] = [];
            getDocs(membersQuery).then((snapshot) => {
                snapshot.forEach((doc) => {
                    let member: Member = new Member(doc.data());
                    memberIds.push(member.id);
                });
                if (memberIds.length == 0) {
                    openSnackbar("No member found with that email.", "error");
                    inviteProcessing = false;
                    return;
                } else if (memberIds.length > 1) {
                    openSnackbar("Multiple members found with that email. Please try again.", "error");
                    inviteProcessing = false;
                    return;
                } else if (memberIds[0] == currMember.id) {
                    openSnackbar("You cannot invite yourself to a project.", "error");
                    inviteProcessing = false;
                    return;
                } else if (project.joinedMemberIds.includes(memberIds[0])) {
                    openSnackbar("Member is already in the project.", "error");
                    inviteProcessing = false;
                    return;
                } else if (project.requestedMemberIds.includes(memberIds[0])) {
                    openSnackbar("Member is already requested to join the project.", "error");
                    inviteProcessing = false;
                    return;
                } else if (project.owner.id == memberIds[0]) {
                    openSnackbar("Member is already the owner of the project.", "error");
                    inviteProcessing = false;
                    return;
                }

                let memberProject: MemberProject = new MemberProject({
                    id: StringHelper.generateID(),
                    memberId: memberIds[0],
                    projectId: project.id,
                    isOwner: false,
                    hasJoined: false,
                    createdAtTemp: serverTimestamp()
                });

                let memberProjectDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('memberProjects', memberProject.id);
                setDoc(memberProjectDoc, memberProject.compactify()).then(() => {
                    openSnackbar("Successfully invited member.", "success");
                    inviteProcessing = false;
                    hideExtras();

                    let ping: Ping = new Ping({
                        id: StringHelper.generateID(),
                        memberId: memberIds[0],
                        projectId: project.id,
                        type: PingConstants.TYPES.PROJECT,
                        title: "Project request",
                        message: `Member "${currMember.displayName}" requested to add you to the project "${project.name}."`,
                        read: false,
                        createdAtTemp: new Date(),
                    });
                    let pingDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('pings', ping.id);
                    setDoc(pingDoc, ping.compactify());
                }).catch(() => {
                    openSnackbar("An error occurred while inviting the member. Please try again.", "error");
                    inviteProcessing = false;
                });
            }).catch(() => {
                openSnackbar("An error occurred while inviting the member. Please try again.", "error");
                inviteProcessing = false;
            });
        } else {
            openSnackbar("An error occurred while inviting the member. Please try again.", "error");
            inviteProcessing = false;
        }
    }

    function editProjectConfirmed(): void {
        if (editProcessing) {
            return;
        } else {
            editProcessing = true;
        }

        if (projectName == project.name && projectDescription == project.description && projectColor == project.color) {
            editProcessing = false;
            hideExtras();
            return;
        }

        if (projectName.trim() === "") {
            openSnackbar("Please enter a project name.", "error");
            editProcessing = false;
            return;
        }
        if (projectName.length > ProjectConstants.PROJECT_NAME_MAX_LENGTH) {
            openSnackbar(`Project name is too long. Max length is ${ProjectConstants.PROJECT_NAME_MAX_LENGTH} characters.`, "error");
            editProcessing = false;
            return;
        }
        if (projectDescription.trim() === "") {
            openSnackbar("Please enter a project description.", "error");
            editProcessing = false;
            return;
        }
        if (projectDescription.length > ProjectConstants.PROJECT_DESCRIPTION_MAX_LENGTH) {
            openSnackbar(`Project description is too long. Max length is ${ProjectConstants.PROJECT_DESCRIPTION_MAX_LENGTH} characters.`, "error");
            editProcessing = false;
            return;
        }
        if (projectColor.trim() === "") {
            openSnackbar("Please enter a project color.", "error");
            editProcessing = false;
            return;
        }

        if (currMember) {
            let projectDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('projects', project.id);
            let projectEdited: Project = new Project(project.compactify());
            projectEdited.name = projectName;
            projectEdited.description = projectDescription;
            projectEdited.color = projectColor;
            setDoc(projectDoc, projectEdited.compactify()).then(() => {
                for (let memberId of project.memberIds) {
                    if (memberId != project.ownerId) {
                        let ping: Ping = new Ping({
                            id: StringHelper.generateID(),
                            memberId: memberId,
                            projectId: project.id,
                            type: PingConstants.TYPES.PROJECT,
                            title: "Project edited",
                            message: `The project "${project.name}" has been edited by the owner "${project.owner.displayName} to have the name "${projectName}", description "${projectDescription}", and color "${ProjectConstants.findColorByHex(projectColor).displayName}".`,
                            read: false,
                            createdAtTemp: new Date(),
                        });
                        let pingDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('pings', ping.id);
                        setDoc(pingDoc, ping.compactify());
                    }
                }
                openSnackbar("Project successfully edited.", "success");
                editProcessing = false;
                hideExtras();
            }).catch(() => {
                openSnackbar("An error occurred while editing the project. Please try again.", "error");
                editProcessing = false;
            });
        } else {
            openSnackbar("An error occurred while editing the project. Please try again.", "error");
            editProcessing = false;
        }
    }

    function deleteProjectConfirmed(): void {
        if (deleteProcessing) {
            return;
        } else {
            deleteProcessing = true;
        }

        if (currMember) {
            let projectDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('projects', project.id);
            deleteDoc(projectDoc).then(() => {
                for (let memberProject of project.memberProjects) {
                    let memberProjectDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('memberProjects', memberProject.id);
                    deleteDoc(memberProjectDoc).then(() => {
                        let ping: Ping = new Ping({
                            id: StringHelper.generateID(),
                            memberId: memberProject.memberId,
                            projectId: project.id,
                            type: PingConstants.TYPES.PROJECT,
                            title: "Project deleted",
                            message: `The project "${project.name}" has been deleted by the owner "${project.owner.displayName}".`,
                            createdAtTemp: new Date(),
                        });
                        let pingDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('pings', ping.id);
                        setDoc(pingDoc, ping.compactify());
                    });
                }
                for (let taskId of project.taskIds) {
                    let taskDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('tasks', taskId);
                    deleteDoc(taskDoc);
                }
                for (let occasionId of project.occasionIds) {
                    let occasionDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('occasions', occasionId);
                    deleteDoc(occasionDoc);
                }
                openSnackbar("Project successfully deleted.", "success");
                deleteProcessing = false;
                hideExtras();
            }).catch(() => {
                openSnackbar("An error occurred while deleting the project. Please try again.", "error");
                deleteProcessing = false;
            });
        } else {
            openSnackbar("An error occurred while deleting the project. Please try again.", "error");
            deleteProcessing = false;
        }
    }

    function leaveProjectConfirmed(): void {
        if (leaveProcessing) {
            return;
        } else {
            leaveProcessing = true;
        }

        if (currMember) {
            let projectDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('projects', project.id);
            project.joinedMemberIds = project.joinedMemberIds.filter((id) => id != currMember.id);
            project.memberIds = project.memberIds.filter((id) => id != currMember.id);
            setDoc(projectDoc, project.compactify()).then(() => {
                let memberProject: MemberProject = project.memberProjects.find((mp) => mp.memberId == currMember.id);
                if (memberProject) {
                    let memberProjectDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('memberProjects', memberProject.id);
                    deleteDoc(memberProjectDoc).then(() => {
                        openSnackbar("Successfully left project.", "success");
                        leaveProcessing = false;
                        hideExtras();

                        let ping: Ping = new Ping({
                            id: StringHelper.generateID(),
                            memberId: project.ownerId,
                            projectId: project.id,
                            type: PingConstants.TYPES.PROJECT,
                            title: "Member left",
                            message: `Member "${currMember.displayName}" has left the project "${project.name}".`,
                            createdAtTemp: new Date(),
                        });
                        let pingDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('pings', ping.id);
                        setDoc(pingDoc, ping.compactify());
                    });
                } else {
                    openSnackbar("An error occurred while leaving the project. Please try again.", "error");
                    leaveProcessing = false;
                }
            }).catch(() => {
                openSnackbar("An error occurred while leaving the project. Please try again.", "error");
                leaveProcessing = false;
            });
        } else {
            openSnackbar("An error occurred while leaving the project. Please try again.", "error");
            leaveProcessing = false;
        }
    }

    function joinProjectConfirmed(): void {
        if (joinProcessing) {
            return;
        } else {
            joinProcessing = true;
        }

        if (currMember) {
            let projectDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('projects', project.id);
            project.joinedMemberIds.push(currMember.id);
            setDoc(projectDoc, project.compactify()).then(() => {
                let memberDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('members', currMember.id);
                currMember.projectIds.push(project.id);
                currMember.requestedProjectIds = currMember.requestedProjectIds.filter((id) => id != project.id);
                setDoc(memberDoc, currMember.compactify()).then(() => {
                    openSnackbar("Successfully joined project.", "success");
                    joinProcessing = false;
                    hideExtras();

                    let ping: Ping = new Ping({
                        id: StringHelper.generateID(),
                        memberId: project.ownerId,
                        projectId: project.id,
                        type: PingConstants.TYPES.PROJECT,
                        title: "Member joined",
                        message: `Member "${currMember.displayName}" has joined the project "${project.name}".`,
                        createdAtTemp: new Date(),
                    });
                    let pingDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('pings', ping.id);
                    setDoc(pingDoc, ping.compactify());
                }).catch(() => {
                    openSnackbar("An error occurred while joining the project. Please try again.", "error");
                    joinProcessing = false;
                });
            }).catch(() => {
                openSnackbar("An error occurred while joining the project. Please try again.", "error");
                joinProcessing = false;
            });
        } else {
            openSnackbar("An error occurred while joining the project. Please try again.", "error");
            joinProcessing = false;
        }
    }

    function rejectProjectConfirmed(): void {
        if (rejectProcessing) {
            return;
        } else {
            rejectProcessing = true;
        }

        if (currMember) {
            let projectDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('projects', project.id);
            project.memberIds = project.memberIds.filter((id) => id != currMember.id);
            setDoc(projectDoc, project.compactify()).then(() => {
                let memberDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('members', currMember.id);
                setDoc(memberDoc, currMember.compactify()).then(() => {
                    openSnackbar("Successfully rejected project.", "success");
                    rejectProcessing = false;
                    hideExtras();

                    let ping: Ping = new Ping({
                        id: StringHelper.generateID(),
                        memberId: project.ownerId,
                        projectId: project.id,
                        type: PingConstants.TYPES.PROJECT,
                        title: "Member rejected",
                        message: `Member "${currMember.displayName}" has rejected the project "${project.name}".`,
                        createdAtTemp: new Date(),
                    });
                    let pingDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('pings', ping.id);
                    setDoc(pingDoc, ping.compactify());
                }).catch(() => {
                    openSnackbar("An error occurred while rejecting the project. Please try again.", "error");
                    rejectProcessing = false;
                });
            }).catch(() => {
                openSnackbar("An error occurred while rejecting the project. Please try again.", "error");
                rejectProcessing = false;
            });
        } else {
            openSnackbar("An error occurred while rejecting the project. Please try again.", "error");
            rejectProcessing = false;            
        }
    }

    function openSnackbar(text: string, type: string): void {
        snackbarText = text;
        snackbarType = type;
        snackbarOpen = true;
    }

    onMount(() => {
        existed = true;
        getCurrMember();
        getProject();
    });

    onDestroy(() => {
        existed = false;
    });
</script>
<style>
    .project-overview-container {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 2px 2px 8px var(--grey-400);
        overflow-wrap: anywhere;
        user-select: none;

        transition: box-shadow var(--transition-duration);

        &:hover {
            box-shadow: 2px 2px 16px var(--grey-400);
        }
    }

    .project-overview-color-fill {
        width: 100%;
        height: 8px;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
    }

    .project-overview-name {
        font-size: 28px;
        font-weight: 500;
        color: var(--grey-800);
    }

    .project-overview-description {
        width: 100%;
        padding-bottom: 8px;
        margin-bottom: 8px;
        font-size: 14px;
        color: var(--grey-500);
        border-bottom: 1px solid var(--grey-400);
    }

    .project-overview-member-count {
        font-size: 12px;
        color: var(--grey-500);
    }

    .project-overview-owner {
        display: flex;
        align-items: center;
        padding-top: 8px;
        font-size: 12px;
        color: var(--grey-500);
    }

    .project-overview-owner-name {
        padding-left: 4px;
    }

    .project-overview-date {
        font-size: 10px;
        color: var(--grey-500);
    }

    .project-overview-action {
        margin-top: 8px;
        color: var(--grey-600);
        cursor: pointer;

        transition: color var(--transition-duration);

        &:hover {
            color: var(--grey-800);
        }
    }

    .project-overview-remove {
        margin-top: 8px;
        color: var(--error);
        cursor: pointer;

        transition: color var(--transition-duration);

        &:hover {
            color: var(--error-dark);
        }
    }

    .project-overview-project-field {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
    }

    .project-overview-project-input {
        box-sizing: border-box;
        width: 100%;
        padding-left: 4px;
        padding-right: 4px;
        padding-top: 2px;
        padding-bottom: 2px;
        background-color: var(--grey-200);
        outline: none;
        border: 1px solid var(--grey-400);
        border-radius: 4px;
        font-size: 12px;
        color: var(--grey-800);

        transition: border-color var(--transition-duration);

        &:hover {
            border-color: var(--accent-light);
        }

        &:focus {
            border-color: var(--accent);
        }
    }

    .project-overview-project-icon {
        margin-right: 4px;
        color: var(--grey-800);
    }

    .project-overview-project-color {
        box-sizing: border-box;
        width: 24px;
        height: 24px;
        margin-right: 4px;
        border: 3px solid transparent;
        border-radius: 16px;
        cursor: pointer;

        transition: border-color var(--transition-duration);
    }

    .project-overview-is-sure {
        font-size: 12px;
        color: var(--grey-800);
    }

    .project-overview-project-action {
        padding-left: 4px;
        padding-right: 4px;
        padding-top: 2px;
        padding-bottom: 2px;
        background-color: var(--primary);
        font-size: 12px;
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

    .project-overview-project-join {
        margin-top: 8px;
        padding-left: 4px;
        padding-right: 4px;
        padding-top: 2px;
        padding-bottom: 2px;
        background-color: var(--accent-dark);
        font-size: 12px;
        color: var(--grey-100);
        border: none;
        outline: none;
        border-radius: 4px;
        cursor: pointer;

        transition: background-color var(--transition-duration);

        &:hover {
            background-color: var(--primary-dark);
        }
    }
    
    .project-overview-project-remove {
        padding-left: 4px;
        padding-right: 4px;
        padding-top: 2px;
        padding-bottom: 2px;
        background-color: var(--error);
        font-size: 12px;
        color: var(--grey-100);
        border: none;
        outline: none;
        border-radius: 4px;
        cursor: pointer;

        transition: background-color var(--transition-duration);

        &:hover {
            background-color: var(--error-dark);
        }
    }

    .project-overview-project-cancel {
        padding-left: 4px;
        padding-right: 4px;
        padding-top: 2px;
        padding-bottom: 2px;
        background-color: var(--grey-300);
        font-size: 12px;
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

    .project-overview-goto {
        display: flex;
        align-items: center;
        margin-top: 8px;
        padding-left: 8px;
        padding-right: 4px;
        padding-top: 4px;
        padding-bottom: 4px;
        background-color: var(--primary);
        font-size: 14px;
        color: var(--grey-800);
        border: none;
        outline: none;
        border-radius: 8px;
        cursor: pointer;

        transition: background-color var(--transition-duration), color var(--transition-duration);

        &:hover {
            background-color: var(--primary-dark);
            color: var(--grey-100);
        }
    }
</style>

{#if existed && project}
    <div class="project-overview-container" transition:scale={{opacity: TransitionConstants.OPACITY, start: TransitionConstants.START, duration: TransitionConstants.DURATION}}>
        <div class="project-overview-color-fill" style="background-color: {project.color}"></div>
        <div class="project-overview-name">{project.name}</div>
        <div class="project-overview-description">{project.description}</div>
        <div class="project-overview-member-count">{project.joinedMembers.length} member{project.joinedMembers.length != 1 ? "s" : ""} joined</div>
        <div class="project-overview-member-count">{project.members.length - project.joinedMembers.length} pending member{project.members.length - project.joinedMembers.length != 1 ? "s" : ""}</div>
        <div class="project-overview-owner">
            <span class="material-symbols-rounded">supervisor_account</span>
            <div class="project-overview-owner-name">{project.owner.displayName}</div>
        </div>
        <div class="project-overview-date">Created: {StringHelper.getFormattedDate(project.createdAt)}</div>
        {#if isRequested}
            <button class="project-overview-project-join" on:click={joinProjectConfirmed}>Join project</button>
            <button class="project-overview-project-remove" on:click={rejectProjectConfirmed}>Reject request</button>
        {:else}
            {#if project.memberIds.length < ProjectConstants.MAX_NUM_MEMBERS}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <span class="project-overview-action material-symbols-rounded" style={inviteOpen ? 'color: var(--grey-800);' : ''} on:click={inviteMember}>person_add</span>
            {/if}
            {#if isOwner}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <span class="project-overview-action material-symbols-rounded" style={editOpen ? 'color: var(--grey-800);' : ''} on:click={editProject}>edit</span>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <span class="project-overview-remove material-symbols-rounded" style={deleteOpen ? 'color: var(--error-dark);' : ''} on:click={deleteProject}>delete</span>
            {:else}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <span class="project-overview-remove material-symbols-rounded" style={leaveOpen ? 'color: var(--error-dark);' : ''} on:click={leaveProject}>door_open</span>
            {/if}
            {#if inviteOpen}
                <div transition:slide={{duration: TransitionConstants.DURATION}}>
                    <div class="project-overview-project-field">
                        <span class="project-overview-project-icon material-symbols-rounded">email</span>
                        <input class="project-overview-project-input" type="text" placeholder="Enter email" bind:value={inviteEmail} />
                    </div>
                    <button class="project-overview-project-action" on:click={inviteMemberConfirmed}>Invite</button>
                    <button class="project-overview-project-cancel" on:click={hideExtras}>Cancel</button>
                </div>
            {/if}
            {#if isOwner}
                {#if editOpen}
                    <div transition:slide={{duration: TransitionConstants.DURATION}}>
                        <div class="project-overview-project-field">
                            <span class="project-overview-project-icon material-symbols-rounded">badge</span>
                            <input class="project-overview-project-input" type="text" placeholder="Project name" maxlength={ProjectConstants.PROJECT_NAME_MAX_LENGTH} bind:value={projectName} />
                        </div>
                        <div class="project-overview-project-field">
                            <span class="project-overview-project-icon material-symbols-rounded">description</span>
                            <input class="project-overview-project-input" type="text" placeholder="Project description" maxlength={ProjectConstants.PROJECT_DESCRIPTION_MAX_LENGTH} bind:value={projectDescription} />
                        </div>
                        <div class="project-overview-project-field">
                            <span class="project-overview-project-icon material-symbols-rounded">colors</span>
                            {#each ProjectConstants.COLORS as color}
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <!-- svelte-ignore a11y-no-static-element-interactions -->
                                <div class="project-overview-project-color" style="background-color: {color.hex}; {projectColor == color.hex ? 'border-color: var(--grey-800);' : ''}" on:click={() => projectColor = color.hex}>
                                    <Tooltip>{color.displayName}</Tooltip>
                                </div>
                            {/each}
                        </div>
                        <button class="project-overview-project-action" on:click={editProjectConfirmed}>Save</button>
                        <button class="project-overview-project-cancel" on:click={hideExtras}>Cancel</button>
                    </div>
                {/if}
                {#if deleteOpen}
                    <div transition:slide={{duration: TransitionConstants.DURATION}}>
                        <div class="project-overview-project-field">
                            <div class="project-overview-is-sure">Are you sure you want to delete this project?</div>
                        </div>
                        <button class="project-overview-project-remove" on:click={deleteProjectConfirmed}>Delete</button>
                        <button class="project-overview-project-cancel" on:click={hideExtras}>Cancel</button>
                    </div>
                {/if}
            {:else}
                {#if leaveOpen}
                    <div transition:slide={{duration: TransitionConstants.DURATION}}>
                        <div class="project-overview-project-field">
                            <div class="project-overview-is-sure">Are you sure you want to leave this project?</div>
                        </div>
                        <button class="project-overview-project-remove" on:click={leaveProjectConfirmed}>Leave</button>
                        <button class="project-overview-project-cancel" on:click={hideExtras}>Cancel</button>
                    </div>
                {/if}
            {/if}
        {/if}
        {#if !isRequested && !inviteOpen && !editOpen && !deleteOpen && !leaveOpen}
            <button class="project-overview-goto" on:click={gotoProject} transition:slide={{duration: TransitionConstants.DURATION}}>
                Go to project
                <span class="material-symbols-rounded">arrow_forward</span>
            </button>
        {/if}
    </div>
{/if}
<Snackbar type={snackbarType} bind:open={snackbarOpen}>{snackbarText}</Snackbar>