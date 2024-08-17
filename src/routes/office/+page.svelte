<svelte:head>
    <title>Buzby | Office</title>
</svelte:head>
<script lang="ts">
	import { onDestroy } from 'svelte';
	import { currentMember } from '$lib/elements/stores/project-store';
	import { CollectionReference, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
	import { getFirestoreCollection, getFirestoreDoc } from '$lib/elements/firebase/firebase';
	import { DocumentReference, type DocumentData } from 'firebase/firestore';
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import { fade } from 'svelte/transition';
	import { projectSelected } from '$lib/elements/stores/project-store';
	import { Project } from "$lib/elements/classes/data/project/Project";
	import Snackbar from '$lib/elements/ui/general/snackbar.svelte';
	import Discussion from "$lib/elements/ui/office/discussion.svelte";
	import MemberStatus from '$lib/elements/ui/office/member-status.svelte';
	import { onMount } from 'svelte';
	import { MathHelper } from '$lib/elements/helpers/MathHelper';
	import { Vector2 } from 'three';
	import { Ping } from '$lib/elements/classes/data/chat/Ping';
	import { StringHelper } from '$lib/elements/helpers/StringHelper';
	import { PingConstants } from '$lib/elements/classes/data/chat/PingConstants';
	import { Member } from '$lib/elements/classes/data/project/Member';
	import { MemberProject } from '$lib/elements/classes/data/project/MemberProject';

    let currMember: Member = null;
    let project: Project = null;

    let memberAngles: number[] = [];
    let memberOffsets: Vector2[] = [];
    let memberPositions: Vector2[] = [];
    let openedKickMember: Member = null;

    let inviteEmail: string = '';
    let inviteProcessing: boolean = false;

    let snackbarOpen: boolean = false;
    let snackbarText: string = "";
    let snackbarType: string = "neutral";

    function getCurrMember(): void {
        currentMember.subscribe((value) => {
            currMember = value;
            if (currMember != null) {
                projectSelected.subscribe((value) => {
                    project = currMember.projects.find((project) => project.id == value);
                    if (project) {
                        setMemberStatusPositions();
                    }
                });
            }
        });
    }

    function setMemberStatusPositions(): void {
        if (project && project.members) {
            memberOffsets = [];
            memberPositions = [];
            memberAngles = MathHelper.getAnglesForPolygon(project.members.length);
            for (let i = 0; i < project.members.length; i++) {
                let offset: Vector2 = MathHelper.getOffsetForAngle(memberAngles[i], -Math.PI / 2, window.innerWidth / 8);
                memberOffsets.push(offset);
                memberPositions.push(offset.clone().add(new Vector2(window.innerWidth / 4, window.innerHeight / 2)));
            }
        }
    }

    function inviteMember(): void {
        if (inviteProcessing) {
            return;
        } else {
            inviteProcessing = true;
        }

        if (inviteEmail.trim().length == 0) {
            openSnackbar("Please enter an email.", "error");
            inviteProcessing = false;
            return;
        }

        if (currMember) {
            let membersCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection("members");
            let membersQuery = query(membersCollection, where("email", "==", inviteEmail));
            let memberIds: string[] = [];
            let members: Member[] = [];
            
            inviteEmail = '';
            
            getDocs(membersQuery).then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    let member: Member = new Member(doc.data());
                    memberIds.push(member.id);
                    members.push(member);
                });

                let hasJoinedMember: boolean = false;
                let hasRequestedMember: boolean = false;
                if (members.length > 0) {
                    for (let joinedMember of project.joinedMembers) {
                        if (joinedMember.id == members[0].id) {
                            hasJoinedMember = true;
                            break;
                        }
                    }
                    for (let requestedMember of project.requestedMembers) {
                        if (requestedMember.id == members[0].id) {
                            hasRequestedMember = true;
                            break;
                        }
                    }
                }

                if (memberIds.length == 0) {
                    openSnackbar("No member found with that email.", "error");
                    inviteProcessing = false;
                    return;
                } else if (memberIds.length > 1) {
                    openSnackbar("Multiple members found with that email. Please try again.", "error");
                    inviteProcessing = false;
                    return;
                } else if (memberIds[0] == currMember.id) {
                    openSnackbar("You cannot invite yourself to a project.", "error");
                    inviteProcessing = false;
                    return;
                } else if (hasJoinedMember) {
                    openSnackbar("Member is already in the project.", "error");
                    inviteProcessing = false;
                    return;
                } else if (hasRequestedMember) {
                    openSnackbar("Member is already requested to join the project.", "error");
                    inviteProcessing = false;
                    return;
                } else if (project.owner.id == memberIds[0]) {
                    openSnackbar("Member is already the owner of the project.", "error");
                    inviteProcessing = false;
                    return;
                }

                let memberProject: MemberProject = new MemberProject({
                    id: StringHelper.generateID(),
                    memberId: memberIds[0],
                    projectId: project.id,
                    isOwner: false,
                    hasJoined: false,
                    createdAtTemp: serverTimestamp()
                });

                let memberProjectDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('memberProjects', memberProject.id);
                setDoc(memberProjectDoc, memberProject.compactify()).then(() => {
                    openSnackbar("Successfully invited member.", "success");
                    inviteProcessing = false;

                    let ping: Ping = new Ping({
                        id: StringHelper.generateID(),
                        memberId: memberIds[0],
                        projectId: project.id,
                        type: PingConstants.TYPES.PROJECT,
                        title: "Project request",
                        message: `Member "${currMember.displayName}" requested to add you to the project "${project.name}."`,
                        read: false,
                        createdAtTemp: serverTimestamp(),
                    });
                    let pingDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('pings', ping.id);
                    setDoc(pingDoc, ping.compactify());
                }).catch(() => {
                    openSnackbar("An error occurred while inviting the member. Please try again.", "error");
                    inviteProcessing = false;
                });
            }).catch(() => {
                openSnackbar("An error occurred while inviting the member. Please try again.", "error");
                inviteProcessing = false;
            });
        } else {
            openSnackbar("An error occurred while inviting the member. Please try again.", "error");
            inviteProcessing = false;
        }
    }

    function setOpenedMenu(event: CustomEvent): void {
        openedKickMember = event.detail.member;
    }

    function setClosedMenu(event: CustomEvent): void {
        if (openedKickMember && openedKickMember.id === event.detail.member.id) {
            openedKickMember = null;
        }
    }

    function setListeners(): void {
        window.addEventListener('resize', () => {
            setMemberStatusPositions();
        })
    }

    function removeListeners(): void {
        window.removeEventListener('resize', () => {
            setMemberStatusPositions();
        })
    }

    function openSnackbar(text: string, type: string): void {
        snackbarText = text;
        snackbarType = type;
        snackbarOpen = true;
    }
    
    onMount(() => {
        getCurrMember();
        setListeners();
    });

    onDestroy(() => {
        removeListeners();
    });
