<script lang="ts">
	import { ProjectConstants } from "$lib/elements/classes/data/project/ProjectConstants";
    import type { Occasion } from "$lib/elements/classes/data/time/Occasion";
	import { OccasionConstants } from "$lib/elements/classes/data/time/OccasionConstants";
	import { CalendarConstants } from "$lib/elements/classes/ui/calendar/CalendarConstants";
	import { TimeTick } from "$lib/elements/classes/ui/gantt/TimeTick";
	import { ObjectHelper } from "$lib/elements/helpers/ObjectHelper";
	import { StringHelper } from "$lib/elements/helpers/StringHelper";
	import { createEventDispatcher } from "svelte";

    let dispatch = createEventDispatcher();
    
    export let occasion: Occasion = null;

    let startTimeFormatted: string = "";
    let endTimeFormatted: string = "";

    $: occasion ? formatTimes() : null;

    function formatTimes(): void {
        startTimeFormatted = StringHelper.getFormattedTime(occasion.startTime);
        endTimeFormatted = StringHelper.getFormattedTime(occasion.endTime);
    }

    function openDetails(): void {
        dispatch("openDetails", { occasion: occasion });
    }
</script>
<style>
    .calendar-day-occasion-container {
        box-sizing: border-box;
        position: absolute;
        width: 90%;
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

    .calendar-day-occasion-title {
        font-size: 12px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .calendar-day-occasion-span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .calendar-day-occasion-time {
        font-size: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .calendar-day-occasion-description {
        border-top: 1px solid;
        font-size: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
    }   
</style>
{#if occasion}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="calendar-day-occasion-container" style="top: {CalendarConstants.PIXEL_OFFSET + ObjectHelper.getTimeHours(occasion.startTime) * CalendarConstants.PIXELS_PER_HOUR}px; height: {(Math.max(OccasionConstants.OCCASION_MIN_DURATION / CalendarConstants.MINUTES_PER_HOUR, ObjectHelper.getTimeDifference(occasion.endTime, occasion.startTime, TimeTick.HOUR))) * CalendarConstants.PIXELS_PER_HOUR}px; background-color: {occasion.color}; color: {ProjectConstants.findColorByHex(occasion.color).textColor};" on:click={openDetails}>
        <div class="calendar-day-occasion-title" style="font-size: {ObjectHelper.getTimeDifference(occasion.endTime, occasion.startTime, TimeTick.HOUR) > OccasionConstants.OCCASION_MIN_DURATION / CalendarConstants.MINUTES_PER_HOUR ? '12' : '8'}px;">
            <span class="calendar-day-occasion-span" style="font-weight: 500;">{occasion.name.length == 0 ? "Untitled" : occasion.name}</span>
            {#if (ObjectHelper.getTimeDifference(occasion.endTime, occasion.startTime, TimeTick.HOUR)) * CalendarConstants.PIXELS_PER_HOUR <= OccasionConstants.OCCASION_MINIMUM_HEIGHT_FOR_TIME}
                <span class="calendar-day-occasion-span" style="font-weight: 400;"> - {startTimeFormatted}</span>
            {/if}
        </div>
        {#if (ObjectHelper.getTimeDifference(occasion.endTime, occasion.startTime, TimeTick.HOUR)) * CalendarConstants.PIXELS_PER_HOUR > OccasionConstants.OCCASION_MINIMUM_HEIGHT_FOR_TIME}
            <div class="calendar-day-occasion-time">{startTimeFormatted} - {endTimeFormatted}</div>
        {/if}
        {#if (ObjectHelper.getTimeDifference(occasion.endTime, occasion.startTime, TimeTick.HOUR)) * CalendarConstants.PIXELS_PER_HOUR > OccasionConstants.OCCASION_MINIMUM_HEIGHT_FOR_DESCRIPTION}
            <div class="calendar-day-occasion-description" style="border-top-color: {ProjectConstants.findColorByHex(occasion.color).textColor};">{occasion.description.length == 0 ? "No description" : occasion.description}</div>
        {/if}
    </div>
{/if}