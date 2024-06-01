<svelte:head>
    <title>Buzby | Office</title>
</svelte:head>
<script lang="ts">
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import { fade } from 'svelte/transition';
	import { projectSelected } from '$lib/elements/stores/project-store';
	import type { Project } from "$lib/elements/classes/data/project/Project";
	import Discussion from "$lib/elements/ui/office/discussion.svelte";
	import MemberStatus from '$lib/elements/ui/office/member-status.svelte';
	import { onMount } from 'svelte';
	import { MathHelper } from '$lib/elements/helpers/MathHelper';
	import { Vector2 } from 'three';

    let project: Project = null;

    let memberAngles: number[] = [];
    let memberOffsets: Vector2[] = [];
    let memberPositions: Vector2[] = [];

    function getProject(): void {
        projectSelected.subscribe((value) => {
            project = value.project;

            setMemberStatusPositions();
        })
    }

    function setMemberStatusPositions(): void {
        if (project && project.joinedMembers) {
            memberOffsets = [];
            memberPositions = [];
            memberAngles = MathHelper.getAnglesForPolygon(project.joinedMembers.length);
            for (let i = 0; i < project.joinedMembers.length; i++) {
                let offset: Vector2 = MathHelper.getOffsetForAngle(memberAngles[i], -Math.PI / 2, window.innerWidth / 8);
                memberOffsets.push(offset);
                memberPositions.push(offset.clone().add(new Vector2(window.innerWidth / 4, window.innerHeight / 2)));
            }
        }
    }

    function setupWindow(): void {
        window.addEventListener('resize', () => {
            setMemberStatusPositions();
        })
    }
    
    onMount(() => {
        getProject();
        setupWindow();
    })
</script>
<style>
    .office-table {
        position: absolute;
        top: 50%;
        left: 25%;
        transform: translate(-50%, -50%);
        width: calc(25vw - 84px);
        height: calc(25vw - 84px);
        background: linear-gradient(135deg, var(--primary-light), var(--primary), var(--primary-dark));
        border-radius: 100%;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
    }

    .office-table-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 64px;
        color: var(--primary-dark);
    }
</style>
<div transition:fade={{duration: TransitionConstants.DURATION}}>
    <div class="office-table">
        <span class="office-table-icon material-symbols-rounded">diversity_2</span>
    </div>
    {#if project}
        {#each project.joinedMembers as member, i}
            <MemberStatus member={member} x={memberPositions[i].x} y={memberPositions[i].y} nameAbove={memberOffsets[i].y >= 0} />
        {/each}
    {/if}
</div>
<Discussion />