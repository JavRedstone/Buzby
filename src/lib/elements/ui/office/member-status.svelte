<script lang="ts">
	import { MemberConstants } from '$lib/elements/classes/data/project/MemberConstants';
    import beeOnline from '$lib/elements/assets/member-status/bases/bee_online.svg';
    import beeDND from '$lib/elements/assets/member-status/bases/bee_dnd.svg';

    import eyeGlasses from '$lib/elements/assets/member-status/accessories/eyes/eye_glasses.png';
    import eyeMLG from '$lib/elements/assets/member-status/accessories/eyes/eye_mlg.png';

    import headBowtie from '$lib/elements/assets/member-status/accessories/head/head_bowtie.png';
    import headCrown from '$lib/elements/assets/member-status/accessories/head/head_crown.png';
    import headFedora from '$lib/elements/assets/member-status/accessories/head/head_fedora.png';

    import neckBowtie from '$lib/elements/assets/member-status/accessories/neck/neck_bowtie.png';
    import neckTie from '$lib/elements/assets/member-status/accessories/neck/neck_tie.png';
	import type { Member } from '$lib/elements/classes/data/project/Member';
	import { onMount } from 'svelte';
	import { memberStatus } from '$lib/elements/stores/project-store';

    export let member: Member = null;
    export let x: number = 0;
    export let y: number = 0;
    export let nameAbove: boolean = false;

    let base: number = member.online ? 0 : 1;
    let head: number = member.avatarHead;
    let eyes: number = member.avatarEyes;
    let neck: number = member.avatarNeck;

    let currMember: Member = null;

    let editOpen: boolean = false;

    let statusSelected: string = MemberConstants.STATUSES[0];
    let headSelected: string = MemberConstants.HEADS[0];
    let eyesSelected: string = MemberConstants.EYES[0];
    let neckSelected: string = MemberConstants.NECKS[0];

    function setMemberStatus(): void {
        base = member.online ? 0 : 1;
        head = member.avatarHead;
        eyes = member.avatarEyes;
        neck = member.avatarNeck;
    }

    function getCurrentMember(): void {
        memberStatus.subscribe((value) => {
            currMember = value.currentMember;
        })
    }

    function openEdit(): void {
        editOpen = !editOpen;
        setMemberStatus();
    }

    onMount(() => {
        setMemberStatus();
        getCurrentMember();
    });
</script>
<style>
    .member-status-seat-curr {
        position: absolute;
        width: 64px;
        height: 64px;
        transform: translate(calc(-50% - 12px), calc(-50% - 24.375px));
        background: linear-gradient(135deg, var(--primary-light), var(--primary), var(--primary-dark));
        border-radius: 50%;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.25);
        user-select: none;
    }

    .member-status-seat-other {
        position: absolute;
        width: 64px;
        height: 64px;
        transform: translate(calc(-50% - 12px), calc(-50% - 24.375px));
        background: linear-gradient(135deg, var(--grey-200), var(--grey-400), var(--grey-600));
        border-radius: 50%;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.25);
        user-select: none;
    }

    .member-status-base {
        position: absolute;
        width: 64px;
        height: 78px;
        transform: translate(calc(-50% - 12px), calc(-50% - 24.375px));
        user-select: none;
    }

    .member-status-accessory {
        position: absolute;
        width: 64px;
        height: 78px;
        transform: translate(calc(-50% - 12px), calc(-50% - 24.375px));
        user-select: none;
    }

    .member-status-name {
        position: absolute;
        transform: translate(calc(-50% - 12px), calc(-50% - 24.375px));
        text-align: center;
        font-size: 12px;
        font-weight: bold;
        color: var(--grey-800);
        user-select: none;
    }
</style>
{#if currMember && currMember.id === member.id}
    <div class="member-status-seat-curr" style="left: {x}px; top: {y}px;"></div>
{:else}
    <div class="member-status-seat-other" style="left: {x}px; top: {y}px;"></div>
{/if}
<img class="member-status-base" style="left: {x}px; top: {y}px;" src={base === 0 ? beeOnline : beeDND} alt="base" />

{#if head > -1}
    <img class="member-status-accessory" style="left: {x}px; top: {y}px;" src={head === 0 ? headBowtie : head === 1 ? headCrown : headFedora} alt="head" />
{/if}
{#if eyes > -1}
    <img class="member-status-accessory" style="left: {x}px; top: {y}px;" src={eyes === 0 ? eyeGlasses : eyeMLG} alt="eyes" />
{/if}
{#if neck > -1}
    <img class="member-status-accessory" style="left: {x}px; top: {y}px;" src={neck === 0 ? neckBowtie : neckTie} alt="neck" />
{/if}

<div class="member-status-name" style="left: {x}px; top: {nameAbove ? y + 48 : y - 48}px;">{member.displayName}</div>
{#if currMember && currMember.id === member.id}

{/if}