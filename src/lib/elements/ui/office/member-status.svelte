<script lang="ts">
	import { fly } from 'svelte/transition';
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
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import { setDoc, type DocumentData, type DocumentReference } from 'firebase/firestore';
	import { getFirestoreDoc } from '$lib/elements/firebase/firebase';
	import Snackbar from '../general/snackbar.svelte';

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

    let snackbarOpen: boolean = false;
    let snackbarText: string = "";
    let snackbarType: string = "neutral";

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

    function toggleEdit(): void {
        editOpen = !editOpen;
        if (editOpen) {
            setMemberStatus();            
        }
        else {
            saveMemberStatus();
        }
    }

    function saveMemberStatus(): void {
        if (!(currMember && currMember.id === member.id)) {
            return;
        }

        if (member.avatarHead === head && member.avatarEyes === eyes && member.avatarNeck === neck) {
            return;
        }

        member.avatarHead = head;
        member.avatarEyes = eyes;
        member.avatarNeck = neck;

        let memberDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('members', member.id);
        setDoc(memberDoc, member.compactify()).then(() => {
            memberStatus.update((value) => {
                value.currentMember = member;
                return value;
            });
            openSnackbar('Member status saved successfully.', 'success');
        }).catch((error) => {
            openSnackbar('Error saving member status. Please try again.', 'error');
        });
    }

    function shiftHeadLeft(): void {
        head--;
        if (head < MemberConstants.AVATAR_HEADS.DEFAULT) {
            head = MemberConstants.HEADS.length - 2;
        }
    }

    function shiftHeadRight(): void {
        head++;
        if (head >= MemberConstants.HEADS.length - 1) {
            head = MemberConstants.AVATAR_HEADS.DEFAULT;
        }
    }

    function shiftEyesLeft(): void {
        eyes--;
        if (eyes < MemberConstants.AVATAR_EYES.DEFAULT) {
            eyes = MemberConstants.EYES.length - 2;
        }
    }

    function shiftEyesRight(): void {
        eyes++;
        if (eyes >= MemberConstants.EYES.length - 1) {
            eyes = MemberConstants.AVATAR_EYES.DEFAULT;
        }
    }

    function shiftNeckLeft(): void {
        neck--;
        if (neck < MemberConstants.AVATAR_NECKS.DEFAULT) {
            neck = MemberConstants.NECKS.length - 2;
        }
    }

    function shiftNeckRight(): void {
        neck++;
        if (neck >= MemberConstants.NECKS.length - 1) {
            neck = MemberConstants.AVATAR_NECKS.DEFAULT;
        }
    }

    function openSnackbar(text: string, type: string): void {
        snackbarText = text;
        snackbarType = type;
        snackbarOpen = true;
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
        z-index: 1;
    }

    .member-status-edit {
        position: absolute;
        transform: translate(calc(-50% - 12px), calc(-50% - 24.375px));
        color: var(--grey-600);
        cursor: pointer;
        user-select: none;

        transition: color var(--transition-duration);
        
        &:hover {
            color: var(--grey-800);
        }
    }

    .member-status-cycle {
        position: absolute;
        transform: translate(calc(-50% - 12px), calc(-50% - 24.375px));
        color: var(--grey-600);
        font-size: 16px;
        cursor: pointer;
        user-select: none;

        transition: color var(--transition-duration);
        
        &:hover {
            color: var(--grey-800);
        }
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
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span class="member-status-edit material-symbols-rounded" style="left: {x + 24}px; top: {y + 24}px" on:click={toggleEdit}>edit</span>
    {#if editOpen}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="member-status-cycle material-symbols-rounded" style="left: {x - 20}px; top: {y - 18}px" on:click={shiftHeadLeft} transition:fly={{x:-10, duration:TransitionConstants.DURATION}}>chevron_left</span>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="member-status-cycle material-symbols-rounded" style="left: {x + 20}px; top: {y - 18}px" on:click={shiftHeadRight} transition:fly={{x:10, duration:TransitionConstants.DURATION}}>chevron_right</span>    
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="member-status-cycle material-symbols-rounded" style="left: {x - 20}px; top: {y - 4}px" on:click={shiftEyesLeft} transition:fly={{x:-10, duration:TransitionConstants.DURATION}}>chevron_left</span>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="member-status-cycle material-symbols-rounded" style="left: {x + 20}px; top: {y - 4}px" on:click={shiftEyesRight} transition:fly={{x:10, duration:TransitionConstants.DURATION}}>chevron_right</span>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="member-status-cycle material-symbols-rounded" style="left: {x - 20}px; top: {y + 10}px" on:click={shiftNeckLeft} transition:fly={{x:-10, duration:TransitionConstants.DURATION}}>chevron_left</span>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="member-status-cycle material-symbols-rounded" style="left: {x + 20}px; top: {y + 10}px" on:click={shiftNeckRight} transition:fly={{x:10, duration:TransitionConstants.DURATION}}>chevron_right</span>
    {/if}
{/if}
<Snackbar type={snackbarType} bind:open={snackbarOpen}>{snackbarText}</Snackbar>