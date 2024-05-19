<script lang="ts">
	import { Member } from '$lib/elements/classes/data/project/Member';
	import { setDoc } from 'firebase/firestore';
	import { getFirestoreDoc } from '$lib/elements/firebase/firebase';
	import { DocumentReference } from 'firebase/firestore';
	import { Chat } from '$lib/elements/classes/data/chat/Chat';
	import { getDocs } from 'firebase/firestore';
	import { where } from 'firebase/firestore';
	import { query } from 'firebase/firestore';
	import { getFirestoreCollection } from '$lib/elements/firebase/firebase';
	import { CollectionReference, type DocumentData } from 'firebase/firestore';
	import { Project } from '$lib/elements/classes/data/project/Project';
	import Snackbar from './../lib/elements/ui/general/snackbar.svelte';
	import type { User } from 'firebase/auth';
	import { authStore } from '$lib/elements/stores/auth-store';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import { StringHelper } from '$lib/elements/helpers/StringHelper';
	import { currMember } from '$lib/elements/stores/project-store';
    
    let currentUser: User = null;
    let currentMember: Member = null;

    let createOpen: boolean = false;
    let projectName: string = "";
    let projectDescription: string = "";
    let projectColor: string = "";
    let memberEmails: string[] = [""];

    let snackbarOpen: boolean = false;
    let snackbarText: string = "";
    let snackbarType: string = "neutral";

    function createProject(): void {
        if (createOpen && currentUser && currentMember) {
            if (projectName === "") {
                openSnackbar("Please enter a project name.", "error");
                return;
            }
            if (projectDescription === "") {
                openSnackbar("Please enter a project description.", "error");
                return;
            }
            if (projectColor === "") {
                openSnackbar("Please enter a project color.", "error");
                return;
            }
            // filter empty emails, same lowercase email as lowercase current user email, and duplicate emails (lowercase)
            memberEmails = memberEmails.filter((email) => email !== "").filter((email) => email.toLowerCase() !== currentUser.email.toLowerCase()).filter((email, index, self) => self.indexOf(email) === index);
            if (memberEmails.length === 0) {
                memberEmails = [""];
                openSnackbar("Please add at least one member email.", "error");
                return;
            }

            let membersCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection("members");
            let membersQuery = query(membersCollection, where("email", "in", memberEmails));
            let memberIds: string[] = [];
            getDocs(membersQuery).then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    memberIds.push(doc.id);
                });

                let chat: Chat = new Chat({
                    id: StringHelper.generateID(),
                    messageIds: [],
                });

                let chatDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("chats", chat.id);
                setDoc(chatDoc, JSON.parse(JSON.stringify(chat))).then(() => {
                    let project: Project = new Project({
                        id: StringHelper.generateID(),
                        name: projectName,
                        description: projectDescription,
                        color: projectColor,
                        ownerId: currentUser.uid,
                        memberIds: memberIds,
                        chatId: chat.id,
                    });

                    let projectDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("projects", project.id);
                    setDoc(projectDoc, JSON.parse(JSON.stringify(project))).then(() => {
                        openSnackbar("Project created successfully.", "success");
                        cancel();
                    }).catch((error) => {
                        openSnackbar("An error occurred while creating the project.", "error");
                    });
                });
            });
        }
    }

    function cancel(): void {
        createOpen = false;
        projectName = "";
        projectDescription = "";
        projectColor = "";
        memberEmails = [""];
    }

    function removeEmail(idx: number): void {
        memberEmails = memberEmails.filter((_, index) => index !== idx);
    }

    function getUser(): void {
        authStore.subscribe((value) => {
            if (value.currentUser != null && value.currentUser.emailVerified) {
                currentUser = value.currentUser;                
            }
        });

        currMember.subscribe((value) => {
            if (value.member != null) {
                currentMember = value.member;
            }
        });
    }

    function openSnackbar(text: string, type: string): void {
        snackbarText = text;
        snackbarType = type;
        snackbarOpen = true;
    }

    onMount(() => {
        getUser();
    });
