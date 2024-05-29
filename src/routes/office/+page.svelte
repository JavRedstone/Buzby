<svelte:head>
    <title>Buzby | Office</title>
</svelte:head>
<script lang="ts">
	import { projectSelected } from '$lib/elements/stores/project-store';
	import type { Project } from "$lib/elements/classes/data/project/Project";
	import Discussion from "$lib/elements/ui/office/discussion.svelte";

    let project: Project = null;

    function getProject(): void {
        projectSelected.subscribe((value) => {
            project = value.project;
        })
    }
    

</script>
<style>
    
</style>
{#if project}
    {#each project.members as member}
    {/each}
{/if}
<Discussion />