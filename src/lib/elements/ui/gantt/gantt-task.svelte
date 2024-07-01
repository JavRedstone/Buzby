<script lang="ts">
	import type { Task } from "$lib/elements/classes/data/time/Task";
	import { onMount } from "svelte";

    export let task: Task = null;
    export let startDateRange: Date = null;
    export let endDateRange: Date = null;

    let leftPercentage: number = 0;
    let rightPercentage: number = 0;

    $: startDateRange ? setPercentages() : null;
    $: endDateRange ? setPercentages() : null;

    function setPercentages(): void {
        leftPercentage = (task.startDate.getTime() - startDateRange.getTime()) / (endDateRange.getTime() - startDateRange.getTime());
        rightPercentage = (task.endDate.getTime() - startDateRange.getTime()) / (endDateRange.getTime() - startDateRange.getTime());
    }

    onMount(() => {
        setPercentages();
    });
</script>
<style>
    .gantt-task-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
        height: 75px;
        border-bottom: 1px solid var(--grey-300);
        user-select: none;
    }

    .gantt-task-region {
        position: relative;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        height: 90%;
        padding-left: 4px;
        padding-right: 4px;
        background: linear-gradient(to top, var(--primary-lighter), var(--primary-light));
        border-radius: 4px;
        box-shadow: 2px 2px 8px var(--grey-300);
        cursor: pointer;

        transition: box-shadow var(--transition-duration);

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
</style>
{#if task}
    <div class="gantt-task-container">
        <div class="gantt-task-region" style="margin-left: {leftPercentage * 100}%; width: {(rightPercentage - leftPercentage) * 100}%;">
            <div class="gantt-task-progress" style="height: {task.percentage}%"></div>
            <div class="gantt-task-name">{task.name}</div>
            <div class="gantt-task-description">{task.description}</div>
        </div>
    </div>
{/if}