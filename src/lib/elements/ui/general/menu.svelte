<script lang="ts">
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
    import { scale } from 'svelte/transition';
    export let open: boolean = false;
</script>
<style>
    .menu-container {
        width: 100%;
        height: 100%;
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
    <div class="menu-container" transition:scale={{opacity: TransitionConstants.OPACITY, start: TransitionConstants.START, duration: TransitionConstants.DURATION}}>
        <slot></slot>
    </div>
{/if}