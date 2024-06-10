<script lang="ts">
	import type { Member } from "$lib/elements/classes/data/project/Member";

    export let member: Member = null;
    export let size: string = "";
</script>
<style>
    .avatar-container {
        flex-shrink: 0;
        border-radius: 50%;
        background-color: var(--grey-300)
    }
</style>
<div class="avatar-container" style="width: {size}; height: {size};">

</div>