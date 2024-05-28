<script lang="ts">
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import { TooltipConstants } from '$lib/elements/classes/ui/general/tooltip/TooltipConstants';
	import { scale } from 'svelte/transition';

    export let visible: boolean = false;

    let mousedOver: boolean = false;

    function open() {
        mousedOver = true;
        setTimeout(() => {
            if (mousedOver) {
                visible = true;
            }
        }, TooltipConstants.DELAY);
    }

    function close() {
        visible = false;
        mousedOver = false;
    }
</script>
<style>
    .tooltip-container {
        position: relative;
        display: inline-block;
        width: 100%;
        height: 100%;
    }

    .tooltip {
        width: 100px;
        background-color: rgba(var(--grey-800-rgb), 0.9);
        font-size: 12px;
        color: #fff;
        text-align: center;
        border-radius: 6px;
        padding: 4px;
        position: absolute;
        z-index: 1;
        bottom: 125%;
        left: 50%;
        transform: translateX(-50%);
    }
</style>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<div class="tooltip-container" on:mouseover={open} on:mouseleave={close}>
    {#if visible}
        <div class="tooltip" transition:scale={{ opacity: TransitionConstants.OPACITY, start: TransitionConstants.START, duration: TransitionConstants.DURATION}}>
            <slot></slot>
        </div>
    {/if}
</div>