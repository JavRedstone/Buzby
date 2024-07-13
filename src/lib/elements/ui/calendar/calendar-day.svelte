<script lang="ts">
	import type { Occasion } from "$lib/elements/classes/data/time/Occasion";
	import { onMount } from "svelte";
	import CalendarOccasion from "./calendar-occasion.svelte";

    export let date: Date = new Date();
    export let currentTime: Date = new Date();
    export let occasions: Occasion[] = [];

    let dayOccasions: Occasion[] = [];

    $: date || occasions ? setDayOccasions() : null;

    function setDayOccasions(): void {
        dayOccasions = occasions.filter((occasion) => {
            return occasion.startTime.getDate() == date.getDate();
        });
    }

    onMount(() => {
        setDayOccasions();
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
</style>
<div class="calendar-day-container">
    {#each dayOccasions as occasion}
        <CalendarOccasion occasion={occasion} />
    {/each}
</div>