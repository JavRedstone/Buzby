<script lang="ts">
	import { SnackbarConstants } from "$lib/elements/classes/ui/snackbar/SnackbarConstants";
	import { createEventDispatcher } from "svelte";
	import { scale } from "svelte/transition";

    export let open: boolean = false;
    export let text: string = '';
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
        background-color: var(--gray-800);
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
    <button class="snackbar" style="background-color: {SnackbarConstants.getTypeByName(type).color}" on:click={hide} transition:scale={{opacity: 0, start: 0.9, duration: 300}}>
        {text}
    </button>
{/if}