<script lang="ts">
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
    import { scale } from 'svelte/transition';

    export let open: boolean = false;

    export let left: string = "";
    export let right: string = "";
    export let top: string = "";
    export let bottom: string = "";
    export let width: string = "";
    export let height: string = "";
</script>
<style>
    .menu-container-parent {
        position: absolute;
        z-index: 1000;
    }

    .menu-container {
        width: 100%;
        height: 100%;
        max-width: calc(100vw - 128px);
        max-height: calc(100vh - 128px);
        padding: 8px;
        background-color: var(--off-white);
        box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.1);
        border: 1px solid var(--grey-300);
        border-radius: 8px;
        overflow-y: auto;
        user-select: none;

        color: var(--grey-800);
    }
</style>

{#if open}
    <div class="menu-container-parent" style="left: {left}; right: {right}; top: {top}; bottom: {bottom}; width: {width}; height: {height};">
        <div class="menu-container" transition:scale={{opacity: TransitionConstants.OPACITY, start: TransitionConstants.START, duration: TransitionConstants.DURATION}}>
            <slot></slot>
        </div>
    </div>
{/if}