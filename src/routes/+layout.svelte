<script lang="ts">
	import Core from "$lib/elements/ui/layout/core.svelte";


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
        --accent: #4284ff;
        --accent-light: #87ceeb;
        --accent-dark: #1c5fbb;

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

    :global(main, button, input, select, textarea, a) {
        
        font-family: var(--font-family) !important;
    }

    :global(a) {
        text-decoration: none;

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
</style>
<Core />
<slot />