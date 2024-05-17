<script lang="ts">
	import Core from "$lib/elements/ui/layout/core.svelte";

    let sideOpen: boolean = false;
</script>
<style>
    :global(body),
    :global(html)
    :global(main) {
        display: block !important;
        height: auto !important;
        width: auto !important;
        position: static !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow-x: hidden !important;

        --primary: #ffbe42;
        --primary-light: #fcefe8;
        --primary-dark: #e8763d;
        --primary-darker: #d95b1d;

        --accent: #4284ff;
        --accent-light: #b0e0e6;
        --accent-dark: #1c5fbb;
        --accent-darker: #0d4aa2;

        --success: #4caf50;
        --error: #f44336;
        --warning: #ff9800;

        --off-white: #ebedef;
        --off-white-lightish: #eeefef;
        --off-white-light: #f2f3f5;
        --off-white-dark: #e0e4e7;

        --font-family: 'Poppins', sans-serif;
        --transition-duration: 0.3s;
        
        /* https://m2.material.io/design/color/the-color-system.html#tools-for-picking-colors */
        --gray-900: #212121;
        --gray-800: #424242;
        --gray-700: #616161;
        --gray-600: #757575;
        --gray-500: #9e9e9e;
        --gray-400: #bdbdbd;
        --gray-300: #e0e0e0;
        --gray-200: #eeeeee;
        --gray-100: #f5f5f5;
        --gray-50: #fafafa;
        
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
        background-color: #00000080
    }

    :global(.material-symbols-rounded) {
        user-select: none;
        font-variation-settings:
        'FILL' 0,
        'wght' 250,
        'GRAD' 0,
        'opsz' 24
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
    <slot />
</div>
<Core bind:sideOpen={sideOpen} />