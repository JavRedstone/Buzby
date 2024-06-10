<script lang="ts">
	import Home from './../lib/elements/ui/layout/home.svelte';
	import Reminder from './../lib/elements/ui/layout/reminder.svelte';
	import { type User } from 'firebase/auth';
	import { userStatus } from '$lib/elements/stores/auth-store';
	import Core from "$lib/elements/ui/layout/core.svelte";
	import { onMount } from "svelte";

    let sideOpen: boolean = false;

    let currentUser: User = null;
    let w: Window = null;

    function getUser(): void {
        userStatus.subscribe((value) => {
            currentUser = value.currentUser;
        });
    }

    onMount(() => {
        w = window;
        getUser();
    });
</script>
<style>
    :global(body), :global(html) :global(main) {
        display: block !important;
        height: auto !important;
        width: auto !important;
        position: static !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow-x: hidden !important;

        /* cursor: url($lib/elements/assets/cursor/cursor.png) 0 0, auto !important; */

        --primary: #ffbe42;
        --primary-rgb: 255, 190, 66;
        --primary-light: #ffdb7b;
        --primary-lighter: #fcefe8;
        --primary-dark: #e8763d;
        --primary-darker: #d95b1d;

        --accent: #4284ff;
        --accent-rgb: 66, 132, 255;
        --accent-light: #63a4ff;
        --accent-lighter: #b0e0e6;
        --accent-dark: #1c5fbb;
        --accent-darker: #0d4aa2;

        --success: #4caf50;
        --success-rgb: 76, 175, 80;
        --success-light: #c8e6c9;
        --success-dark: #2e7d32;
        --error: #f44336;
        --error-rgb: 244, 67, 54;
        --error-light: #f8d7da;
        --error-dark: #b71c1c;
        --warning: #ff9800;
        --warning-rgb: 255, 152, 0;
        --warning-light: #ffe0b2;
        --warning-dark: #e65100;

        --off-white: #ebedef;
        --off-white-lightish: #eeefef;
        --off-white-light: #f2f3f5;
        --off-white-dark: #e0e4e7;

        --font-family: 'Poppins', sans-serif;
        --transition-duration: 0.3s;

        /* https://m2.material.io/design/color/the-color-system.html#tools-for-picking-colors */
        --grey-900: #212121;
        --grey-800: #424242;
        --grey-800-rgb: 66, 66, 66;
        --grey-700: #616161;
        --grey-600: #757575;
        --grey-500: #9e9e9e;
        --grey-400: #bdbdbd;
        --grey-300: #e0e0e0;
        --grey-200: #eeeeee;
        --grey-100: #f5f5f5;
        --grey-50: #fafafa;

        background-color: var(--off-white-light);
        font-family: var(--font-family) !important;
    }

    :global(main) {
        word-break: normal;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        width: 100vw;
    }

    :global(button, input, select, textarea, a, label) {
        font-family: var(--font-family) !important;
    }

    :global(a) {
        text-decoration: none;
        color: var(--accent-dark);

        transition: color var(--transition-duration);

        &:hover {
            color: var(--primary-dark) !important;
        }
    }

    :global(::-webkit-scrollbar) {
        width: 6px;
        height: 6px;
    }

    :global(::-webkit-scrollbar-thumb) {
        border-radius: 3px;

        background-color: #00000040;
    }

    :global(::-webkit-scrollbar-thumb:hover) {
        background-color: #00000080;
    }

    :global(::-webkit-scrollbar-corner) {
        background: transparent;
    }

    :global(.material-symbols-rounded) {
        user-select: none;
        font-variation-settings:
            'FILL' 1,
            'wght' 250,
            'GRAD' 0,
            'opsz' 24;
    }

    :global(.hexagon) {
        aspect-ratio: 1 / cos(30deg);
        clip-path: polygon(50% -50%, 100% 50%, 50% 150%, 0 50%);
    }

    :global(.hexagon-alt) {
        aspect-ratio: cos(30deg);
        clip-path: polygon(-50% 50%, 50% 100%, 150% 50%, 50% 0);
        /* Switch x and y of previous polygon */
    }

    .layout-slot-container {
        box-sizing: border-box;
        position: fixed;
        top: 48px; 
        height: calc(100vh - 48px);

        transition: left var(--transition-duration), width var(--transition-duration);
    }
</style>
<div class="layout-slot-container" style="{sideOpen ? 'left: 48px; width: calc(100vw - 48px);' : 'left: 0; width: 100vw;'}">
    {#if currentUser || (w && (location.pathname == '/login' || location.pathname == '/signup'))}
        <slot />
    {:else if w && location.pathname == '/'}
        <Home />
    {:else}
        <Reminder />
    {/if}
</div>
<Core bind:sideOpen={sideOpen} />