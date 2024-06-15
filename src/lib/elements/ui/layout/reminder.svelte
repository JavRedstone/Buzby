<svelte:head>
    <title>Buzby | Reminder</title>
</svelte:head>
<script lang="ts">
    import { userStatus } from '$lib/elements/stores/auth-store';
    import type { User } from 'firebase/auth';
    import { onMount } from 'svelte';

    let currentUser: User = null;

    function getUser(): void {
        userStatus.subscribe((value) => {
            currentUser = value.currentUser;
        });
    }

    onMount(() => {
        getUser();
    });
</script>
<style>
    .reminder-text {
        margin-left: 16px;
        margin-top: 16px;
        font-size: 16px;
        font-weight: 500;
        color: var(--primary-dark);
    }
</style>
{#if currentUser == null}
    <div class="reminder-text">You are not logged in. Please log in to access this page.</div>
{/if}