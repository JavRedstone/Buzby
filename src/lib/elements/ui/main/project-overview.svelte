<script lang="ts">
	import { allProjects, memberStatus } from '$lib/elements/stores/project-store';
	import { CollectionReference, DocumentReference, deleteDoc, getDocs, query, setDoc, where, type DocumentData } from 'firebase/firestore';
	import { getFirestoreCollection, getFirestoreDoc } from '$lib/elements/firebase/firebase';
	import { scale } from 'svelte/transition';
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import { slide } from 'svelte/transition';
	import { Project } from "$lib/elements/classes/data/project/Project";
	import { ProjectConstants } from "$lib/elements/classes/data/project/ProjectConstants";
	import { onMount } from "svelte";
	import Tooltip from "../general/tooltip.svelte";
	import type { Member } from '$lib/elements/classes/data/project/Member';
	import Snackbar from '../general/snackbar.svelte';

    export let project: Project = null;
    export let isRequested: boolean = false;

    let currMember: Member = null;
    
    let existed: boolean = false;

    let inviteEmail: string = "";
    let projectName: string = project.name;
    let projectDescription: string = project.description;
    let projectColor: string = ProjectConstants.COLORS[0].hex;

    let inviteOpen: boolean = false;
    let editOpen: boolean = false;
    let deleteOpen: boolean = false;
    
    let snackbarOpen: boolean = false;
    let snackbarText: string = "";
    let snackbarType: string = "neutral";

    function getUser(): void {
        memberStatus.subscribe((value) => {
            currMember = value.currentMember;
        });
    }

    function inviteMember(): void {
        inviteOpen = true;
        editOpen = false;
        deleteOpen = false;
    }

    function editProject(): void {
        inviteOpen = false;
        editOpen = true;
        deleteOpen = false;
    }

    function deleteProject(): void {
        inviteOpen = false;
        editOpen = false;
        deleteOpen = true;
    }

    function inviteProjectConfirmed(): void {
        if (inviteEmail.length == 0) {
            return;
        }

        // let membersCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection("members");
        // let membersQuery = query(membersCollection, where("email", "==", inviteEmail));
        // let memberIds: string[] = [];
        // let members: Member[] = [];
        // getDocs(membersQuery).then((querySnapshot) => {


        let projectDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('projects', project.id);
    }

    function editProjectConfirmed(): void {
        if (projectName == project.name && projectDescription == project.description && projectColor == project.color) {
            hideExtras();
            return;
        }

        if (projectName.trim() === "") {
            openSnackbar("Please enter a project name.", "error");
            return;
        }
        if (projectName.length > ProjectConstants.PROJECT_NAME_MAX_LENGTH) {
            openSnackbar("Project name is too long.", "error");
            return;
        }
        if (projectDescription.trim() === "") {
            openSnackbar("Please enter a project description.", "error");
            return;
        }
        if (projectDescription.length > ProjectConstants.PROJECT_DESCRIPTION_MAX_LENGTH) {
            openSnackbar("Project description is too long.", "error");
            return;
        }
        if (projectColor.trim() === "") {
            openSnackbar("Please enter a project color.", "error");
            return;
        }

        let projectDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('projects', project.id);
        let projectEdited: Project = new Project(project.compactify());
        projectEdited.name = projectName;
        projectEdited.description = projectDescription;
        projectEdited.color = projectColor;
        setDoc(projectDoc, projectEdited.compactify()).then(() => {
            allProjects.update((value) => {
                value.projects = value.projects.map((p) => {
                    if (p.id == project.id) {
                        p.name = projectName;
                        p.description = projectDescription;
                        p.color = projectColor;
                    }
                    return p;
                });
                return value;
            });

            hideExtras();
        });
    }

    function deleteProjectConfirmed(): void {
        let projectDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('projects', project.id);
        deleteDoc(projectDoc).then(() => {
            let chatDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('chats', project.chatId);
            deleteDoc(chatDoc).then(async () => {
                for (let member of project.members) {
                    member.projectIds = member.projectIds.filter((id) => id != project.id);
                    member.requestedProjectIds = member.requestedProjectIds.filter((id) => id != project.id);
                    if (member.id == currMember.id) {
                        memberStatus.update((value) => {
                            value.currentMember = member;
                            return value;
                        });
                    }   
                    let memberDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('members', member.id);
                    await setDoc(memberDoc, member.compactify());
                }
                allProjects.update((value) => {
                    value.projects = value.projects.filter((p) => p.id != project.id);
                    return value;
                });
                openSnackbar("Project successfully deleted.", "success");
                hideExtras();
            }).catch(() => {
                openSnackbar("An error occurred while deleting the project. Please try again.", "error");
            });
        });
    }

    function joinProjectConfirmed(): void {
        let projectDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('projects', project.id);
        project.joinedMemberIds.push(currMember.id);
        project.joinedMembers.push(currMember);
        setDoc(projectDoc, project.compactify()).then(() => {
            let memberDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('members', currMember.id);
            currMember.projectIds.push(project.id);
            currMember.requestedProjectIds = currMember.requestedProjectIds.filter((id) => id != project.id);
            setDoc(memberDoc, currMember.compactify()).then(() => {
                memberStatus.update((value) => {
                    value.currentMember = currMember;
                    return value;
                });
                openSnackbar("Successfully joined project.", "success");
            }).catch(() => {
                openSnackbar("An error occurred while joining the project. Please try again.", "error");
            });
        }).catch(() => {
            openSnackbar("An error occurred while joining the project. Please try again.", "error");
        });
    }

    function hideExtras(): void {
        inviteOpen = false;
        editOpen = false;
        deleteOpen = false;
    }

    function openSnackbar(text: string, type: string): void {
        snackbarText = text;
        snackbarType = type;
        snackbarOpen = true;
    }

    onMount(() => {
        existed = true;
        projectColor = project.color;
        getUser();
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
        cursor: pointer;
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
    }

    .project-overview-delete {
        margin-top: 8px;
        color: var(--error);
    }

    .project-overview-project-field {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
    }

    .project-overview-project-email-info {
        font-size: 10px;
        color: var(--grey-500);
    }

    .project-overview-project-input {
        box-sizing: border-box;
        width: 100%;
        padding-left: 4px;
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
        background-color: var(--primary-dark);
        font-size: 12px;
        color: var(--grey-100);
        border: none;
        outline: none;
        border-radius: 4px;
        cursor: pointer;

        transition: background-color var(--transition-duration);

        &:hover {
            background-color: var(--accent-dark);
        }
    }

    .project-overview-project-delete {
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
</style>

{#if existed}
    <div class="project-overview-container" transition:scale={{opacity: 0, start: 0.9, duration: TransitionConstants.DURATION}}>
        <div class="project-overview-color-fill" style="background-color: {project.color}"></div>
        <div class="project-overview-name">{project.name}</div>
        <div class="project-overview-description">{project.description}</div>
        <div class="project-overview-member-count">{project.joinedMembers.length} member{project.joinedMembers.length != 1 ? "s" : ""} joined</div>
        <div class="project-overview-member-count">{project.members.length - project.joinedMembers.length} pending member{project.members.length - project.joinedMembers.length != 1 ? "s" : ""}</div>
        <div class="project-overview-owner">
            <span class="material-symbols-rounded">supervisor_account</span>
            <div class="project-overview-owner-name">{project.owner.displayName}</div>
        </div>
        <div class="project-overview-date">Created: {project.createdAt.toString()}</div>
        {#if isRequested}
            <button class="project-overview-project-join" on:click={joinProjectConfirmed}>Join Project</button>
        {:else}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-missing-attribute -->
            <a on:click={inviteMember}>
                <span class="project-overview-action material-symbols-rounded">person_add</span>
            </a>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-missing-attribute -->
            <a on:click={editProject}>
                <span class="project-overview-action material-symbols-rounded">edit</span>
            </a>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-missing-attribute -->
            <a on:click={deleteProject}>
                <span class="project-overview-delete material-symbols-rounded">delete</span>
            </a>
            {#if inviteOpen}
                <div transition:slide={{duration: TransitionConstants.DURATION}}>
                    <div class="project-overview-project-field">
                        <div class="project-overview-project-email-info">*If they have an account, they will receive a ping. Otherwise, they will not be added.</div>
                        <input class="project-overview-project-input" type="text" placeholder="Enter email" bind:value={inviteEmail} />
                    </div>
                    <button class="project-overview-project-action" on:click={inviteProjectConfirmed}>Invite</button>
                    <button class="project-overview-project-cancel" on:click={hideExtras}>Cancel</button>
                </div>
            {/if}
            {#if editOpen}
                <div transition:slide={{duration: TransitionConstants.DURATION}}>
                    <div class="project-overview-project-field">
                        <input class="project-overview-project-input" type="text" placeholder="Project name" maxlength={ProjectConstants.PROJECT_NAME_MAX_LENGTH} bind:value={projectName} />
                    </div>
                    <div class="project-overview-project-field">
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
                    <button class="project-overview-project-delete" on:click={deleteProjectConfirmed}>Delete</button>
                    <button class="project-overview-project-cancel" on:click={hideExtras}>Cancel</button>
                </div>
            {/if}
        {/if}
    </div>
{/if}
<Snackbar type={snackbarType} bind:open={snackbarOpen}>{snackbarText}</Snackbar>