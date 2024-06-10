<script lang="ts">
	import type { Project } from "$lib/elements/classes/data/project/Project";
	import type { Task } from "$lib/elements/classes/data/time/Task";
	import { TransitionConstants } from "$lib/elements/classes/ui/core/TransitionConstants";
	import { projectSelected } from "$lib/elements/stores/project-store";
	import { onMount } from "svelte";
	import { fly } from "svelte/transition";
	import HiveTask from "./hive-task.svelte";

    let project: Project = null;
    let tasks: Task[] = [];
    let projectPercentage: number = 0;

    function getProject(): void {
        projectSelected.subscribe((value) => {
            if (value.project) {
                project = value.project;

                if (project.tasks.length == tasks.length) {
                    getTasks();
                }
                else {
                    tasks = [];
                    setTimeout(() => {
                        getTasks();
                    });
                }
            }
        });
    }

    function getTasks(): void {
        tasks = project.tasks;

        let total = 0;
        for (let task of tasks) {
            total += task.percentage;
        }
        projectPercentage = total / tasks.length;

        tasks.sort((a, b) => { return a.endDate.getTime() - b.endDate.getTime(); });
    }

    onMount(() => {
        getProject();
    });
</script>
<style>
    .hive-list-container {
        position: absolute;
        right: 0;
        top: 0;
        width: 40%;
        min-width: 150px;
        height: 100%;
        background-color: var(--off-white-light);
        border-left: 1px solid var(--grey-300);
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    }

    .hive-list-title-container {
        display: flex;
        align-items: center;
        padding: 8px;
        border-bottom: 1px solid var(--grey-300);
    }

    .hive-list-title {
        font-size: 16px;
        font-weight: 500;
        color: var(--grey-800);
    }

    .hive-list-progress-container {
        width: 100%;
        margin-left: 24px;
        display: flex;
        align-items: center;
    }

    .hive-list-progress-title {
        width: 78px;
        text-align: left;
        font-size: 14px;
        font-weight: 500;
        color: var(--grey-800);
    }

    .hive-list-progress-bar-container {
        width: 100%;
        height: 8px;
        border-radius: 4px;
        background: var(--grey-300);
    }

    .hive-list-progress-bar {
        height: 8px;
        border-radius: 4px;
        background: linear-gradient(to right, var(--accent-light), var(--accent), var(--accent-dark));

        transition: width var(--transition-duration);
    }

    .hive-list-progress {
        width: 52px;
        text-align: right;
        font-size: 14px;
        font-weight: 500;
        color: var(--grey-800);
    }
    
    .hive-list-tasks-container {
        padding: 8px;
        overflow-y: auto;
        height: calc(100% - 48px);
    }
</style>
<div class="hive-list-container" transition:fly={{x: "40%", duration: TransitionConstants.DURATION}}>
    <div class="hive-list-title-container">
        <div class="hive-list-title">Tasks</div>
        <div class="hive-list-progress-container">
            <div class="hive-list-progress-title">Overall</div>
            <div class="hive-list-progress-bar-container">
                <div class="hive-list-progress-bar" style="width: {projectPercentage}%"></div>
            </div>
            <div class="hive-list-progress">{Math.round(projectPercentage)}%</div>
        </div>
    </div>
    <div class="hive-list-tasks-container">
        {#each tasks as task}
            <HiveTask task={task} project={project} />
        {/each}
    </div>
</div>