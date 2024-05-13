<script lang="ts">
    import logo from "$lib/elements/assets/logo.svg";
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
        backdrop-filter: blur(10px);
    }

    .header-drawer-toggle {
        position: absolute;
        top: 12px;
        left: 12px;
        cursor: pointer;
        color: var(--orange);
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
        left: 0;
        width: 200px;
        height: calc(100vh - 48px);
        background-color: white;
        
        /* animation: slideInFromLeft 0.5s,  fadeIn 0.5s; */

        z-index: 1000;
    }

    .drawer-right-container {
        position: fixed;
        top: 48px;
        right: 0;
        width: 100vw;
        height: calc(100vh - 48px);
        background-color: rgba(0, 0, 0, 0.25);
        backdrop-filter: blur(10px);

        z-index: 999;
    }
</style>
<div class="header-container">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span class="header-drawer-toggle material-symbols-outlined" on:click={() => drawerOpen = !drawerOpen}>
        {#if drawerOpen}
            close
        {:else}
            menu_open
        {/if}
    </span>
    <img class="header-logo" src={logo} alt="logo" />
    {#if drawerOpen}
        <div class="drawer-left-container" transition:fly={{ x: -200, duration: 300 }}>
        </div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="drawer-right-container" on:click={() => drawerOpen = false} transition:fade={{ duration: 300 }}></div>
    {/if}
</div>