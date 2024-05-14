<script lang="ts">
	import { slide } from "svelte/transition";

    export let label: string;
    export let items: string[];
    export let defaultItem: string;
    export let selectedItem: string | null = null;

    let dropdownOpen: boolean = false;

    function select(item: string): void {
        selectedItem = item;
        dropdownOpen = false;
    }
</script>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<style>
    .dropdown-button {
        padding-left: 8px;
        padding-top: 4px;
        padding-bottom: 4px;
        padding-right: 26px;
        font-size: 16px;
        outline: none;
        border: 2px solid var(--gray-400);
        border-radius: 4px;
        
        cursor: pointer;
        user-select: none;

        transition: border-color var(--transition-duration);

        &:hover {
            border-color: var(--accent);
        }
    }

    .dropdown-button-arrow {
        position: absolute;
        right: 4px;
    }

    .dropdown-content {
        position: absolute;
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
        
        user-select: none;
    }

    .dropdown-a {
        display: block;
        box-sizing: border-box;
        min-width: 175px;
        max-width: 500px;
        padding-left: 8px;
        padding-right: 8px;
        padding-top: 4px;
        padding-bottom: 4px;
        color: var(--gray-800);
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
    <button class="dropdown-button" on:click={() => dropdownOpen = !dropdownOpen}>
        {#if selectedItem}
            {selectedItem}
        {:else}
            {label}
        {/if}
        {#if dropdownOpen}
            <span class="dropdown-button-arrow material-symbols-rounded">keyboard_arrow_up</span>
        {:else}
            <span class="dropdown-button-arrow material-symbols-rounded">keyboard_arrow_down</span>
        {/if}
    </button>
    {#if dropdownOpen}
        <div class="dropdown-content" transition:slide={{duration: 200}}>
            {#each items as item, i}
                <!-- svelte-ignore a11y-missing-attribute -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <a class="dropdown-a" style="{i != items.length - 1 ? item == defaultItem ? 'border-bottom: 5px solid var(--gray-400)' : 'border-bottom: 1px solid var(--gray-300)' : 'border-bottom-left-radius: 8px; border-bottom-right-radius: 8px'};" on:click={() => select(item)}>{item}</a>
            {/each}
        </div>
    {/if}
</div>