</script>
<style>
    .overview-create-project-button {
        position: absolute;
        left: 16px;
        top: 16px;
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
        color: var(--gray-800);
        cursor: pointer;
        user-select: none;  

        transition: background-color var(--transition-duration), color var(--transition-duration);

        &:hover {
            background-color: var(--primary-dark);
            color: var(--gray-100);
        }
    }

    .overview-create-project-container {
        position: absolute;
        left: 16px;
        top: 64px;
        box-sizing: border-box;
        width: calc(100% - 32px);
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
        color: var(--gray-800);
    }

    .overview-create-project-close-icon {
        margin-left: 8px;
        font-size: 24px;
        color: var(--gray-800);
        cursor: pointer;

        transition: color var(--transition-duration);

        &:hover {
            color: var(--error);
        }
    }

    .overview-create-project-input {
        width: 240px;
        padding-left: 8px;
        padding-top: 4px;
        padding-bottom: 4px;
        background-color: var(--gray-200);
        outline: none;
        border: 2px solid var(--gray-400);
        border-radius: 4px;
        font-size: 16px;
        color: var(--gray-800);

        transition: border-color var(--transition-duration);

        &:hover {
            border-color: var(--accent-light);
        }

        &:focus {
            border-color: var(--accent);
        }
    }

    .overview-create-project-email-info {
        font-size: 10px;
        color: var(--gray-500);
        margin-bottom: 8px;
    }

    .overview-create-project-email-container {
        box-sizing: border-box;
        margin-bottom: 8px;
        padding: 8px;
        border: 1px solid var(--gray-400);
        border-radius: 4px;
    }

    .overview-create-project-add-member {
        padding-left: 8px;
        padding-right: 8px;
        padding-top: 4px;
        padding-bottom: 4px;
        color: var(--gray-800);
        border: 2px solid var(--gray-400);
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
        color: var(--gray-800);
        border: none;
        outline: none;
        border-radius: 4px;
        cursor: pointer;

        transition: background-color var(--transition-duration), color var(--transition-duration);

        &:hover {
            background-color: var(--accent);
            color: var(--gray-100);
        }
    }

    .overview-create-project-cancel {
        padding-left: 8px;
        padding-right: 8px;
        padding-top: 4px;
        padding-bottom: 4px;
        background-color: var(--gray-300);
        color: var(--gray-800);
        border: none;
        outline: none;
        border-radius: 4px;
        cursor: pointer;

        transition: background-color var(--transition-duration);

        &:hover {
            background-color: var(--gray-400);
        }
    }
</style>

{#if currentUser && currentMember}
    <button class="overview-create-project-button" on:click={() => createOpen = true}>
        <span class="material-symbols-rounded">add</span>
        Create Project
    </button>
    {#if createOpen}
        <div class="overview-create-project-container" transition:slide={{duration: TransitionConstants.DURATION}}>
            <form on:submit|preventDefault={createProject}>
                <div class="overview-create-project-field">
                    <span class="overview-create-project-icon material-symbols-rounded">badge</span>
                    <input class="overview-create-project-input" type="text" placeholder="Project Name" bind:value={projectName} />
                </div>
                <div class="overview-create-project-field">
                    <span class="overview-create-project-icon material-symbols-rounded">description</span>
                    <input class="overview-create-project-input" type="text" placeholder="Project Description" bind:value={projectDescription} />
                </div>
                <div class="overview-create-project-field">
                    <span class="overview-create-project-icon material-symbols-rounded">colors</span>
                    <input class="overview-create-project-input" type="text" placeholder="Project Color" bind:value={projectColor} />
                </div>
                <div class="overview-create-project-email-container">
                    <div>Member emails</div>
                    <div class="overview-create-project-email-info">*If they have an account, they will receive a notification. Otherwise, they will not be added.</div>
                    {#each memberEmails as email, i}
                        <div class="overview-create-project-field">
                            <span class="overview-create-project-icon material-symbols-rounded">email</span>
                            <input class="overview-create-project-input" placeholder="Member Email" bind:value={email} />
                            {#if memberEmails.length > 1}
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <!-- svelte-ignore a11y-no-static-element-interactions -->
                                <span class="overview-create-project-close-icon material-symbols-rounded" on:click={() => removeEmail(i)}>close</span>
                            {/if}
                        </div>
                    {/each}
                    <button class="overview-create-project-add-member" type="button" on:click={() => memberEmails = [...memberEmails, ""]}>Add Member</button>
                </div>
                <button class="overview-create-project-create" type="submit">Create</button>
                <button class="overview-create-project-cancel" on:click={cancel}>Cancel</button>
            </form>
        </div>
    {/if}
{/if}
<Snackbar text={snackbarText} type={snackbarType} bind:open={snackbarOpen} />