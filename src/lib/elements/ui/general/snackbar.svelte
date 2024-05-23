<script lang="ts">
	import { TransitionConstants } from "$lib/elements/classes/ui/core/TransitionConstants";
	import { SnackbarConstants } from "$lib/elements/classes/ui/snackbar/SnackbarConstants";
	import { createEventDispatcher } from "svelte";
	import { scale } from "svelte/transition";

    export let open: boolean = false;
    export let type: string = 'neutral';

    let dispatch = createEventDispatcher();

    let selfOpen: boolean = false;

    function hide(): void {
        selfOpen = false;
        dispatch('hide');
    }

    function show(): void {
        selfOpen = true;
        setTimeout(hide, SnackbarConstants.DURATION);
        dispatch('show');
    }

    $: {
        if (open && !selfOpen) {
            show();
            open = false;
        }
    }
</script>
<style>
    .snackbar {
        position: fixed;
        bottom: 16px;
        left: 50%;
        transform: translateX(-50%);
        width: 40vw;
        background-color: var(--grey-800);
        color: white;
        text-align: center;
        padding: 8px;
        outline: none;
        border: none;
        border-radius: 8px;
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
        z-index: 1;

        cursor: pointer;
    }
</style>

{#if selfOpen}
    <button class="snackbar" style="background-color: {SnackbarConstants.getTypeByName(type).color}" on:click={hide} transition:scale={{opacity: TransitionConstants.OPACITY, start: TransitionConstants.START, duration: TransitionConstants.DURATION}}>
        <slot></slot>
    </button>
{/if}