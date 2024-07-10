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
    .avatar-container {
        flex-shrink: 0;
        border-radius: 50%;
        background-color: var(--grey-300)
    }

    .avatar-state {
        position: absolute;
        bottom: 2px;
        right: 2px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        border: 1px solid;

        transition: background-color var(--transition-duration), border-color var(--transition-duration);
    }
</style>
{#if member != null}
    <div class="avatar-container" style="width: {size}; height: {size};">

    </div>
    <div class="avatar-state" style="background-color: var(--{base == MemberConstants.AVATAR_BASES.ONLINE ? 'online' : base == MemberConstants.AVATAR_BASES.DND ? 'dnd' : 'offline'}); border-color: var(--{base == MemberConstants.AVATAR_BASES.ONLINE ? 'online-dark' : base == MemberConstants.AVATAR_BASES.DND ? 'dnd-dark' : 'offline-dark'})"></div>
{/if}