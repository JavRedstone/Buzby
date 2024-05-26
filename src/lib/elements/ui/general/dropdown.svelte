<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { slide } from "svelte/transition";

    export let label: string;
    export let items: string[];
    export let defaultItem: string;
    export let selectedItem: string = defaultItem;
    export let selectedItemIdx: number = 0;
    export let open: boolean = false;

    let dispatch = createEventDispatcher();

    function toggle(): void {
        open = !open;
        dispatch("toggle", open);
    }

    function select(item: string, idx: number): void {
        selectedItem = item;
        selectedItemIdx = idx;
        open = false;

        dispatch("select", item);
    }
</script>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<style>
    .dropdown-button {
        padding-left: 8px;
        padding-top: 4px;
        padding-bottom: 4px;
        padding-right: 26px;
        outline: none;
        border: 2px solid var(--grey-400);
        border-radius: 4px;
        color: var(--grey-800);
        font-size: 16px;
        
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
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
        border: 1px solid var(--grey-300);
        
        user-select: none;
    }

    .dropdown-a {
        display: block;
        box-sizing: border-box;
        min-width: 100px;
        max-width: 500px;
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
    <button class="dropdown-button" on:click={toggle} on:blur={close}>
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
        <div class="dropdown-content" transition:slide={{duration: 200}}>
            {#each items as item, i}
                <!-- svelte-ignore a11y-missing-attribute -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <a class="dropdown-a" style="{(i == selectedItemIdx ? 'background-color: var(--off-white-lightish); color: var(--primary-dark);' : '') + (i != items.length - 1 ? item == defaultItem ? 'border-bottom: 3px solid var(--grey-400);' : 'border-bottom: 1px solid var(--grey-300);' : 'border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;')};" on:click={() => select(item, i)}>{item}</a>
            {/each}
        </div>
    {/if}
</div>