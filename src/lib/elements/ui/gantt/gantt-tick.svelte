<script lang="ts">
	import { TimeTick } from "$lib/elements/classes/ui/gantt/TimeTick";
	import { onDestroy, onMount } from "svelte";

    export let timeTick: TimeTick = null;
    export let startDateRange: Date = null;
    export let endDateRange: Date = null;
    export let current: boolean = false;
    
    let leftPercentage: number = 0;
    let tickStyle: string = "";
    let markerStyle: string = "";

    let currentInterval: any = null;
    
    $: current ? setTickStyle() : null;
    $: timeTick ? setTickStyle() : null;
    $: timeTick ? setMarkerStyle() : null;
    $: startDateRange ? setPercentage() : null;
    $: endDateRange ? setPercentage() : null;

    function setPercentage(): void {
        if (current) {
            leftPercentage = (new Date().getTime() - startDateRange.getTime()) / (endDateRange.getTime() - startDateRange.getTime());
        } else {
            leftPercentage = (timeTick.date.getTime() - startDateRange.getTime()) / (endDateRange.getTime() - startDateRange.getTime());
        }
        
        setTickStyle();
        setMarkerStyle();
    }

    function setTickStyle(): void {
        if (current) {
            tickStyle = "margin-top: -16px; font-size: 14px; color: var(--accent);";
            return;
        }
        if (timeTick.type == TimeTick.MONTH) {
            tickStyle = "font-size: 12px; color: var(--grey-700);";
            return;
        }
        if (timeTick.type == TimeTick.WEEK) {
            tickStyle = "font-size: 12px; color: var(--grey-600);";
            return;
        }
        if (timeTick.type == TimeTick.DAY) {
            tickStyle = "margin-top: 2px; font-size: 11px; color: var(--grey-500);";
            return;
        }
        if (timeTick.type == TimeTick.HOUR) {
            tickStyle = "margin-top: 3px; font-size: 10px; color: var(--grey-400);";
            return;
        }
        if (timeTick.type == TimeTick.MINUTE) {
            tickStyle = "margin-top: 4px; font-size: 8px; color: var(--grey-300);";
            return;
        }
        tickStyle = "";
    }

    function setMarkerStyle(): void {
        if (current) {
            markerStyle = "margin-top: -16px; border-color: var(--accent);";
            return;
        }
        if (timeTick.type == TimeTick.MONTH) {
            markerStyle = "border-color: var(--grey-600);";
            return;
        }
        if (timeTick.type == TimeTick.WEEK) {
            markerStyle = "border-color: var(--grey-500);";
            return;
        }
        if (timeTick.type == TimeTick.DAY) {
            markerStyle = "border-color: var(--grey-400);";
            return;
        }
        if (timeTick.type == TimeTick.HOUR) {
            markerStyle = "border-color: var(--grey-300);";
            return;
        }
        if (timeTick.type == TimeTick.MINUTE) {
            markerStyle = "border-color: var(--grey-200);";
            return;
        }
        tickStyle = "";
    }

    function setCurrentInterval(): void {
        if (current) {
            currentInterval = setInterval(() => {
                setPercentage();
            }, 1000);
        }
    }

    onMount(() => {
        setPercentage();
        setCurrentInterval();
    });

    onDestroy(() => {
        clearInterval(currentInterval);
    });
</script>
<style>
    .gantt-tick-container {
        position: absolute;
        width: 50px;
        height: 10px;
        user-select: none;
    }

    .gantt-tick-value {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
    }

    .gantt-tick-marker {
        box-sizing: border-box;
        position: absolute;
        height: 100vh;
        top: 18px;
        left: 50%;
        transform: translateX(-50%);
        border-left: 1px solid;
    }
</style>
<div class="gantt-tick-container" style="left: calc({leftPercentage * 100}% - 25px);">
    {#if current}
        <div class="gantt-tick-value" style={tickStyle}>Now</div>
    {:else}
        <div class="gantt-tick-value" style={tickStyle}>{timeTick.value}</div>
    {/if}
    <div class="gantt-tick-marker" style={markerStyle}></div>
</div>