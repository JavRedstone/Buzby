<script lang="ts">
	import { Member } from '$lib/elements/classes/data/project/Member';
	import Snackbar from './../general/snackbar.svelte';
	import { Project } from '$lib/elements/classes/data/project/Project';
	import Avatar from './../general/avatar.svelte';
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import type { Task } from "$lib/elements/classes/data/time/Task";
	import { onMount } from "svelte";
	import { scale } from "svelte/transition";
	import { memberStatus, projectSelected } from '$lib/elements/stores/project-store';

    export let task: Task = null;
    export let project: Project = null;
    
    let existed: boolean = false;

    let currMember: Member = null;
    let assigned: Member[] = [];

    let snackbarOpen: boolean = false;
    let snackbarText: string = "";
    let snackbarType: string = "neutral";

    function getCurrMember(): void {
        memberStatus.subscribe((status) => {
            currMember = status.currentMember;
        });
    }

    async function getAssigned(): Promise<void> {
        if (task) {
            assigned = [];
            for (let assignedId of task.assignedIds) {
                let found: boolean = false;
                for (let member of project.members) {
                    if (member.id === assignedId) {
                        assigned = [...assigned, member];
                        found = true;
                    }
                }
                if (!found) {
                    await task.getAssigned(assignedId).then((member) => {
                        assigned = [...assigned, member];
                    }).catch((error) => {
                        openSnackbar("There was an error getting the assigned members. Please try again.", "error");
                    });
                }
            }
        }
    }

    function getProject(): void {
        projectSelected.subscribe((value) => {
            if (value.project) {
                project = value.project;
                for (let t of project.tasks) {
                    if (task.id === t.id) {
                        task = t;
                    }
                }
                getAssigned();
            }
        });
    }

    function openSnackbar(text: string, type: string): void {
        snackbarText = text;
        snackbarType = type;
        snackbarOpen = true;
    }

    onMount(() => {
        existed = true;
        getCurrMember();
        getAssigned();
        getProject();
    });
</script>
<style>
    .hive-task-container {
        box-sizing: border-box;
        width: 100%;
        padding: 16px;
        margin-bottom: 8px;
        border-radius: 8px;
        box-shadow: 2px 2px 8px var(--grey-400);
        overflow-wrap: anywhere;
        user-select: none;

        transition: box-shadow var(--transition-duration);

        &:hover {
            box-shadow: 2px 2px 16px var(--grey-400);
        }
    }

    .hive-task-progress-container {
        display: flex;
        align-items: center;
    }

    .hive-task-progress-bar-container {
        width: 100%;
        height: 8px;
        border-radius: 4px;
        background: var(--grey-300);
    }

    .hive-task-progress-bar {
        height: 8px;
        border-radius: 4px;
        background: linear-gradient(to right, var(--primary-light), var(--primary), var(--primary-dark));

        transition: width var(--transition-duration);
    }

    .hive-task-progress {
        width: 52px;
        text-align: right;
        font-size: 14px;
        font-weight: 500;
        color: var(--grey-800);
    }

    .hive-task-name {
        font-size: 22px;
        font-weight: 500;
        color: var(--grey-800);
    }

    .hive-task-description {
        width: 100%;
        margin-bottom: 4px;
        font-size: 14px;
        color: var(--grey-500);
    }

    .hive-task-assigned-member-subtitle {
        font-size: 16px;
        font-weight: 500;
        color: var(--grey-800);
    }

    .hive-task-assigned-member-container {
        display: flex;
        align-items: center;
        margin-right: 8px;
        margin-top: 8px;
    }

    .hive-task-assigned-name {
        margin-left: 8px;
        font-size: 14px;
        color: var(--grey-800);
    }
</style>
{#if existed && task}
    <div class="hive-task-container" transition:scale={{opacity: TransitionConstants.OPACITY, start: TransitionConstants.START, duration: TransitionConstants.DURATION}}>
        <div class="hive-task-name">{task.name}</div>
        <div class="hive-task-description">{task.description}</div>
        <div class="hive-task-progress-container">
            <div class="hive-task-progress-bar-container">
                <div class="hive-task-progress-bar" style="width: {task.percentage}%"></div>
            </div>
            <div class="hive-task-progress">{Math.round(task.percentage)}%</div>
        </div>
        <div class="hive-task-assigned-member-subtitle">Assigned Members</div>
        {#each assigned as member}
            {#if member}
                <div class="hive-task-assigned-member-container">
                    <Avatar member={member} size="28px" />
                    <div class="hive-task-assigned-name" style={currMember && member.id == currMember.id ? "font-weight: 600" : ""}>{member.displayName}</div>
                </div>
            {/if}
        {/each}
    </div>
{/if}
<Snackbar type={snackbarType} bind:open={snackbarOpen}>{snackbarText}</Snackbar>