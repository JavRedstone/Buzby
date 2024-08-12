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
	import { allProjects, projectSelected } from "$lib/elements/stores/project-store";
	import HiveList from "$lib/elements/ui/hive/hive-list.svelte";
	import { onDestroy, onMount } from "svelte";
	import GanttTick from '$lib/elements/ui/gantt/gantt-tick.svelte';
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import { fade } from 'svelte/transition';
	import { setDoc, type DocumentData, type DocumentReference } from 'firebase/firestore';
	import { getFirestoreDoc } from '$lib/elements/firebase/firebase';
	import Snackbar from '$lib/elements/ui/general/snackbar.svelte';

    let project: Project = null;
    let tasks: Task[] = [];

    let snackbarOpen: boolean = false;
    let snackbarText: string = "";
    let snackbarType: string = "neutral";

    let ganttTasksContainer: HTMLDivElement = null;
    let centerDate: Date = new Date();
    let startDateRange: Date = new Date();
    let endDateRange: Date = new Date();
    let scale: number = 1;
    
    let timeTicks: TimeTick[] = [];
    let moving: boolean = true;

    $: centerDate ? setDateRange() : null;

    let taskGotoed: Task = null;

    function getProject(): void {
        projectSelected.subscribe((value) => {
            if (value.project != null) {
                project = value.project;

                tasks = [];
                setTimeout(() => {
                    getTasks();
                });
            } else {
                project = null;
                tasks = [];
            }
        });
    }

    function getTasks(): void {
        tasks = [...project.tasks];

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

        if (scale <= convertSpeed(GanttConstants.MIN_MONTH_SCALE) * scale) {
            baseType = TimeTick.MONTH;
            middleType = TimeTick.MONTH;
            topType = TimeTick.MONTH;
        }
        else if (scale <= convertSpeed(GanttConstants.MIN_WEEK_SCALE) * scale) {
            baseType = TimeTick.WEEK;
            middleType = TimeTick.MONTH;
            topType = TimeTick.MONTH;
        }
        else if (scale <= convertSpeed(GanttConstants.MIN_DAY_SCALE) * scale) {
            baseType = TimeTick.DAY;
            middleType = TimeTick.WEEK;
            topType = TimeTick.WEEK;
        }
        else if (scale <= convertSpeed(GanttConstants.MIN_HOUR_SCALE) * scale) {
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

    function pauseMove(event: CustomEvent): void {
        moving = event.detail.stop;
    }

    function resizeTask(event: CustomEvent): void {
        let task: Task = event.detail.task;
        let left: boolean = event.detail.left;
        let dragging: boolean = event.detail.dragging;
        let amount: number = event.detail.amount;

        moving = false;

        if (left) {
            task.startDate = new Date(task.startDate.getTime() + Math.round(convertSpeed(amount * GanttConstants.MOUSE_WHEEL_SPEED)));
            if (task.startDate.getTime() >= task.endDate.getTime()) {
                task.startDate = new Date(task.endDate.getTime());
            }
        }
        else {
            task.endDate = new Date(task.endDate.getTime() + Math.round(convertSpeed(amount * GanttConstants.MOUSE_WHEEL_SPEED)));
            if (task.endDate.getTime() <= task.startDate.getTime()) {
                task.endDate = new Date(task.startDate.getTime());
            }
        }

        setDateRange();

        if (!dragging) {
            moving = true;
            editTask(task);
        }
    }

    function shiftTask(event: CustomEvent): void {
        let task: Task = event.detail.task;
        let dragging: boolean = event.detail.dragging;
        let amount: number = event.detail.amount;

        moving = false;

        task.startDate = new Date(task.startDate.getTime() + Math.round(convertSpeed(amount * GanttConstants.MOUSE_WHEEL_SPEED)));
        task.endDate = new Date(task.endDate.getTime() + Math.round(convertSpeed(amount * GanttConstants.MOUSE_WHEEL_SPEED)));

        setDateRange();

        if (!dragging) {
            moving = true;
            editTask(task);
        }
    }

    function editTask(task: Task): void {
        let taskDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("tasks", task.id);
        setDoc(taskDoc, task.compactify()).then(() => {
            project.tasks = project.tasks.map((t) => {
                if (t.id === task.id) {
                    return task;
                }
                return t;
            });
            openSnackbar("Task edited successfully.", "success");
        }).catch((error) => {
            openSnackbar("An error occurred while editing task. Please try again.", "error");
        });
    }

    function gotoTask(event: CustomEvent) {
		taskGotoed = event.detail.task;
	}

    function zoom(event: WheelEvent): void {
        if (moving) {
            centerDate = new Date(new Date().setTime(centerDate.getTime() + Math.round(convertSpeed(event.deltaX * GanttConstants.WHEEL_MOVE_SPEED))));
            scale = Math.max(GanttConstants.MIN_SCALE, Math.min(GanttConstants.MAX_SCALE, scale - event.deltaY * GanttConstants.WHEEL_SCALE_SPEED));
            setDateRange();
        }
    }

    function move(event: MouseEvent): void {
        if (moving) {
            if (event.buttons === 1) {
                centerDate = new Date(new Date().setTime(centerDate.getTime() - Math.round(convertSpeed(event.movementX * GanttConstants.MOUSE_WHEEL_SPEED))));
                ganttTasksContainer.scrollTop -= event.movementY;
                setDateRange();
            }
        }
    }

    function convertSpeed(speed: number): number {
        return Math.round(speed * 1000 / (scale * (window.innerWidth - 48) * 0.7));
    }

    function setListeners(): void {
        window.addEventListener("resize", () => {
            setDateRange();
        });
    }

    function removeListeners(): void {
        window.removeEventListener("resize", () => {});
    }

    function openSnackbar(text: string, type: string): void {
        snackbarText = text;
        snackbarType = type;
        snackbarOpen = true;
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
        height: calc(100% - 48px);
        margin-top: 48px;
        overflow-x: hidden;
        overflow-y: hidden;
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
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="gantt-tasks-container" on:wheel={zoom} on:mousemove={move} bind:this={ganttTasksContainer}> 
        {#each tasks as task}
            <GanttTask bind:task={task} bind:startDateRange={startDateRange} bind:endDateRange={endDateRange} on:gotoTask={gotoTask} on:move={pauseMove} on:resize={resizeTask} on:shift={shiftTask} />
        {/each}
    </div>
</div>
<HiveList width="30%" bind:taskGotoed={taskGotoed} />
<Snackbar type={snackbarType} bind:open={snackbarOpen}>{snackbarText}</Snackbar>