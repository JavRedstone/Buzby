<script lang="ts">
	import { slide } from "svelte/transition";

    export let label: string;
    export let items: string[];
    export let selected: string | null = null;

    let dropdownOpen: boolean = false;

    function select(item: string): void {
        selected = item;
        dropdownOpen = false;
    }
</script>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<style>
    .dropdown-button {
        width: 150px;
        height: 48px;
        padding: 8px;
        font-size: 16px;
        background-color: var(--off-white-dark);
        outline: none;
        border: none;
        
        cursor: pointer;
        user-select: none;
    }

    .dropdown-content {
        position: absolute;
        background-color: var(--off-white);
        
        user-select: none;
    }

    .dropdown-a {
        min-width: 100px;
        padding: 12px 16px;
        color: var(--gray-800);
        text-decoration: none;
        display: block;
        
        cursor: pointer;
        user-select: none;

        &:hover {
            background-color: var(--primary-light);
        }
    }
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="dropdown">
    <button class="dropdown-button" on:click={() => dropdownOpen = !dropdownOpen}>
        {#if selected}
            {selected}
        {:else}
            {label}
        {/if}
    </button>
    {#if dropdownOpen}
        <div class="dropdown-content" transition:slide={{duration: 200}}>
            {#each items as item}
                <!-- svelte-ignore a11y-missing-attribute -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <a class="dropdown-a" on:click={() => select(item)}>{item}</a>
            {/each}
        </div>
    {/if}
</div>