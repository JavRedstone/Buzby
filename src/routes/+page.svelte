<script lang="ts">
	import type { User } from 'firebase/auth';
	import { authStore } from '$lib/elements/stores/authStore';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
    
    let currentUser: User = null;

    let createOpen: boolean = false;

    let memberEmails: string[] = [""];

    function createGroup(): void {

    }

    function getUser(): void {
        authStore.subscribe((value) => {
            currentUser = value.currentUser;
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

        transition: background-color 0.2s, color 0.2s;

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
        background-color: var(--primary-lighter);
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

    .overview-create-group-input {
        width: 240px;
        padding-left: 8px;
        padding-top: 4px;
        padding-bottom: 4px;
        background-color: var(--off-white);
        border: 2px solid var(--gray-400);
        border-radius: 4px;
        font-size: 16px;
        color: var(--gray-800);
    }

    .overview-create-group-email-info {
        font-size: 10px;
        color: var(--gray-500);
        margin-bottom: 8px;
    }
</style>

{#if currentUser}
    <button class="overview-create-group-button" on:click={() => createOpen = true}>
        <span class="material-symbols-rounded">add</span>
        Create Group
    </button>
    {#if createOpen}
        <div class="overview-create-group-container" transition:slide={{duration: 300}}>
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
                <div>Member emails</div>
                <div class="overview-create-group-email-info">*If they have an account, they will receive a notification. Otherwise, they will not be added.</div>
                {#each memberEmails as email}
                    <div class="overview-create-group-field">
                        <span class="overview-create-group-icon material-symbols-rounded">email</span>
                        <input class="overview-create-group-input" type="email" placeholder="Member Email" bind:value={email} />
                    </div>
                {/each}
                <button type="submit">Create Group</button>
            </form>
        </div>
    {/if}
{/if}