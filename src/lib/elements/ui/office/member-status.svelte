<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { MemberConstants } from '$lib/elements/classes/data/project/MemberConstants';
    import beeOnline from '$lib/elements/assets/member-status/bases/bee_online.svg';
    import beeDND from '$lib/elements/assets/member-status/bases/bee_dnd.svg';
    import beeOffline from '$lib/elements/assets/member-status/bases/bee_offline.svg';

    import eyeGlasses from '$lib/elements/assets/member-status/accessories/eyes/eye_glasses.png';
    import eyeMLG from '$lib/elements/assets/member-status/accessories/eyes/eye_mlg.png';

    import headBowtie from '$lib/elements/assets/member-status/accessories/head/head_bowtie.png';
    import headCrown from '$lib/elements/assets/member-status/accessories/head/head_crown.png';
    import headFedora from '$lib/elements/assets/member-status/accessories/head/head_fedora.png';

    import neckBowtie from '$lib/elements/assets/member-status/accessories/neck/neck_bowtie.png';
    import neckTie from '$lib/elements/assets/member-status/accessories/neck/neck_tie.png';

    import zzz from '$lib/elements/assets/member-status/accessories/zzz.svg';

	import type { Member } from '$lib/elements/classes/data/project/Member';
	import { createEventDispatcher, onMount } from 'svelte';
	import { currentMember, projectSelected } from '$lib/elements/stores/project-store';
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import { deleteDoc, setDoc, type DocumentData, type DocumentReference } from 'firebase/firestore';
	import { getFirestoreDoc } from '$lib/elements/firebase/firebase';
	import Snackbar from '../general/snackbar.svelte';
	import type { Project } from '$lib/elements/classes/data/project/Project';
	import Menu from '../general/menu.svelte';
	import { Ping } from '$lib/elements/classes/data/chat/Ping';
	import { StringHelper } from '$lib/elements/helpers/StringHelper';
	import { PingConstants } from '$lib/elements/classes/data/chat/PingConstants';

    let dispatch = createEventDispatcher();
    
    export let project: Project = null;
    export let member: Member = null;
    export let openedKickMember: Member = null;
    export let x: number = 0;
    export let y: number = 0;
    export let nameAbove: boolean = false;

    let base: number = member.statusBase;
    let head: number = member.statusHead;
    let eyes: number = member.statusEyes;
    let neck: number = member.statusNeck;

    let currMember: Member = null;

    let editOpen: boolean = false;
    let kickOpen: boolean = false;

    let snackbarOpen: boolean = false;
    let snackbarText: string = "";
    let snackbarType: string = "neutral";

    $: openedKickMember ? setMenuStatus() : null;

    function setMemberStatus(): void {
        base = member.statusBase;
        head = member.statusHead;
        eyes = member.statusEyes;
        neck = member.statusNeck;
    }

    function getCurrentMember(): void {
        currentMember.subscribe((value) => {
            currMember = value;
        });
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

        if (member.statusBase === base && member.statusHead === head && member.statusEyes === eyes && member.statusNeck === neck) {
            return;
        }

        member.statusBase = base;
        member.statusHead = head;
        member.statusEyes = eyes;
        member.statusNeck = neck;

        let memberDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('members', member.id);
        setDoc(memberDoc, member.compactify()).then(() => {
            openSnackbar('Member status saved successfully.', 'success');
        }).catch((error) => {
            openSnackbar('Error saving member status. Please try again.', 'error');
        });
    }

    function shiftBaseLeft(): void {
        base--;
        if (base < MemberConstants.STATUS_BASES.OFFLINE) {
            base = MemberConstants.STATUS_BASES.DND;
        }
    }

    function shiftBaseRight(): void {
        base++;
        if (base > MemberConstants.STATUS_BASES.DND) {
            base = MemberConstants.STATUS_BASES.OFFLINE;
        }
    }

    function shiftHeadLeft(): void {
        head--;
        if (head < MemberConstants.STATUS_HEADS.DEFAULT) {
            head = MemberConstants.HEADS.length - 2;
        }
    }

    function shiftHeadRight(): void {
        head++;
        if (head >= MemberConstants.HEADS.length - 1) {
            head = MemberConstants.STATUS_HEADS.DEFAULT;
        }
    }

    function shiftEyesLeft(): void {
        eyes--;
        if (eyes < MemberConstants.STATUS_EYES.DEFAULT) {
            eyes = MemberConstants.EYES.length - 2;
        }
    }

    function shiftEyesRight(): void {
        eyes++;
        if (eyes >= MemberConstants.EYES.length - 1) {
            eyes = MemberConstants.STATUS_EYES.DEFAULT;
        }
    }

    function shiftNeckLeft(): void {
        neck--;
        if (neck < MemberConstants.STATUS_NECKS.DEFAULT) {
            neck = MemberConstants.NECKS.length - 2;
        }
    }

    function shiftNeckRight(): void {
        neck++;
        if (neck >= MemberConstants.NECKS.length - 1) {
            neck = MemberConstants.STATUS_NECKS.DEFAULT;
        }
    }

    function openSnackbar(text: string, type: string): void {
        snackbarText = text;
        snackbarType = type;
        snackbarOpen = true;
    }

    function toggleKick(): void {
        kickOpen = !kickOpen;
        if (kickOpen) {
            dispatch('openKickMenu', { member: member });
        } else {
            dispatch('closeKickMenu', { member: member });
        }
    }

    function setMenuStatus(): void {
        if (openedKickMember.id != member.id) {
            kickOpen = false;
        }
    }

    function confirmKick(): void {
        if (currMember && currMember.id != member.id && currMember.id === project.ownerId) {
            for (let memberProject of project.memberProjects) {
                if (memberProject.memberId === member.id) {
                    let memberProjectDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('memberProjects', memberProject.id);
                    deleteDoc(memberProjectDoc).then(() => {
                        openSnackbar('Member kicked successfully.', 'success');
                        let ping: Ping = new Ping({
                            id: StringHelper.generateID(),
                            memberId: member.id,
                            projectId: project.id,
                            type: PingConstants.TYPES.PROJECT,
                            title: "Kicked from project",
                            message: `Member "${currMember.displayName}" kicked you from the project "${project.name}."`,
                            createdAtTemp: new Date(),
                        });
                        let pingDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('pings', ping.id);
                        setDoc(pingDoc, ping.compactify());
                    }).catch((error) => {
                        openSnackbar('Error kicking member. Please try again.', 'error');
                    });
                }
            }
        }
    }

    function cancelKick(): void {
        kickOpen = false;
    }

    onMount(() => {
        setMemberStatus();
        getCurrentMember();
    });
