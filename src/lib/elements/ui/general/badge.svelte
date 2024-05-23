<script lang="ts">
	import { TransitionConstants } from "$lib/elements/classes/ui/core/TransitionConstants";
    import { scale } from "svelte/transition";

</script>
<style>
    .badge-container {
        position: absolute;
        top: 6px;
        padding: 4px;
        border-radius: 100%;
        background-color: var(--error);
        color: var(--grey-100);
        font-size: 8px;
        line-height: 0.5;
        text-align: center;
        white-space: nowrap;
        vertical-align: baseline;
        user-select: none;
    }
</style>
<span class="badge-container" transition:scale={{opacity: TransitionConstants.OPACITY, start: TransitionConstants.START, duration: TransitionConstants.DURATION}}>
    <slot></slot>
</span>