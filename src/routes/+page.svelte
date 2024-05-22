<svelte:head>
    <title>Buzby | {!isOverview && currentProject ? currentProject.name : 'Overview'}</title>
</svelte:head>
<script lang="ts">
	import { projectSelected } from '$lib/elements/stores/project-store';
	import { Member } from '$lib/elements/classes/data/project/Member';
	import { Project } from '$lib/elements/classes/data/project/Project';
	import Snackbar from '$lib/elements/ui/general/snackbar.svelte';
	import type { User } from 'firebase/auth';
	import { userStatus } from '$lib/elements/stores/auth-store';
	import { onMount } from 'svelte';
	import { memberStatus } from '$lib/elements/stores/project-store';
	import { ProjectConstants } from '$lib/elements/classes/data/project/ProjectConstants';
	import Overview from '$lib/elements/ui/main/overview.svelte';
    
    let currentUser: User = null;
    let currentMember: Member = null;
    let isOverview: boolean = true;
    let currentProject: Project = null;

    let snackbarOpen: boolean = false;
    let snackbarText: string = "";
    let snackbarType: string = "neutral";

    function getUser(): void {
        userStatus.subscribe((value) => {
            if (value.currentUser != null && value.currentUser.emailVerified) {
                currentUser = value.currentUser;                
            }
        });

        memberStatus.subscribe((value) => {
            if (value.currentMember != null) {
                currentMember = value.currentMember;
            }
        });
    }

    function getProject(): void {
        projectSelected.subscribe((value) => {
            isOverview = value.projectName == ProjectConstants.DEFAULT_PROJECT_NAME;
            currentProject = value.project;
        });
    }

    function openSnackbar(text: string, type: string): void {
        snackbarText = text;
        snackbarType = type;
        snackbarOpen = true;
    }

    onMount(() => {
        getUser();
        getProject();
    });
</script>
<style>
    
</style>

{#if currentUser && currentMember}
    {#if isOverview}
        <Overview />
    {:else}
        
    {/if}
{/if}

<Snackbar type={snackbarType} bind:open={snackbarOpen}>{snackbarText}</Snackbar>