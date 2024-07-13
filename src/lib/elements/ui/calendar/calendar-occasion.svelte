<script lang="ts">
	import type { Occasion } from "$lib/elements/classes/data/time/Occasion";
	import { StringHelper } from "$lib/elements/helpers/StringHelper";

    export let occasion: Occasion;

    let startTimeFormatted: string = "";
    let endTimeFormatted: string = "";

    $: occasion ? formatTimes() : null;

    function formatTimes(): void {
        startTimeFormatted = StringHelper.getFormattedTime(occasion.startTime);
        endTimeFormatted = StringHelper.getFormattedTime(occasion.endTime);
    }
</script>
<style>
    
</style>
<div class="calendar-day-occasion-container">
    <div class="calendar-day-occasion">
        <div class="calendar-day-occasion-title">
            {occasion.name}
        </div>
        <div class="calendar-day-occasion-time">{startTimeFormatted} - {endTimeFormatted}</div>
    </div>
</div>