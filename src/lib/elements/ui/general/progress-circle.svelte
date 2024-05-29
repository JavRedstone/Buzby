<script lang="ts">
	import { ProgressCircleConstants } from "$lib/elements/classes/ui/general/progress/ProgressCircleConstants";
	import { onDestroy, onMount } from "svelte";

    export let radius: number = ProgressCircleConstants.DEFAULT_RADIUS;
    export let percentage: number = 0;
    export let autoFill: boolean = false;
    export let autofillTime: number = 0;

    let autofillInterval = null;

    onMount(() => {
        if (autoFill) {
            autofillInterval = setInterval(() => {
                percentage += 100 / (autofillTime / ProgressCircleConstants.AUTOFILL_INTERVAL);
                if (percentage >= 100) {
                    percentage = 100;
                }
            }, ProgressCircleConstants.AUTOFILL_INTERVAL);
        }
    });

    onDestroy(() => {
        if (autofillInterval) {
            clearInterval(autofillInterval);
        }
    });
</script>
<style>
    .progress-circle-container {
        position: relative;
    }

    .progress-circle-svg {
        position: absolute;
        transform: rotate(-90deg);
    }

    .progress-circle-svg-circle {
        fill: none;
        stroke: var(--accent);
        stroke-linecap: round;

        transition: stroke-dashoffset var(--transition-duration) linear;
    }
</style>
<div class="progress-circle-container" style="width: {radius * 2 * (1 + ProgressCircleConstants.STROKE_WIDTH_RATIO)}px; height: {radius * 2 * (1 + ProgressCircleConstants.STROKE_WIDTH_RATIO)}px;">
    <svg class="progress-circle-svg" viewBox="0 0 {radius * 2 * (1 + ProgressCircleConstants.STROKE_WIDTH_RATIO)} {radius * 2 * (1 + ProgressCircleConstants.STROKE_WIDTH_RATIO)}">
        <circle class="progress-circle-svg-circle " cx={radius * (1 + ProgressCircleConstants.STROKE_WIDTH_RATIO)} cy={radius * (1 + ProgressCircleConstants.STROKE_WIDTH_RATIO)} r={radius} stroke-width={radius * ProgressCircleConstants.STROKE_WIDTH_RATIO} stroke-dasharray={2 * Math.PI * radius} stroke-dashoffset={2 * Math.PI * radius * (1 - percentage / 100)}></circle>
    </svg>
</div>