</script>
<style>
    .office-title-container {
        position: absolute;
        width: 100%;
        display: flex;
        align-items: center;
        padding: 8px;
        border-bottom: 1px solid var(--grey-300);
    }

    .office-title {
        font-size: 16px;
        font-weight: 500;
        color: var(--grey-800);
    }

    .office-table-connector {
        box-sizing: border-box;
        position: absolute;
        top: 50%;
        left: 25%;
        transform: translate(-50%, -50%);
        width: 25vw;
        height: 25vw;
        border: 2px solid var(--grey-300);
        border-radius: 100%;
    }

    .office-table {
        box-sizing: border-box;
        position: absolute;
        top: 50%;
        left: 25%;
        transform: translate(-50%, -50%);
        width: calc(25vw - 96px);
        height: calc(25vw - 96px);
        background: linear-gradient(135deg, var(--primary-light), var(--primary), var(--primary-dark));
        /* background-color: var(--primary); */
        border: 2px solid var(--primary-dark);
        border-radius: 100%;
        box-shadow: 0 0 32px rgba(0, 0, 0, 0.25);
    }

    .office-table-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 64px;
        color: var(--primary-dark);
    }

    .office-title-field {
        width: 30%;
        display: flex;
        align-items: center;
        position: absolute;
        left: calc(20% - 16px);
    }

    .office-title-icon {
        margin-right: 4px;
        color: var(--grey-800);
    }

    .office-title-input {
        box-sizing: border-box;
        width: 100%;
        padding-left: 4px;
        padding-right: 4px;
        padding-top: 2px;
        padding-bottom: 2px;
        margin-right: 4px;
        background-color: var(--grey-200);
        outline: none;
        border: 1px solid var(--grey-400);
        border-radius: 4px;
        font-size: 12px;
        color: var(--grey-800);

        transition: border-color var(--transition-duration);

        &:hover {
            border-color: var(--accent-light);
        }

        &:focus {
            border-color: var(--accent);
        }
    }

    .office-title-action {
        padding-left: 4px;
        padding-right: 4px;
        padding-top: 2px;
        padding-bottom: 2px;
        background-color: var(--primary);
        font-size: 12px;
        color: var(--grey-800);
        border: none;
        outline: none;
        border-radius: 4px;
        cursor: pointer;

        transition: background-color var(--transition-duration), color var(--transition-duration);

        &:hover {
            background-color: var(--accent);
            color: var(--grey-100);
        }
    }
</style>
<div transition:fade={{duration: TransitionConstants.DURATION}}>
    <div class="office-title-container">
        <div class="office-title">Office</div>
        <div class="office-title-field">
            <span class="office-title-icon material-symbols-rounded">email</span>
            <input class="office-title-input" type="text" placeholder="Enter email" bind:value={inviteEmail} />
            <button class="office-title-action" on:click={inviteMember}>Invite</button>
        </div>
    </div>
    <div class="office-table-connector"></div>
    <div class="office-table">
        <span class="office-table-icon material-symbols-rounded">diversity_2</span>
    </div>
    {#if project}
        {#each project.members as member, i}
            <MemberStatus project={project} member={member} openedKickMember={openedKickMember} x={memberPositions[i].x} y={memberPositions[i].y} nameAbove={memberOffsets[i].y >= 0} on:openKickMenu={setOpenedMenu} on:closeKickMenu={setClosedMenu} />
        {/each}
    {/if}
</div>
<Discussion />
<Snackbar type={snackbarType} bind:open={snackbarOpen}>{snackbarText}</Snackbar>