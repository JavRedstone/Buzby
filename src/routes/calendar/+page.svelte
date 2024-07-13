<svelte:head>
    <title>Buzby | Calendar</title>
</svelte:head>
<script lang="ts">
	import { StringHelper } from '$lib/elements/helpers/StringHelper';
	import CalendarDay from '$lib/elements/ui/calendar/calendar-day.svelte';
	import { CalendarConstants } from '$lib/elements/classes/ui/calendar/CalendarConstants';
	import Snackbar from '$lib/elements/ui/general/snackbar.svelte';
	import type { Project } from "$lib/elements/classes/data/project/Project";
	import type { Occasion } from "$lib/elements/classes/data/time/Occasion";
	import { TimeTick } from "$lib/elements/classes/ui/gantt/TimeTick";
	import { ObjectHelper } from "$lib/elements/helpers/ObjectHelper";
	import { onDestroy, onMount } from "svelte";
	import { fade } from 'svelte/transition';
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import { projectSelected } from '$lib/elements/stores/project-store';

    let project: Project = null;
    let occasions: Occasion[] = []

    let snackbarOpen: boolean = false;
    let snackbarText: string = "";
    let snackbarType: string = "neutral";
    
    let startDateRange: Date = new Date();
    let currentOffset: number = 0;
    let currentInterval: any = null;
    let currentTime: Date = new Date();
    
    let days: Date[] = [];
    let times: Date[] = [];

    function setDateRange(): void {
        let centerDate: Date = ObjectHelper.addDateType(new Date(), TimeTick.WEEK, currentOffset);
        startDateRange = ObjectHelper.getFloorDate(centerDate, TimeTick.WEEK);

        setDays();
        setTimes();
    }

    function setDays(): void {
        days = [];
        for (let i = 0; i < CalendarConstants.DAYS_IN_WEEK; i++) {
            days.push(ObjectHelper.addDateType(startDateRange, TimeTick.DAY, i));
        }
    }

    function setTimes(): void {
        times = [];
        for (let i = 0; i < CalendarConstants.HOURS_IN_DAY + 1; i++) {
            times.push(ObjectHelper.addDateType(startDateRange, TimeTick.HOUR, i));
        }
    }

    function getProject(): void {
        projectSelected.subscribe((value) => {
            if (value.project != null) {
                project = value.project;

                occasions = project.occasions;
            } else {
                project = null;
                occasions = [];
            }
        });
    }
    
    function setCurrentInterval(): void {
        currentInterval = setInterval(() => {
            currentTime = new Date();
        }, 1000);
    }

    onMount(() => {
        getProject();
        setDateRange();
        setCurrentInterval();
    });

    onDestroy(() => {
        clearInterval(currentInterval);
    });
</script>
<style>
    .calendar-title {
        position: absolute;
		padding: 8px;
        font-size: 16px;
        font-weight: 500;
        color: var(--grey-800);
		user-select: none;
		z-index: 100;
    }

    .calendar-header-container {
        position: absolute;
        width: 100%;
        height: 48px;
        top: 8px;
        padding-bottom: 8px;
        box-shadow: 0 8px 4px -4px rgba(0, 0, 0, 0.1);
        user-select: none;
    }

    .calendar-header {
        position: absolute;
        width: calc(100% - 64px);
        margin-left: 64px;
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .calendar-header-day-container {
        width: calc(100% / 7);
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .calendar-header-day-date {
        font-size: 24px;
        font-weight: 500;
    }

    .calendar-header-day-name {
        font-size: 12px;
        margin-top: -8px;
    }

    .calendar-content-container {
        position: absolute;
        width: calc(100vw - 48px);
        height: calc(100vh - 104px);
        top: 64px;
        overflow-x: hidden;
        overflow-y: auto;
        user-select: none;
    }

    .calendar-content {
        position: relative;
        width: 100%;
        min-height: 100%;
    }
    
    .calendar-days-container {
        position: absolute;
        width: calc(100% - 64px);
        height: 100%;
        left: 64px;
        top: 0;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    .calendar-ticks-container {
        width: 100%;
        height: 100%;
        margin-left: 8px;
    }

    .calendar-tick-container {
        height: 24px;
        margin-bottom: 8px;
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .calendar-tick-date {
        width: 48px;
        font-size: 10px;
        color: var(--grey-600);
    }

    .calendar-tick-line {
        width: 100%;
        height: 1px;
    }
</style>
<div transition:fade={{duration: TransitionConstants.DURATION}}>
    <div class="calendar-title">Calendar</div>
    <div class="calendar-header-container">
        <div class="calendar-header">
            {#each days as day}
                <div class="calendar-header-day-container">
                    <div class="calendar-header-day-date" style="color: {currentTime.getDate() == day.getDate() ? 'var(--accent)' : 'var(--grey-600)'};">{day.getDate()}</div>
                    <div class="calendar-header-day-name" style="color: {currentTime.getDate() == day.getDate() ? 'var(--accent-light)' : 'var(--grey-400)'};">{StringHelper.getDayOfWeek(day)}</div>
                </div>
            {/each}
        </div>
    </div>
    <div class="calendar-content-container">
        <div class="calendar-content">
            <div class="calendar-ticks-container">
                {#each times as time}
                    <div class="calendar-tick-container">
                        <div class="calendar-tick-date">{StringHelper.getFormattedTime(time)}</div>
                        <div class="calendar-tick-line" style="background-color: {time.getHours() == 0 ? 'var(--grey-400)' : 'var(--grey-300)'}"></div>
                    </div>
                {/each}
            </div>
            <div class="calendar-days-container">
                {#each days as day}
                    <CalendarDay date={day} currentTime={currentTime} occasions={occasions} />
                {/each}
            </div>
        </div>
    </div>
</div>
<Snackbar type={snackbarType} bind:open={snackbarOpen}>{snackbarText}</Snackbar>