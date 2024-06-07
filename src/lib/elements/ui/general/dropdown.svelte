<script lang="ts">
	import { TransitionConstants } from "$lib/elements/classes/ui/core/TransitionConstants";
	import { createEventDispatcher } from "svelte";
	import { slide } from "svelte/transition";

    export let label: string;
    export let items: string[];
    export let defaultItem: string;
    export let selectedItem: string = defaultItem;
    export let selectedItemIdx: number = 0;
    export let open: boolean = false;
    export let small: boolean = false;
    export let maxHeight: string;

    let dispatch = createEventDispatcher();

    function toggle(): void {
        open = !open;
        dispatch("toggle");
    }

    function select(item: string, idx: number): void {
        selectedItem = item;
        selectedItemIdx = idx;
        open = false;

        dispatch("select");
    }
</script>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<style>
    .dropdown-button {
        position: relative;
        outline: none;
        border: 2px solid var(--grey-400);
        border-radius: 4px;
        color: var(--grey-800);
        
        cursor: pointer;
        user-select: none;

        transition: border-color var(--transition-duration);

        &:hover {
            border-color: var(--accent-light);
        }

        &:focus {
            border-color: var(--accent);
        }
    }

    .dropdown-button-arrow {
        position: absolute;
        margin-right: 4px;
        color: var(--grey-800);
    }

    .dropdown-content {
        position: absolute;
        min-width: 100px;
        max-width: 500px;
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
        border: 1px solid var(--grey-300);
        overflow-y: auto;
        background-color: var(--off-white);
        
        user-select: none;
    }

    .dropdown-a {
        display: block;
        box-sizing: border-box;
        width: 100%;
        padding-left: 8px;
        padding-right: 8px;
        padding-top: 4px;
        padding-bottom: 4px;
        color: var(--grey-800);
        text-decoration: none;
        background-color: var(--off-white);
        
        cursor: pointer;
        user-select: none;

        transition: background-color var(--transition-duration);

        &:hover {
            background-color: var(--off-white-lightish);
        }
    }
</style>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="dropdown">
    <button class="dropdown-button" style="{!small ? 'padding-left: 8px; padding-top: 4px; padding-bottom: 4px; padding-right: 26px; border-width: 2px; font-size: 16px;' : 'padding-left: 4px; padding-top: 2px; padding-bottom: 2px; padding-right: 20px; border-width: 1px; font-size: 12px;'}" on:click={toggle} on:blur={close}>
        {#if selectedItem}
            {selectedItem}
        {:else}
            {label}
        {/if}
        {#if open}
            <span class="dropdown-button-arrow material-symbols-rounded">keyboard_arrow_up</span>
        {:else}
            <span class="dropdown-button-arrow material-symbols-rounded">keyboard_arrow_down</span>
        {/if}
    </button>
    {#if open}
        <div class="dropdown-content" style="max-height: {maxHeight ? maxHeight : '250px'}" transition:slide={{duration: TransitionConstants.DURATION}}>
            {#each items as item, i}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div class="dropdown-a" style="{(i == selectedItemIdx ? 'background-color: var(--off-white-lightish); color: var(--primary-dark);' : '') + (i != items.length - 1 ? item == defaultItem ? 'border-bottom: 3px solid var(--grey-400);' : 'border-bottom: 1px solid var(--grey-300);' : 'border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;') + (small ? 'font-size: 12px;' : 'font-size: 16px;')};" on:click={() => select(item, i)}>{item}</div>
            {/each}
        </div>
    {/if}
</div>