</script>
<style>
    .member-status-seat-curr {
        box-sizing: border-box;
        position: absolute;
        width: 64px;
        height: 64px;
        transform: translate(calc(-50% - 12px), calc(-50% - 24.375px));
        background: linear-gradient(135deg, var(--accent-lighter), var(--accent-light), var(--accent));
        /* background-color: var(--accent-light); */
        border: 2px solid var(--accent-dark);
        border-radius: 50%;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.25);
        user-select: none;
    }

    .member-status-seat-owner {
        box-sizing: border-box;
        position: absolute;
        width: 64px;
        height: 64px;
        transform: translate(calc(-50% - 12px), calc(-50% - 24.375px));
        background: linear-gradient(135deg, var(--primary-lighter), var(--primary-light), var(--primary));
        /* background-color: var(--primary); */
        border: 2px solid var(--primary-dark);
        border-radius: 50%;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.25);
        user-select: none;
    }

    .member-status-seat-other {
        box-sizing: border-box;
        position: absolute;
        width: 64px;
        height: 64px;
        transform: translate(calc(-50% - 12px), calc(-50% - 24.375px));
        background: linear-gradient(135deg, var(--grey-200), var(--grey-400), var(--grey-600));
        /* background-color: var(--grey-400); */
        border: 2px solid var(--grey-600);
        border-radius: 50%;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.25);
        user-select: none;
    }

    .member-status-base {
        position: absolute;
        width: 64px;
        height: 78px;
        transform: translate(calc(-50% - 12px), calc(-50% - 24.375px));
        user-select: none;

        transition: filter var(--transition-duration);
    }

    .member-status-accessory {
        position: absolute;
        width: 64px;
        height: 78px;
        transform: translate(calc(-50% - 12px), calc(-50% - 24.375px));
        user-select: none;
        
        transition: filter var(--transition-duration);
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

    .member-status-accessory-cycle {
        position: absolute;
        transform: translate(calc(-50% - 12px), calc(-50% - 24.375px));
        color: var(--grey-100);
        font-size: 16px;
        cursor: pointer;
        user-select: none;

        transition: color var(--transition-duration);
        
        &:hover {
            color: var(--grey-300);
        }
    }

    .member-status-base-cycle {
        position: absolute;
        transform: translate(calc(-50% - 12px), calc(-50% - 24.375px));
        color: var(--primary-dark);
        font-size: 16px;
        cursor: pointer;
        user-select: none;

        transition: color var(--transition-duration);
        
        &:hover {
            color: var(--primary-darker);
        }
    }

    .member-status-kick {
        position: absolute;
        transform: translate(calc(-50% - 12px), calc(-50% - 24.375px));
        color: var(--error);
        cursor: pointer;
        user-select: none;

        transition: color var(--transition-duration);
        
        &:hover {
            color: var(--error-dark);
        }
    }

    .member-status-kick-sure {
        font-size: 12px;
        font-weight: bold;
        color: var(--grey-800);
        padding: 4px;
        user-select: none;
    }

    .member-status-kick-confirm {
        padding-left: 4px;
        padding-right: 4px;
        padding-top: 2px;
        padding-bottom: 2px;
        background-color: var(--error);
        font-size: 12px;
        color: var(--grey-100);
        border: none;
        outline: none;
        border-radius: 4px;
        cursor: pointer;

        transition: background-color var(--transition-duration);

        &:hover {
            background-color: var(--error-dark);
        }
    }

    .member-status-kick-cancel {
        padding-left: 4px;
        padding-right: 4px;
        padding-top: 2px;
        padding-bottom: 2px;
        background-color: var(--grey-300);
        font-size: 12px;
        color: var(--grey-800);
        border: none;
        outline: none;
        border-radius: 4px;
        cursor: pointer;

        transition: background-color var(--transition-duration);

        &:hover {
            background-color: var(--grey-400);
        }
    }

    .member-status-state {
        position: absolute;
        transform: translate(calc(-50% - 12px), calc(-50% - 24.375px));
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 2px solid;

        transition: background-color var(--transition-duration), border-color var(--transition-duration);
    }
</style>
{#if currMember && currMember.id === member.id}
    <div class="member-status-seat-curr" style="left: {x}px; top: {y}px;"></div>
{:else if member.id === project.ownerId}
    <div class="member-status-seat-owner" style="left: {x}px; top: {y}px;"></div>
{:else}
    <div class="member-status-seat-other" style="left: {x}px; top: {y}px;"></div>
{/if}
<img class="member-status-base" style="left: {x}px; top: {y}px; filter: brightness({base == MemberConstants.STATUS_BASES.OFFLINE ? 75 : 100}%);" src={base == MemberConstants.STATUS_BASES.ONLINE ? beeOnline : base == MemberConstants.STATUS_BASES.DND ? beeDND : beeOffline} alt="base" />

{#if head > MemberConstants.STATUS_HEADS.DEFAULT}
    <img class="member-status-accessory" style="left: {x}px; top: {y}px; filter: brightness({base == MemberConstants.STATUS_BASES.OFFLINE ? 75 : 100}%);" src={head === MemberConstants.STATUS_HEADS.BOWTIE ? headBowtie : head === MemberConstants.STATUS_HEADS.CROWN ? headCrown : headFedora} alt="head" transition:fade={{duration:TransitionConstants.DURATION}} />
{/if}
{#if eyes > MemberConstants.STATUS_EYES.DEFAULT}
    <img class="member-status-accessory" style="left: {x}px; top: {y}px; filter: brightness({base == MemberConstants.STATUS_BASES.OFFLINE ? 75 : 100}%);" src={eyes === MemberConstants.STATUS_EYES.GLASSES ? eyeGlasses : eyeMLG} alt="eyes" transition:fade={{duration:TransitionConstants.DURATION}} />
{/if}
{#if neck > MemberConstants.STATUS_NECKS.DEFAULT}
    <img class="member-status-accessory" style="left: {x}px; top: {y}px; filter: brightness({base == MemberConstants.STATUS_BASES.OFFLINE ? 75 : 100}%);" src={neck === MemberConstants.STATUS_NECKS.BOWTIE ? neckBowtie : neckTie} alt="neck" transition:fade={{duration:TransitionConstants.DURATION}} />
{/if}

{#if base == MemberConstants.STATUS_BASES.OFFLINE}
    <img class="member-status-accessory" style="left: {x}px; top: {y}px;" src={zzz} alt="zzz" transition:fade={{duration:TransitionConstants.DURATION}} />
{/if}

<div class="member-status-state" style="left: {x - 24}px; top: {y + 24}px; background-color: var(--{base == MemberConstants.STATUS_BASES.ONLINE ? 'online' : base == MemberConstants.STATUS_BASES.DND ? 'dnd' : 'offline'}); border-color: var(--{base == MemberConstants.STATUS_BASES.ONLINE ? 'online-dark' : base == MemberConstants.STATUS_BASES.DND ? 'dnd-dark' : 'offline-dark'})"></div>

<div class="member-status-name" style="left: {x}px; top: {nameAbove ? y + 48 : y - 48}px;">{member.displayName}</div>

{#if currMember && currMember.id === member.id}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span class="member-status-edit material-symbols-rounded" style="left: {x + 24}px; top: {y + 24}px" on:click={toggleEdit}>edit</span>
    {#if editOpen}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="member-status-base-cycle material-symbols-rounded" style="left: {x - 34}px; top: {y + 24}px" on:click={shiftBaseLeft} transition:fly={{x:-10, duration:TransitionConstants.DURATION}}>chevron_left</span>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="member-status-base-cycle material-symbols-rounded" style="left: {x - 14}px; top: {y + 24}px" on:click={shiftBaseRight} transition:fly={{x:10, duration:TransitionConstants.DURATION}}>chevron_right</span>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="member-status-accessory-cycle material-symbols-rounded" style="left: {x - 20}px; top: {y - 18}px" on:click={shiftHeadLeft} transition:fly={{x:-10, duration:TransitionConstants.DURATION}}>chevron_left</span>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="member-status-accessory-cycle material-symbols-rounded" style="left: {x + 20}px; top: {y - 18}px" on:click={shiftHeadRight} transition:fly={{x:10, duration:TransitionConstants.DURATION}}>chevron_right</span>    
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="member-status-accessory-cycle material-symbols-rounded" style="left: {x - 20}px; top: {y - 4}px" on:click={shiftEyesLeft} transition:fly={{x:-10, duration:TransitionConstants.DURATION}}>chevron_left</span>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="member-status-accessory-cycle material-symbols-rounded" style="left: {x + 20}px; top: {y - 4}px" on:click={shiftEyesRight} transition:fly={{x:10, duration:TransitionConstants.DURATION}}>chevron_right</span>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="member-status-accessory-cycle material-symbols-rounded" style="left: {x - 20}px; top: {y + 10}px" on:click={shiftNeckLeft} transition:fly={{x:-10, duration:TransitionConstants.DURATION}}>chevron_left</span>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="member-status-accessory-cycle material-symbols-rounded" style="left: {x + 20}px; top: {y + 10}px" on:click={shiftNeckRight} transition:fly={{x:10, duration:TransitionConstants.DURATION}}>chevron_right</span>
    {/if}
{/if}
{#if currMember && currMember.id != member.id && currMember.id === project.ownerId}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span class="member-status-kick material-symbols-rounded" style="left: {x + 24}px; top: {y + 24}px" on:click={toggleKick}>person_remove</span>
    <Menu bind:open={kickOpen} left="{x + 24}px" top="{y - 58}px" width="88px">
        <div class="member-status-kick-sure">Confirm kick</div>
        <button class="member-status-kick-confirm" on:click={confirmKick}>Kick</button>
        <button class="member-status-kick-cancel" on:click={cancelKick}>Cancel</button>
    </Menu>
{/if}
<Snackbar type={snackbarType} bind:open={snackbarOpen}>{snackbarText}</Snackbar>