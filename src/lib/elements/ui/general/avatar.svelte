<script lang="ts">
	import type { Member } from "$lib/elements/classes/data/project/Member";
	import { MemberConstants } from "$lib/elements/classes/data/project/MemberConstants";
	import { currentMember } from "$lib/elements/stores/project-store";
	import { onMount } from "svelte";

    export let member: Member = null;
    export let size: string = "";

    let base: number = 0;

    $: member ? base = member.statusBase : null;

    function getCurrentMember(): void {
        currentMember.subscribe((value) => {
            if (value != null && member != null && member.id == value.id) {
                member = value;
                base = member.statusBase;
            }
        })
    }

    onMount(() => {
        getCurrentMember();
    })
</script>
<style>
    .avatar-image-container {
        position: relative;
        box-sizing: border-box;
        flex-shrink: 0;
        border-radius: 50%;
        border: 2px solid;
        background-color: var(--grey-300);
        
        transition: border-color var(--transition-duration);
    }
</style>
{#if member != null}
    <div class="avatar-image-container" style="width: {size}; height: {size}; border-color: var(--{base == MemberConstants.STATUS_BASES.ONLINE ? 'online' : base == MemberConstants.STATUS_BASES.DND ? 'dnd' : 'offline'})">

    </div>
{/if}