<svelte:head>
    <title>Buzby</title>
</svelte:head>
<script lang="ts">
	import { projectSelected } from '$lib/elements/stores/project-store';
	import { Member } from '$lib/elements/classes/data/project/Member';
	import { Project } from '$lib/elements/classes/data/project/Project';
	import Snackbar from '$lib/elements/ui/general/snackbar.svelte';
	import type { User } from 'firebase/auth';
	import { onMount } from 'svelte';
	import { currentMember } from '$lib/elements/stores/project-store';
	import { ProjectConstants } from '$lib/elements/classes/data/project/ProjectConstants';
	import Overview from '$lib/elements/ui/main/overview.svelte';
	import Home from '$lib/elements/ui/layout/home.svelte';
    
    let currUser: User = null;
    let currMember: Member = null;
    let isOverview: boolean = true;
    let currentProject: Project = null;

    let snackbarOpen: boolean = false;
    let snackbarText: string = "";
    let snackbarType: string = "neutral";

    function getCurrMember(): void {
        currentMember.subscribe((value) => {
            currMember = value;
            if (currMember != null) {
                projectSelected.subscribe((value) => {
                    currentProject = currMember.projects.find((p) => p.id == value);
                    if (currentProject) {
                        isOverview = currentProject.name == ProjectConstants.DEFAULT_PROJECT_NAME;
                    }
                });
            }
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
    
</style>

{#if currMember}
    {#if isOverview}
        <Overview />
    {/if}
{:else}
    <Home />
{/if}

<Snackbar type={snackbarType} bind:open={snackbarOpen}>{snackbarText}</Snackbar>