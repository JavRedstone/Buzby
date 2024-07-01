<svelte:head>
    <title>Buzby | Gantt</title>
</svelte:head>
<script lang="ts">
	import { GanttConstants } from '$lib/elements/classes/ui/gantt/GanttConstants';
	import GanttTask from '$lib/elements/ui/gantt/gantt-task.svelte';
	import type { Project } from "$lib/elements/classes/data/project/Project";
	import type { Task } from "$lib/elements/classes/data/time/Task";
	import { projectSelected } from "$lib/elements/stores/project-store";
	import HiveList from "$lib/elements/ui/hive/hive-list.svelte";
	import { onDestroy, onMount } from "svelte";

    let project: Project = null;
    let tasks: Task[] = [];

    let ganttContainer: HTMLDivElement = null;
    let centerDate: Date = new Date();
    let startDateRange: Date = new Date();
    let endDateRange: Date = new Date();
    let scale: number = 1;

    $: centerDate ? setDateRange() : null;

    let taskGotoed: Task = null;

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

        tasks.sort((a, b) => { return a.endDate.getTime() - b.endDate.getTime(); });
    }

    function setDateRange(): void {
        startDateRange = new Date(new Date().setTime(centerDate.getTime() - GanttConstants.TIME_RANGE * scale));
        endDateRange = new Date(new Date().setTime(centerDate.getTime() + GanttConstants.TIME_RANGE * scale));
    }

    function setListeners(): void {
        ganttContainer.addEventListener("wheel", (event) => {
            centerDate = new Date(new Date().setTime(centerDate.getTime() + Math.round(event.deltaX * GanttConstants.WHEEL_MOVE_SPEED)));
            scale = Math.max(GanttConstants.MIN_SCALE, Math.min(GanttConstants.MAX_SCALE, scale + event.deltaY * GanttConstants.WHEEL_SCALE_SPEED));
        });

        ganttContainer.addEventListener("mousemove", (event) => {
            event.preventDefault();
            if (event.buttons === 1) {
                centerDate = new Date(new Date().setTime(centerDate.getTime() - Math.round(event.movementX * GanttConstants.MOUSE_WHEEL_SPEED * scale)));
                ganttContainer.scrollTop -= event.movementY;
            }
        });
    }

    function removeListeners(): void {
        window.removeEventListener("wheel", () => {});
        window.removeEventListener("mousemove", () => {});
    }

    onMount(() => {
        getProject();
        setDateRange();
        setListeners();
    });

    onDestroy(() => {
        removeListeners();
    });
</script>
<style>
    .gantt-container {
        width: 70%;
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
        cursor: grab;
    }
</style>
<div class="gantt-container" bind:this={ganttContainer}>
    {#each tasks as task}
        <GanttTask bind:task={task} bind:startDateRange={startDateRange} bind:endDateRange={endDateRange} />
    {/each}
</div>
<HiveList width="30%" bind:taskGotoed={taskGotoed} />