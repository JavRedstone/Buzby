<script lang="ts">
	import { ProjectConstants } from "$lib/elements/classes/data/project/ProjectConstants";
    import type { Occasion } from "$lib/elements/classes/data/time/Occasion";
	import { OccasionConstants } from "$lib/elements/classes/data/time/OccasionConstants";
	import { CalendarConstants } from "$lib/elements/classes/ui/calendar/CalendarConstants";
	import { TimeTick } from "$lib/elements/classes/ui/gantt/TimeTick";
	import { ObjectHelper } from "$lib/elements/helpers/ObjectHelper";
	import { StringHelper } from "$lib/elements/helpers/StringHelper";
	import { createEventDispatcher, onDestroy, onMount } from "svelte";

    let dispatch = createEventDispatcher();
    
    export let occasion: Occasion = null;

    let occasionTop: number = 0;
    let occasionHeight: number = 0;

    let startTimeFormatted: string = "";
    let endTimeFormatted: string = "";
    
    let resizing: boolean = false;
    let shifting: boolean = false;

    let occasionUpdater: any = null;

    $: occasion ? updateOccasion() : null;
    $: occasion && occasion.startTime ? updateOccasion() : null;
    $: occasion && occasion.endTime ? updateOccasion() : null;

    function updateOccasion(): void {
        startTimeFormatted = StringHelper.getFormattedTime(occasion.startTime);
        endTimeFormatted = StringHelper.getFormattedTime(occasion.endTime);

        occasionTop = CalendarConstants.PIXEL_OFFSET + ObjectHelper.getTimeHours(occasion.startTime) * CalendarConstants.PIXELS_PER_HOUR;
        occasionHeight = (Math.max(OccasionConstants.OCCASION_MIN_DURATION / CalendarConstants.MINUTES_PER_HOUR, ObjectHelper.getTimeDifference(occasion.endTime, occasion.startTime, TimeTick.HOUR))) * CalendarConstants.PIXELS_PER_HOUR;
    }

    function toggleDetails(): void {
        dispatch("toggleDetails", { occasion: occasion });
    }

    function dragOccasion(event: DragEvent): void {
        if (resizing) return;
        shifting = true;
        dispatch("shift", { occasion: occasion, dragging: shifting, amountX: event.offsetX, amountY: event.offsetY });
    }

    function stopDragOccasion(event: DragEvent): void {
        if (resizing) return;
        shifting = false;
        dispatch("shift", { occasion: occasion, dragging: shifting, amountX: event.offsetX, amountY: event.offsetY });
    }

    function dragTop(event: MouseEvent): void {
        resizing = true;
        dispatch("resize", { occasion: occasion, top: true, dragging: resizing, amount: event.offsetY });
    }

    function dragBottom(event: MouseEvent): void {
        resizing = true;
        dispatch("resize", { occasion: occasion, top: false, dragging: resizing, amount: event.offsetY });
    }

    function stopDragTop(event: MouseEvent): void {
        dispatch("resize", { occasion: occasion, top: true, dragging: false, amount: event.offsetY });
        setTimeout(() => resizing = false, 0);
    }

    function stopDragBottom(event: MouseEvent): void {
        dispatch("resize", { occasion: occasion, top: false, dragging: false, amount: event.offsetY });
        setTimeout(() => resizing = false, 0);
    }

    function setOccasionUpdater(): void {
        occasionUpdater = setInterval(() => {
            updateOccasion();
        });
    }

    function removeOccasionUpdater(): void {
        clearInterval(occasionUpdater);
    }

    onMount(() => {
        setOccasionUpdater();
    });

    onDestroy(() => {
        removeOccasionUpdater();
    });
</script>
<style>
    .calendar-occasion-container {
        position: absolute;
        width: 90%;
        background: transparent;
    }

    .calendar-occasion {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        padding-left: 4px;
        padding-right: 4px;
        border-radius: 6px;
        box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        overflow: hidden;

        transition: box-shadow var(--transition-duration), background-color var(--transition-duration), color var(--transition-duration);

        &:hover {
            box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.25);
        }
    }

    .calendar-occasion-title {
        font-size: 12px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .calendar-occasion-span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .calendar-occasion-time {
        font-size: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .calendar-occasion-description {
        border-top: 1px solid;
        font-size: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .calendar-occasion-draggable {
        position: absolute;
        left: 0;
        width: 100%;
        height: 4px;
        border-radius: 4px;
        cursor: ns-resize;

        transition: background-color var(--transition-duration);

        &:hover {
            background: var(--accent-dark);
        }
    }
</style>
{#if occasion}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="calendar-occasion-container" draggable="true"  style="top: {occasionTop}px; height: {occasionHeight}px; opacity: {resizing || shifting ? 0.5 : 1}" on:drag={dragOccasion} on:dragend={stopDragOccasion}>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="calendar-occasion" style="background-color: {occasion.color}; color: {ProjectConstants.findColorByHex(occasion.color).textColor};" on:click={toggleDetails}>
            <div class="calendar-occasion-title" style="font-size: {ObjectHelper.getTimeDifference(occasion.endTime, occasion.startTime, TimeTick.HOUR) > OccasionConstants.OCCASION_MIN_DURATION / CalendarConstants.MINUTES_PER_HOUR ? '12' : '8'}px;">
                <span class="calendar-occasion-span" style="font-weight: 500;">{occasion.name.length == 0 ? "Untitled" : occasion.name}</span>
                {#if (ObjectHelper.getTimeDifference(occasion.endTime, occasion.startTime, TimeTick.HOUR)) * CalendarConstants.PIXELS_PER_HOUR <= OccasionConstants.OCCASION_MINIMUM_HEIGHT_FOR_TIME}
                    <span class="calendar-occasion-span" style="font-weight: 400;"> - {startTimeFormatted}</span>
                {/if}
            </div>
            {#if (ObjectHelper.getTimeDifference(occasion.endTime, occasion.startTime, TimeTick.HOUR)) * CalendarConstants.PIXELS_PER_HOUR > OccasionConstants.OCCASION_MINIMUM_HEIGHT_FOR_TIME}
                <div class="calendar-occasion-time">{startTimeFormatted} - {endTimeFormatted}</div>
            {/if}
            {#if (ObjectHelper.getTimeDifference(occasion.endTime, occasion.startTime, TimeTick.HOUR)) * CalendarConstants.PIXELS_PER_HOUR > OccasionConstants.OCCASION_MINIMUM_HEIGHT_FOR_DESCRIPTION}
                <div class="calendar-occasion-description" style="border-top-color: {ProjectConstants.findColorByHex(occasion.color).textColor};">{occasion.description.length == 0 ? "No description" : occasion.description}</div>
            {/if}
            <div class="calendar-occasion-draggable" style="top: 0;" draggable="true" on:drag={dragTop} on:dragend={stopDragTop}></div>
            <div class="calendar-occasion-draggable" style="bottom: 0;" draggable="true" on:drag={dragBottom} on:dragend={stopDragBottom}></div>
        </div>
    </div>
{/if}