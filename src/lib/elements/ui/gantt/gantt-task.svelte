<script lang="ts">
	import type { Task } from "$lib/elements/classes/data/time/Task";
	import { TaskConstants } from "$lib/elements/classes/data/time/TaskConstants";
	import { createEventDispatcher, onMount } from "svelte";

    let dispatch = createEventDispatcher();
    
    export let task: Task = null;
    export let startDateRange: Date = null;
    export let endDateRange: Date = null;

    let leftPercentage: number = 0;
    let rightPercentage: number = 0;

    let isUrgent: boolean = false;

    let resizing: boolean = false;
    let shifting: boolean = false;

    $: task ? setUrgent() : null;
    $: startDateRange ? setPercentages() : null;
    $: endDateRange ? setPercentages() : null;

    function setPercentages(): void {
        leftPercentage = (task.startDate.getTime() - startDateRange.getTime()) / (endDateRange.getTime() - startDateRange.getTime());
        rightPercentage = (task.endDate.getTime() - startDateRange.getTime()) / (endDateRange.getTime() - startDateRange.getTime());
    }

    function setUrgent(): void {
        if (task && task.percentage < 100) {
            let msRemaining: number = task.endDate.getTime() - new Date().getTime();
            if (task.percentage <= TaskConstants.TASK_URGENT_SMALL_THRESHOLD) {
                isUrgent = msRemaining < TaskConstants.TASK_URGENT_SMALL_PROGRESS_TIME;
            }
            else if (task.percentage >= TaskConstants.TASK_URGENT_BIG_THRESHOLD) {
                isUrgent = msRemaining < TaskConstants.TASK_URGENT_BIG_PROGRESS_TIME;
            }
            else {
                isUrgent = msRemaining < TaskConstants.TASK_URGENT_NORMAL_PROGRESS_TIME;
            }
        }
        else {
            isUrgent = false;
        }
    }

    function gotoTask(): void {
        dispatch("gotoTask", { task: task });
    }

    function move(event: MouseEvent): void {
        if (event.buttons == 1) {
            dispatch("move", { stop: false });
        }
    }

    function stopMove(event: MouseEvent): void {
        dispatch("move", { stop: true });
    }

    function dragTask(event: DragEvent): void {
        if (resizing) return;
        shifting = true;
        dispatch("shift", { task: task, dragging: shifting, amount: event.offsetX });
    }

    function stopDragTask(event: DragEvent): void {
        if (resizing) return;
        shifting = false;
        dispatch("shift", { task: task, dragging: shifting, amount: event.offsetX });
    }

    function dragLeft(event: MouseEvent): void {
        resizing = true;
        dispatch("resize", { task: task, left: true, dragging: resizing, amount: event.offsetX });
    }

    function dragRight(event: MouseEvent): void {
        resizing = true;
        dispatch("resize", { task: task, left: false, dragging: resizing, amount: event.offsetX });
    }

    function stopDragLeft(event: MouseEvent): void {
        dispatch("resize", { task: task, left: true, dragging: false, amount: event.offsetX });
        setTimeout(() => resizing = false, 0);
    }

    function stopDragRight(event: MouseEvent): void {
        dispatch("resize", { task: task, left: false, dragging: false, amount: event.offsetX });
        setTimeout(() => resizing = false, 0);
    }

    onMount(() => {
        setPercentages();
        setUrgent();
    });
</script>
<style>
    .gantt-task-container {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
        height: 75px;
        user-select: none;

        transition: background-color var(--transition-duration);

        &:hover {
            background-color: rgba(0, 0, 0, 0.025);
        }
    }

    .gantt-task-container-urgent {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
        height: 75px;
        background-color: rgba(var(--warning-rgb), 0.1);
        user-select: none;

        transition: background-color var(--transition-duration);

        &:hover {
            background-color: rgba(var(--warning-rgb), 0.15);
        }
    }

    .gantt-task-info-container {
        position: absolute;
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 90%;
        max-width: 200px;
        padding-left: 8px;
        padding-right: 8px;
        background: linear-gradient(to right, var(--primary), transparent);
        z-index: 1;
    }

    .gantt-task-name {
        font-size: 12px;
        font-weight: 500;
        color: var(--grey-800);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        z-index: 1;
    }

    .gantt-task-description {
        font-size: 10px;
        color: var(--grey-700);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        z-index: 1;
    }

    .gantt-task-region-container {
        position: absolute;
        height: 90%;
        background: transparent;
    }

    .gantt-task-region {
        position: absolute;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        width: calc(100% - 8px);
        height: 100%;
        margin-left: 4px;
        padding-left: 4px;
        padding-right: 4px;
        background: linear-gradient(to top, var(--primary-lighter), var(--primary-light));
        border-radius: 4px;
        box-shadow: 2px 2px 8px var(--grey-300);
        cursor: pointer;

        transition: box-shadow var(--transition-duration), opacity var(--transition-duration);

        &:hover {
            box-shadow: 2px 2px 8px var(--grey-400);
        }
    }

    .gantt-task-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        background: linear-gradient(to bottom, var(--primary), var(--primary-dark));
        border-radius: 4px;

        transition: height var(--transition-duration);
    }

    .gantt-task-draggable {
        position: absolute;
        top: 0;
        width: 4px;
        height: 100%;
        border-radius: 4px;
        cursor: ew-resize;

        transition: background-color var(--transition-duration);

        &:hover {
            background: var(--accent);
        }
    }
</style>
{#if task}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class={isUrgent ? "gantt-task-container-urgent" : "gantt-task-container"} on:click={gotoTask}>
        <div class="gantt-task-info-container">
            <div class="gantt-task-name">{task.name}</div>
            <div class="gantt-task-description">{task.description}</div>
        </div>
        <!-- svelte-ignore a11y-mouse-events-have-key-events -->
        <div class="gantt-task-region-container" style="left: calc({leftPercentage * 100}% - 4px); width: calc({(rightPercentage - leftPercentage) * 100}% + 8px);" on:mouseover={move} on:mouseleave={stopMove}>
            <div class="gantt-task-region" draggable="true" style="opacity: {resizing || shifting ? 0.5 : 1}" on:drag={dragTask} on:dragend={stopDragTask}>
                <div class="gantt-task-progress" style="height: {task.percentage}%"></div>
                <div class="gantt-task-draggable" style="left: 0;" draggable="true" on:drag={dragLeft} on:dragend={stopDragLeft}></div>
                <div class="gantt-task-draggable" style="right: 0;" draggable="true" on:drag={dragRight} on:dragend={stopDragRight}></div>
            </div>
        </div>
    </div>
{/if}