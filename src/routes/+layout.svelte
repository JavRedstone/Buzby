<script lang="ts">

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
        font-family: 'Poppins', sans-serif !important;
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

    :global(.center-layout) {
        width: 100vw; padding: 48px; padding-left: 0px; padding-right: 0px; text-align: center;
    }
</style>
<slot />