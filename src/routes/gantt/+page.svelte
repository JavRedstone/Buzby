<svelte:head>
    <title>Buzby | Gantt</title>
</svelte:head>
<script lang="ts">
	import { ObjectHelper } from '$lib/elements/helpers/ObjectHelper';
	import { TimeTick } from '$lib/elements/classes/ui/gantt/TimeTick';
	import { GanttConstants } from '$lib/elements/classes/ui/gantt/GanttConstants';
	import GanttTask from '$lib/elements/ui/gantt/gantt-task.svelte';
	import type { Project } from "$lib/elements/classes/data/project/Project";
	import type { Task } from "$lib/elements/classes/data/time/Task";
	import { projectSelected } from "$lib/elements/stores/project-store";
	import HiveList from "$lib/elements/ui/hive/hive-list.svelte";
	import { onDestroy, onMount } from "svelte";
	import GanttTick from '$lib/elements/ui/gantt/gantt-tick.svelte';
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import { fade } from 'svelte/transition';

    let project: Project = null;
    let tasks: Task[] = [];

    let ganttTasksContainer: HTMLDivElement = null;
    let centerDate: Date = new Date();
    let startDateRange: Date = new Date();
    let endDateRange: Date = new Date();
    let scale: number = 1;
    
    let timeTicks: TimeTick[] = [];

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
        startDateRange = new Date(new Date().setTime(centerDate.getTime() - Math.round(GanttConstants.TIME_RANGE / scale)));
        endDateRange = new Date(new Date().setTime(centerDate.getTime() + Math.round(GanttConstants.TIME_RANGE / scale)));

        setGanttTicks();
    }

    function setGanttTicks(): void {
        timeTicks = [];

        let baseType: string = TimeTick.WEEK;
        let middleType: string = TimeTick.MONTH;
        let topType: string = TimeTick.MONTH;

        if (scale <= GanttConstants.MIN_MONTH_SCALE) {
            baseType = TimeTick.MONTH;
            middleType = TimeTick.MONTH;
            topType = TimeTick.MONTH;
        }
        else if (scale <= GanttConstants.MIN_WEEK_SCALE) {
            baseType = TimeTick.WEEK;
            middleType = TimeTick.MONTH;
            topType = TimeTick.MONTH;
        }
        else if (scale <= GanttConstants.MIN_DAY_SCALE) {
            baseType = TimeTick.DAY;
            middleType = TimeTick.WEEK;
            topType = TimeTick.WEEK;
        }
        else if (scale <= GanttConstants.MIN_HOUR_SCALE) {
            baseType = TimeTick.HOUR;
            middleType = TimeTick.DAY;
            topType = TimeTick.DAY;
        }
        else {
            baseType = TimeTick.MINUTE;
            middleType = TimeTick.HOUR;
            topType = TimeTick.DAY;
        }

        let currentDate: Date = ObjectHelper.getNearestDate(startDateRange, baseType);
        while (currentDate.getTime() <= endDateRange.getTime()) {
            if (ObjectHelper.isDateType(currentDate, topType)) {
                timeTicks.push(new TimeTick(currentDate, topType));
            }
            else if (ObjectHelper.isDateType(currentDate, middleType)) {
                timeTicks.push(new TimeTick(currentDate, middleType));
            }
            else if (ObjectHelper.isDateType(currentDate, baseType)) {
                timeTicks.push(new TimeTick(currentDate, baseType));
            }
            currentDate = ObjectHelper.addDateType(currentDate, baseType, 1);
        }
    }

    function gotoTask(event: CustomEvent) {
		taskGotoed = event.detail.task;
	}

    function setListeners(): void {
        ganttTasksContainer.addEventListener("wheel", (event) => {
            centerDate = new Date(new Date().setTime(centerDate.getTime() + Math.round(event.deltaX * GanttConstants.WHEEL_MOVE_SPEED)));
            scale = Math.max(GanttConstants.MIN_SCALE, Math.min(GanttConstants.MAX_SCALE, scale - event.deltaY * GanttConstants.WHEEL_SCALE_SPEED));
        });

        ganttTasksContainer.addEventListener("mousemove", (event) => {
            event.preventDefault();
            if (event.buttons === 1) {
                centerDate = new Date(new Date().setTime(centerDate.getTime() - Math.round(event.movementX * GanttConstants.MOUSE_WHEEL_SPEED / scale)));
                ganttTasksContainer.scrollTop -= event.movementY;
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
	.gantt-title {
		position: absolute;
		padding: 8px;
        font-size: 16px;
        font-weight: 500;
        color: var(--grey-800);
		user-select: none;
		z-index: 100;
    }

    .gantt-ticks-container {
        position: absolute;
        width: 70%;
        height: 100%;
        padding-top: 16px;
        overflow-x: hidden;
        overflow-y: hidden;
    }

    .gantt-tasks-container {
        position: absolute;
        width: 70%;
        height: 100%;
        margin-top: 48px;
        overflow-x: hidden;
        overflow-y: auto;
        cursor: grab;
        border-top: 1px solid var(--grey-300);
    }
</style>
<div transition:fade={{duration: TransitionConstants.DURATION}}>
    <div class="gantt-title">Gantt</div>
    <div class="gantt-ticks-container">
        {#each timeTicks as timeTick}
            <GanttTick bind:timeTick={timeTick} bind:startDateRange={startDateRange} bind:endDateRange={endDateRange} current={false} />
        {/each}
        <GanttTick bind:startDateRange={startDateRange} bind:endDateRange={endDateRange} current={true} />
    </div>
    <div class="gantt-tasks-container" bind:this={ganttTasksContainer}>
        {#each tasks as task}
            <GanttTask bind:task={task} bind:startDateRange={startDateRange} bind:endDateRange={endDateRange} on:gotoTask={gotoTask} />
        {/each}
    </div>
</div>
<HiveList width="30%" bind:taskGotoed={taskGotoed} />