<script lang="ts">
	import type { User } from 'firebase/auth';
	import { authStore } from '$lib/elements/stores/auth-store';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
    
    let currentUser: User = null;

    let createOpen: boolean = false;
    let groupName: string = "";
    let groupDescription: string = "";
    let groupColor: string = "";
    let memberEmails: string[] = [""];

    function createGroup(): void {

    }

    function cancel(): void {
        createOpen = false;
        groupName = "";
        groupDescription = "";
        groupColor = "";
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
    }

    onMount(() => {
        getUser();
    });
</script>
<style>
    .overview-create-group-button {
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

        transition: background-color var(--transition-duration), color var(--transition-duration);

        &:hover {
            background-color: var(--primary-dark);
            color: var(--gray-100);
        }
    }

    .overview-create-group-container {
        position: absolute;
        left: 16px;
        top: 64px;
        box-sizing: border-box;
        width: calc(100% - 32px);
        padding: 16px;
        background-color: rgba(var(--primary-rgb), 0.025);
        border: 1px solid var(--primary);
        border-radius: 8px;
    }

    .overview-create-group-field {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
    }

    .overview-create-group-icon {
        margin-right: 8px;
        font-size: 36px;
        color: var(--gray-800);
    }

    .overview-create-group-close-icon {
        margin-left: 8px;
        font-size: 24px;
        color: var(--gray-800);
        cursor: pointer;

        transition: color var(--transition-duration);

        &:hover {
            color: var(--error);
        }
    }

    .overview-create-group-input {
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

    .overview-create-group-email-info {
        font-size: 10px;
        color: var(--gray-500);
        margin-bottom: 8px;
    }

    .overview-create-group-email-container {
        box-sizing: border-box;
        margin-bottom: 8px;
        padding: 8px;
        border: 1px solid var(--gray-400);
        border-radius: 4px;
    }

    .overview-create-group-add-member {
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

    .overview-create-group-create {
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

    .overview-create-group-cancel {
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

{#if currentUser}
    <button class="overview-create-group-button" on:click={() => createOpen = true}>
        <span class="material-symbols-rounded">add</span>
        Create Group
    </button>
    {#if createOpen}
        <div class="overview-create-group-container" transition:slide={{duration: TransitionConstants.DURATION}}>
            <form>
                <div class="overview-create-group-field">
                    <span class="overview-create-group-icon material-symbols-rounded">badge</span>
                    <input class="overview-create-group-input" type="text" placeholder="Group Name" />
                </div>
                <div class="overview-create-group-field">
                    <span class="overview-create-group-icon material-symbols-rounded">description</span>
                    <input class="overview-create-group-input" type="text" placeholder="Group Description" />
                </div>
                <div class="overview-create-group-field">
                    <span class="overview-create-group-icon material-symbols-rounded">colors</span>
                    <input class="overview-create-group-input" type="text" placeholder="Group Color" />
                </div>
                <div class="overview-create-group-email-container">
                    <div>Member emails</div>
                    <div class="overview-create-group-email-info">*If they have an account, they will receive a notification. Otherwise, they will not be added.</div>
                    {#each memberEmails as email, i}
                        <div class="overview-create-group-field">
                            <span class="overview-create-group-icon material-symbols-rounded">email</span>
                            <input class="overview-create-group-input" type="email" placeholder="Member Email" bind:value={email} />
                            {#if memberEmails.length > 1}
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <!-- svelte-ignore a11y-no-static-element-interactions -->
                                <span class="overview-create-group-close-icon material-symbols-rounded" on:click={() => removeEmail(i)}>close</span>
                            {/if}
                        </div>
                    {/each}
                    <button class="overview-create-group-add-member" type="button" on:click={() => memberEmails = [...memberEmails, ""]}>Add Member</button>
                </div>
                <button class="overview-create-group-create" type="submit">Create</button>
                <button class="overview-create-group-cancel" on:click={cancel}>Cancel</button>
            </form>
        </div>
    {/if}
{/if}