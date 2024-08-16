<script lang="ts">
	import type { Project } from "$lib/elements/classes/data/project/Project";
	import type { Task } from "$lib/elements/classes/data/time/Task";
	import { TransitionConstants } from "$lib/elements/classes/ui/core/TransitionConstants";
	import { currentMember, projectSelected } from "$lib/elements/stores/project-store";
	import { onMount } from "svelte";
	import { fly } from "svelte/transition";
	import HiveTask from "./hive-task.svelte";

    export let width: string = "40%";
    export let taskGotoed: Task = null;

    let project: Project = null;
    let tasks: Task[] = [];
    let projectPercentage: number = 0;

    let tasksContainer: HTMLElement = null;
    let highlightedId: string = "";
    let isHighlighted: boolean = false;

    $: taskGotoed ? gotoTask() : null;

    function gotoTask(): void {
        if (tasksContainer && taskGotoed) {
            let taskElement: HTMLElement = tasksContainer.querySelector(`#task-${taskGotoed.id}`);
            if (taskElement) {
                taskElement.scrollIntoView({behavior: "smooth", block: "center"});
                highlightedId = taskGotoed.id;
                isHighlighted = true;
            }
        }
    }

    function getProject(): void {
        currentMember.subscribe((c) => {
            if (c == null) {
                return;
            }
            projectSelected.subscribe((value) => {
                project = c.projects.find((p) => p.id == value);
                if (project != null) {
                    if (project.tasks.length == tasks.length) {
                        getTasks();
                    }
                    else {
                        tasks = [];
                        setTimeout(() => {
                            getTasks();
                        });
                    }
                } else {
                    project = null;
                    tasks = [];
                }
            });
        });
    }

    function getTasks(): void {
        tasks = [...project.tasks];

        let total = 0;
        for (let task of tasks) {
            total += task.percentage;
        }

        if (tasks.length > 0) {
            projectPercentage = total / tasks.length;
        } else {
            projectPercentage = 0;
        }

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
        min-width: 150px;
        height: 100%;
        background-color: var(--off-white-light);
        border-left: 1px solid var(--grey-300);
        box-shadow: 0 0 32px 0 rgba(0, 0, 0, 0.1);
    }

    .hive-list-title-container {
        display: flex;
        align-items: center;
        padding: 8px;
        border-bottom: 1px solid var(--grey-300);
        user-select: none;
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
        width: 70px;
        margin-right: 8px;
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
        width: 44px;
        margin-left: 8px;
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
<div class="hive-list-container" style="width: {width};" bind:this={tasksContainer} transition:fly={{x: width, duration: TransitionConstants.DURATION}}>
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
            <HiveTask task={task} project={project} highlightedId={highlightedId} bind:isHighlighted={isHighlighted} />
        {/each}
    </div>
</div>