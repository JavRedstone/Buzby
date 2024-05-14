<script lang="ts">
    import logo from "$lib/elements/assets/logo.svg";
	import { RouteConstants } from "$lib/elements/classes/ui/header/RouteConstants";
	import { fade, fly } from "svelte/transition";

    let drawerOpen: boolean = false;
</script>
<style>
    .header-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 48px;
        background-color: var(--off-white-light);
    }

    .header-drawer-toggle {
        position: absolute;
        top: 8px;
        left: 8px;
        font-size: 32px;
        color: var(--primary-dark);

        cursor: pointer;
        user-select: none;

        transition: color var(--transition-duration);

        &:hover {
            color: var(--accent-dark);
        }
    }

    .header-logo {
        position: absolute;
        top: 3px;
        left: 44px;
        height: 42px;

        user-select: none;
    }

    .drawer-left-container {
        position: fixed;
        top: 48px;
        left: 50px;
        width: 115px;
        height: calc(100vh - 48px);
        background-color: var(--off-white-dark);

        z-index: 1000;
    }

    .drawer-left-container-small {
        position: fixed;
        top: 48px;
        left: 0;
        width: 50px;
        height: calc(100vh - 48px);
        background-color: #e0e4e7;

        z-index: 1000;
    }

    .drawer-icon {
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
            background-color: var(--off-white-light);
        }
    }

    .drawer-text {
        padding: 13px;
    }

    .drawer-right-container {
        position: fixed;
        top: 48px;
        right: 0;
        width: 100vw;
        height: calc(100vh - 48px);
        background-color: rgba(0, 0, 0, 0.25);

        z-index: 999;
    }
</style>
<div class="header-container">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span class="header-drawer-toggle material-symbols-rounded" on:click={() => drawerOpen = !drawerOpen}>
        {#if drawerOpen}
            close
        {:else}
            menu_open
        {/if}
    </span>
    <a href="/">
        <img class="header-logo" src={logo} alt="logo" />
    </a>
    {#if drawerOpen}
        <div class="drawer-left-container" transition:fly={{ x: -115, duration: 300 }}>
            {#each RouteConstants.IMPORTANT_ROUTES as routeItem}
                <a href={routeItem.route} on:click={() => drawerOpen = false}>
                    <div class="drawer-text">{routeItem.name}</div>
                </a>
            {/each}
        </div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="drawer-right-container" on:click={() => drawerOpen = false} transition:fade={{ duration: 300 }}></div>
    {/if}
    <div class="drawer-left-container-small">
        {#each RouteConstants.IMPORTANT_ROUTES as routeItem}
            <a href={routeItem.route} on:click={() => drawerOpen = false}>
                <span class="drawer-icon material-symbols-rounded" style="cursor: pointer;">{routeItem.icon}</span>
            </a>
        {/each}
    </div>
</div>