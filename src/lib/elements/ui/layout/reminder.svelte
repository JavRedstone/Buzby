<svelte:head>
    <title>Buzby | Reminder</title>
</svelte:head>
<script lang="ts">
    import { currentUser } from '$lib/elements/stores/auth-store';
    import type { User } from 'firebase/auth';
    import { onMount } from 'svelte';

    let currUser: User = null;

    function getUser(): void {
        currentUser.subscribe((value) => {
            currUser = value;
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
{#if currUser == null}
    <div class="reminder-text">You are not logged in. Please log in to access this page.</div>
{/if}