<script lang="ts">
	import type { Occasion } from "$lib/elements/classes/data/time/Occasion";
	import { createEventDispatcher, onDestroy, onMount } from "svelte";
	import CalendarOccasion from "./calendar-occasion.svelte";
	import { ObjectHelper } from "$lib/elements/helpers/ObjectHelper";
	import { TimeTick } from "$lib/elements/classes/ui/gantt/TimeTick";
	import { CalendarConstants } from "$lib/elements/classes/ui/calendar/CalendarConstants";

    let dispatch = createEventDispatcher();
    
    export let date: Date = new Date();
    export let currentTime: Date = new Date();
    export let occasions: Occasion[] = [];
    export let temporaryOccasion: Occasion = null;
    
    let occasionsUpdater: any = null;

    let dayOccasions: Occasion[] = [];

    $: date || occasions ? setDayOccasions() : null;

    function setDayOccasions(): void {
        dayOccasions = occasions.filter((occasion) => {
            return ObjectHelper.isSameDate(occasion.startTime, date, TimeTick.DAY);
        });
    }

    function toggleDetails(event: CustomEvent): void {
        dispatch("toggleDetails", { occasion: event.detail.occasion });
    }

    function shift(event: CustomEvent): void {
        dispatch("shift", event.detail);
    }

    function resize(event: CustomEvent): void {
        dispatch("resize", event.detail);
    }

    function setOccasionsUpdater(): void {
        occasionsUpdater = setInterval(() => {
            setDayOccasions();
        });
    }

    function removeOccasionsUpdater(): void {
        clearInterval(occasionsUpdater);
    }

    onMount(() => {
        setDayOccasions();
        setOccasionsUpdater();
    });

    onDestroy(() => {
        removeOccasionsUpdater();
    });
</script>
<style>
    .calendar-day-container {
        position: relative;
        width: 100%;
        height: 100%;
        border-left: 1px solid var(--grey-300);
        user-select: none;
    }

    .calendar-day-current-time {
        box-sizing: border-box;
        position: absolute;
        width: 100%;
        height: 2px;
        background-color: var(--accent);
        box-shadow: 0 0 5px var(--accent);

        transition: top var(--transition-duration);
    }
</style>
<div class="calendar-day-container">
    {#each dayOccasions as occasion}
        <CalendarOccasion occasion={occasion} on:toggleDetails={toggleDetails} on:shift={shift} on:resize={resize} />
    {/each}
    {#if temporaryOccasion && ObjectHelper.isSameDate(temporaryOccasion.startTime, date, TimeTick.DAY)}
        <CalendarOccasion occasion={temporaryOccasion} on:shift={shift} on:resize={resize} />
    {/if}
    {#if ObjectHelper.isSameDate(date, currentTime, TimeTick.DAY)}
        <div class="calendar-day-current-time" style="top: {CalendarConstants.PIXEL_OFFSET + ObjectHelper.getTimeHours(currentTime) * CalendarConstants.PIXELS_PER_HOUR}px;"></div>
    {/if}
</div>