<script lang="ts">
    import logo from "$lib/elements/assets/logo.svg";
	import { RouteConstants } from "$lib/elements/classes/ui/header/RouteConstants";
	import { fade, fly } from "svelte/transition";
	import Dropdown from "../general/dropdown.svelte";

    let drawerOpen: boolean = false;

    let defaultGroup: string = "Overview";
    let selectedGroup: string = defaultGroup;

    $: if (selectedGroup == defaultGroup) {
        drawerOpen = false;
    }

    function toggleDrawer() {
        if (selectedGroup == defaultGroup) {
            return;
        }
        drawerOpen = !drawerOpen;
    }
</script>
<style>
    .core-header-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 48px;
        background-color: var(--off-white);
    }

    .core-header-logo {
        position: absolute;
        top: 3px;
        left: 44px;
        height: 42px;

        user-select: none;
    }

    .core-header-icon {
        position: absolute;
        top: 8px;
        font-size: 32px;
        color: var(--primary-dark);

        cursor: pointer;
        user-select: none;

        transition: color var(--transition-duration);

        &:hover {
            color: var(--accent-dark);
        }
    }

    .core-server-dropdown {
        position: absolute;
        top: 6px;
        left: 200px;
    }

    .core-drawer-left-container {
        position: fixed;
        top: 48px;
        left: 50px;
        width: 115px;
        height: calc(100vh - 48px);
        background-color: var(--off-white-dark);

        z-index: 1000;
    }

    .core-drawer-left-container-small {
        position: fixed;
        top: 48px;
        left: 0;
        width: 50px;
        height: calc(100vh - 48px);
        background-color: #e0e4e7;

        z-index: 1000;
    }

    .core-drawer-icon {
        font-size: 36px;
        margin: 3px;
        padding: 4px;
        color: var(--gray-700);
        border-radius: 50%;
        
        cursor: pointer;
        user-select: none;

        transition: color var(--transition-duration), background-color var(--transition-duration);

        &:hover {
            color: var(--primary-dark);
            background-color: var(--off-white);
        }
    }

    .core-drawer-link {
        display: block;
        padding: 7px;
        margin: 6px;
        margin-bottom: 12px;
        border-radius: 8px;
        color: var(--gray-700);
        
        transition: background-color var(--transition-duration);

        &:hover {
            background-color: var(--off-white);
        }
    }

    .core-drawer-right-container {
        position: fixed;
        top: 48px;
        right: 0;
        width: 100vw;
        height: calc(100vh - 48px);
        background-color: rgba(0, 0, 0, 0.1);

        z-index: 999;
    }
</style>
<div class="core-header-container">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span class="core-header-icon material-symbols-rounded" style="left: 8px;" on:click={toggleDrawer}>
        {#if drawerOpen}
            close
        {:else}
            menu_open
        {/if}
    </span>
    <a href="/">
        <img class="core-header-logo" src={logo} alt="logo" />
    </a>
    <div class="core-server-dropdown">
        <Dropdown label="Select group" items={["Overview", "Group 1", "Group 2", "Group 3"]} bind:defaultItem={defaultGroup} bind:selectedItem={selectedGroup} />
    </div>
    <a href='/login' on:click={() => drawerOpen = false}>
        <span class="core-header-icon material-symbols-rounded" style="right: 8px;">login</span>
    </a>
</div>
{#if drawerOpen && selectedGroup != defaultGroup}
    <div class="core-drawer-left-container" transition:fly={{ x: -115, duration: 300 }}>
        {#each RouteConstants.ALL_ROUTES as routeItem}
            <a class="core-drawer-link" href={routeItem.route} on:click={() => drawerOpen = false}>{routeItem.name}</a>
        {/each}
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="core-drawer-right-container" on:click={() => drawerOpen = false} transition:fade={{ duration: 300 }}></div>
{/if}
{#if selectedGroup != defaultGroup}
    <div class="core-drawer-left-container-small" transition:fly={{ x: -50, duration: 300 }}>
        {#each RouteConstants.ALL_ROUTES as routeItem}
            <a href={routeItem.route} on:click={() => drawerOpen = false}>
                <span class="core-drawer-icon material-symbols-rounded">{routeItem.icon}</span>
            </a>
        {/each}
    </div>
{/if}