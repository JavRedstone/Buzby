<script lang="ts">
	import type { Member } from "$lib/elements/classes/data/project/Member";
	import { MemberConstants } from "$lib/elements/classes/data/project/MemberConstants";
	import { memberStatus } from "$lib/elements/stores/project-store";
	import { onMount } from "svelte";

    export let member: Member = null;
    export let size: string = "";

    let base: number = member.avatarBase;

    function getCurrentMember(): void {
        memberStatus.subscribe((value) => {
            if (value.currentMember != null && member.id == value.currentMember.id) {
                member = value.currentMember;
                base = member.avatarBase;
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
    <div class="avatar-image-container" style="width: {size}; height: {size}; border-color: var(--{base == MemberConstants.AVATAR_BASES.ONLINE ? 'online' : base == MemberConstants.AVATAR_BASES.DND ? 'dnd' : 'offline'})">

    </div>
{/if}