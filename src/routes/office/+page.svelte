<svelte:head>
    <title>Buzby | Office</title>
</svelte:head>
<script lang="ts">
	import { allProjects } from '$lib/elements/stores/project-store';
	import { getDoc } from 'firebase/firestore';
	import { getFirestoreDoc } from '$lib/elements/firebase/firebase';
	import { DocumentReference, type DocumentData } from 'firebase/firestore';
	import ProgressCircle from '$lib/elements/ui/general/progress-circle.svelte';
	import { MemberConstants } from '$lib/elements/classes/data/project/MemberConstants';
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import { fade } from 'svelte/transition';
	import { projectSelected } from '$lib/elements/stores/project-store';
	import { Project } from "$lib/elements/classes/data/project/Project";
	import Discussion from "$lib/elements/ui/office/discussion.svelte";
	import MemberStatus from '$lib/elements/ui/office/member-status.svelte';
	import { onMount } from 'svelte';
	import { MathHelper } from '$lib/elements/helpers/MathHelper';
	import { Vector2 } from 'three';

    let project: Project = null;

    let memberAngles: number[] = [];
    let memberOffsets: Vector2[] = [];
    let memberPositions: Vector2[] = [];

    let officeRefreshPercentage: number = 100;

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

    function refreshProject(): void {
        if (officeRefreshPercentage >= 100) {
            officeRefreshPercentage = 0;
            let projectDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('projects', project.id);
            getDoc(projectDoc).then(async (doc) => {
                let project: Project = new Project(doc.data());
                await project.setObjects();
                projectSelected.update((value) => {
                    value.project = project;
                    return value;
                });
                allProjects.update((value) => {
                    value.projects = value.projects.map((p) => {
                        if (p.id === project.id) {
                            return project;
                        }
                        return p;
                    });
                    return value;
                })
                officeRefreshPercentage = 0;
                setMemberStatusPositions();
            });
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
    .office-title-container {
        display: flex;
        align-items: center;
        padding: 8px;
        border-bottom: 1px solid var(--grey-300);
    }

    .office-title {
        font-size: 16px;
        font-weight: 500;
        color: var(--grey-800);
    }

    .office-title-icon-progress-circle-container {
        position: absolute;
        left: 60px;
        margin-top: -1px;
    }

    .office-title-icon-button {
        position: absolute;
        left: 62px;
        font-size: 24px;
        color: var(--grey-800);
        cursor: pointer;
        transition: color var(--transition-duration);

        &:hover {
            color: var(--accent);
        }
    }

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
    <div class="office-title-container">
        <div class="office-title">Office</div>
        <div class="office-title-icon-progress-circle-container">
            <ProgressCircle radius={12} bind:percentage={officeRefreshPercentage} storageName="projectRefreshPercentage" autoFill={true} autofillTime={MemberConstants.REFRESH_TIMEOUT} />
        </div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="office-title-icon-button material-symbols-rounded" on:click={() => refreshProject()}>refresh</span>
    </div>
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