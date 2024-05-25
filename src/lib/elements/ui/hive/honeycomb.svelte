<script lang="ts">
	import { Task } from "$lib/elements/classes/data/time/Task";
	import { HiveConstants } from "$lib/elements/classes/ui/hive/HiveConstants";
	import Tooltip from "../general/tooltip.svelte";

    export let x: number = 100;
    export let y: number = 100;
    export let task: Task = new Task({name:"Example task"});

    function addFill(): void {
        if (task.percentage < 100) {
            task.percentage += 10;
        }
    }

    function removeFill(): void {
        if (task.percentage > 0) {
            task.percentage -= 10;
        }
    }
</script>
<style>
    .honeycomb-hexagon-container-empty {
        position: absolute;
        background-color: var(--grey-300);
        cursor: pointer;
        user-select: none;
    }

    .honeycomb-hexagon-empty {
        position: absolute;
        height: 95%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background-color: var(--off-white-light);
        display: flex;
        justify-content: center;
        align-items: center;
        color: var(--grey-600);
        cursor: pointer;
    }

    .honeycomb-hexagon-add {
        font-size: 36px;
    }

    .honeycomb-hexagon-container {
        position: absolute;
        background-color: var(--primary-light);
        user-select: none;
    }

    .honeycomb-hexagon {
        position: absolute;
        height: 95%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(to bottom, var(--primary), var(--primary-dark));
    }

    .honeycomb-hexagon-fill {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        background: linear-gradient(to bottom, var(--primary-darker), var(--primary-dark));       
    }

    .honeycomb-hexagon-fill-percentage {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        color: var(--grey-100);
        font-size: 16px;
    }

    .honeycomb-hexagon-add-fill {
        position: absolute;
        left: 50%;
        top: 5%;
        transform: translateX(-50%);
        color: var(--grey-100);
        font-size: 24px;
        cursor: pointer;
    }

    .honeycomb-hexagon-remove-fill {
        position: absolute;
        left: 50%;
        bottom: 5%;
        transform: translateX(-50%);
        color: var(--grey-100);
        font-size: 24px;
        cursor: pointer;
    }

    .honeycomb-hexagon-overlay {
        position: absolute;
        width: 100%;
        height: 100%;
        cursor: pointer;
    }
</style>
{#if task == null}
    <div class="honeycomb-hexagon-container-empty hexagon" style="left: {x}px; top: {y}px; width: {HiveConstants.HONEYCOMB_WIDTH}px; height: {HiveConstants.HONEYCOMB_HEIGHT}px;">
        <div class="honeycomb-hexagon-empty hexagon">
            <span class="honeycomb-hexagon-add material-symbols-rounded">add_task</span>
        </div>
    </div>
    <div class="honeycomb-hexagon-overlay" style="left: {x}px; top: {y}px; width: {HiveConstants.HONEYCOMB_WIDTH}px; height: {HiveConstants.HONEYCOMB_HEIGHT}px;">
        <Tooltip>Add Task</Tooltip>
    </div>
{:else}
    <div class="honeycomb-hexagon-container hexagon" style="left: {x}px; top: {y}px; width: {HiveConstants.HONEYCOMB_WIDTH}px; height: {HiveConstants.HONEYCOMB_HEIGHT}px;">
        <div class="honeycomb-hexagon hexagon">
            <div class="honeycomb-hexagon-fill" style="height: {task.percentage}%"></div>
        </div>
    </div>
    <div class="honeycomb-hexagon-overlay" style="left: {x}px; top: {y}px; width: {HiveConstants.HONEYCOMB_WIDTH}px; height: {HiveConstants.HONEYCOMB_HEIGHT}px;">
        <Tooltip>{task.name}</Tooltip>
        <div class="honeycomb-hexagon-fill-percentage">{task.percentage}%</div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="honeycomb-hexagon-add-fill material-symbols-rounded" on:click={addFill}>add</div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="honeycomb-hexagon-remove-fill material-symbols-rounded" on:click={removeFill}>remove</div>
    </div>
{/if}