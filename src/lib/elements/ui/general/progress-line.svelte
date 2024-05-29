<script lang="ts">
	import { ProgressLineConstants } from "$lib/elements/classes/ui/general/progress/ProgressLineConstants";
	import { onDestroy, onMount } from "svelte";

    export let length: number = null;
    export let percentage: number = 0;
    export let autoFill: boolean = false;
    export let autofillTime: number = 0;

    let autofillInterval = null;

    onMount(() => {
        if (autoFill) {
            autofillInterval = setInterval(() => {
                percentage += 100 / (autofillTime / ProgressLineConstants.AUTOFILL_INTERVAL);
                if (percentage >= 100) {
                    percentage = 100;
                }
            }, ProgressLineConstants.AUTOFILL_INTERVAL);
        }
    });

    onDestroy(() => {
        if (autofillInterval) {
            clearInterval(autofillInterval);
        }
    });
</script>
<style>
    .progress-line {
        position: relative;
        height: 3px;
        background-color: var(--accent);
        border-radius: 1.5px;

        transition: width var(--transition-duration) linear;
    }
</style>

<div class="progress-line" style={length == null ? `width: calc(100% * ${percentage / 100});` : `width: ${length * percentage / 100}px;`}></div>