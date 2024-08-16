<script lang="ts">
	import { MessageConstants } from "$lib/elements/classes/data/chat/MessageConstants";
	import { Poll } from "$lib/elements/classes/data/chat/Poll";
	import { PollOption } from "$lib/elements/classes/data/chat/PollOption";
	import type { Member } from "$lib/elements/classes/data/project/Member";
	import type { Project } from "$lib/elements/classes/data/project/Project";
	import { TransitionConstants } from "$lib/elements/classes/ui/core/TransitionConstants";
	import { getFirestoreDoc } from "$lib/elements/firebase/firebase";
	import { ObjectHelper } from "$lib/elements/helpers/ObjectHelper";
	import { StringHelper } from "$lib/elements/helpers/StringHelper";
	import { currentMember, projectSelected } from "$lib/elements/stores/project-store";
	import { getDoc, serverTimestamp, setDoc, type DocumentData, type DocumentReference } from "firebase/firestore";
	import { onDestroy, onMount } from "svelte";
	import { slide } from "svelte/transition";

    export let poll: Poll = null;

    let currMember: Member = null;
    let project: Project = null;

    let pollOptions: string[] = [];
    let pollVotes: number[] = [];

    let selectedOptions: string[] = [];

    let votedMemberIds: string[] = [];
    let votedMembers: Member[] = [];

    let votedAlready = false;
    let timeLeftInterval = null;
    let timeLeft: number = 0;
    let timeLeftString: string = '';

    $: poll ? updatePoll() : null;

    function getCurrMember(): void {
        currentMember.subscribe((value) => {
            currMember = value;
            if (currMember != null) {
                projectSelected.subscribe((value) => {
                    project = currMember.projects.find((p) => p.id == value);
                    if (project != null) {
                        updatePoll();
                    }
                });
            }
        });
    }

    function getPollOptions(): void {
        let options: string[] = [];
        if (poll) {
            for (let pollOption of poll.pollOptions) {
                if (!pollOption.memberId) {
                    options = [...options, pollOption.text];
                }
            }
        }
        pollOptions = options;
    }

    function getPollVotes(): void {
        let votes: number[] = [];
        if (poll) {
            for (let pollOption of poll.pollOptions) {
                if (pollOption.memberId) {
                    let idx = pollOptions.indexOf(pollOption.text);
                    if (idx !== -1) {
                        votes[idx] = votes[idx] ? votes[idx] + 1 : 1;
                    }
                }
            }
        }
        pollVotes = votes;
    }

    function getVotedMembers(): void {
        let memberIds: string[] = [];
        let members: Member[] = [];
        if (poll) {
            for (let pollOption of poll.pollOptions) {
                memberIds = [...memberIds, pollOption.member.id];
                members = [...members, pollOption.member];
            }
        }
        votedMemberIds = memberIds;
        votedMembers = members;
    }

    function getTimeLeft(): void {
        if (poll) {
            let endAt: Date = ObjectHelper.addMsToDate(poll.createdAt, poll.duration);
            timeLeft = endAt.getTime() - new Date().getTime();
            timeLeftString = StringHelper.getFormattedTimeLeft(endAt);
        }
    }

    function selectOption(text: string): void {
        if (poll.multiple) {
            if (selectedOptions.includes(text)) {
                selectedOptions = selectedOptions.filter((option) => option !== text);
            } else {
                selectedOptions = [...selectedOptions, text];
            }
        } else {
            if (selectedOptions.includes(text)) {
                selectedOptions = [];
            } else {
                selectedOptions = [text];
            }
        }
    }

    async function vote(): Promise<void> {
        if (selectedOptions.length === 0) {
            return;
        }

        if (currMember && !votedMemberIds.includes(currMember.id)) {
            votedAlready = true;
            
            for (let i of selectedOptions) {
                let pollOption: PollOption = new PollOption({
                    id: StringHelper.generateID(),
                    pollId: poll.id,
                    memberId: currMember.id,
                    text: selectedOptions[i],
                    createdAtTemp: serverTimestamp(),
                })

                let pollOptionDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('pollOptions', pollOption.id);
                await setDoc(pollOptionDoc, pollOption.compactify());
            }

            updatePoll();
        }
    }

    function updatePoll(): void {
        if (poll) {
            getPollOptions();
            getPollVotes();
            getVotedMembers();
            if (currMember && votedMemberIds.includes(currMember.id)) {
                votedAlready = true;
            } else {
                votedAlready = false;
            }

            getTimeLeft();
        }
    }

    onMount(() => {
        getCurrMember();
        timeLeftInterval = setInterval(getTimeLeft, MessageConstants.POLL_TIME_LEFT_INTERVAL);
    });

    onDestroy(() => {
        clearInterval(timeLeftInterval);
    });
</script>
<style>
    .material-symbols-rounded {
        user-select: none;
        font-variation-settings:
            'FILL' 0,
            'wght' 250,
            'GRAD' 0,
            'opsz' 24;
    }

    .chat-poll-container {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        padding: 8px;
        margin: 4px;
        border: 1px solid var(--grey-300);
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        color: var(--grey-800);
        user-select: none;
    }

    .chat-poll-question {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 8px;
    }

    .chat-poll-subtitle {
        font-size: 12px;
        color: var(--grey-500);
        margin-top: -8px;
        margin-bottom: 8px;
    }

    .chat-poll-options-container {
        display: flex;
        flex-direction: column;
    }

    .chat-poll-option-container {
        position: relative;
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        padding: 4px;
        border: 1px solid var(--grey-300);
        border-radius: 4px;
    }

    .chat-poll-option-percentage-bar {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background: linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%);
        border-radius: 4px;

        transition: width var(--transition-duration);
    }

    .chat-poll-option-vote-count {
        position: absolute;
        right: 32px;
        margin-right: 8px;
        font-size: 12px;
    }

    .chat-poll-option-vote-percentage {
        position: absolute;
        right: 4px;
        font-size: 12px;
        color: var(--grey-600);
    }

    .chat-poll-option-button-container {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        padding: 4px;
        border: 1px solid var(--grey-300);
        border-radius: 4px;
        cursor: pointer;

        transition: border var(--transition-duration), background-color var(--transition-duration);

        &:hover {
            border: 1px solid var(--grey-500);
            background-color: var(--grey-100);
        }
    }

    .chat-poll-option-icon {
        font-size: 20px;
        color: var(--grey-800);
    }

    .chat-poll-option-text {
        margin-left: 4px;
        font-size: 14px;
        z-index: 1;
    }

    .chat-poll-live-container {
        display: flex;
        justify-content: space-between;
    }

    .chat-poll-live-text {
        font-size: 12px;
        color: var(--grey-500);
    }

    .chat-poll-vote-button {
        margin-top: 8px;
        padding: 4px;
        outline: none;
        border: none;
        border-radius: 4px;
        background-color: var(--primary);
        font-size: 14px;
        color: var(--grey-800);
        cursor: pointer;

        transition: background-color var(--transition-duration), color var(--transition-duration);

        &:hover {
            background-color: var(--primary-dark);
            color: var(--grey-100);
        }
    }

    .chat-poll-already-text {
        font-size: 10px;
        color: var(--grey-400);
    }
</style>
{#if poll}
    <div class="chat-poll-container">
        <div class="chat-poll-question">{poll.question}</div>
        {#if !votedAlready}
            {#if poll.multiple}
                <div class="chat-poll-subtitle">Choose one or more option(s)</div>
            {:else}
                <div class="chat-poll-subtitle">Choose one option</div>
            {/if}
        {/if}
        <div class="chat-poll-options-container">
            {#each pollOptions as option, i}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div class={votedAlready || timeLeft <= 0 ? 'chat-poll-option-container' : 'chat-poll-option-button-container'} on:click={() => selectOption(option)}>
                    {#if votedAlready || timeLeft <= 0}
                        <div class="chat-poll-option-percentage-bar" style="width: {pollVotes[i] / pollVotes[i] * 100 || 0}%"></div>
                        <div class="chat-poll-option-vote-count">{pollVotes[i]} vote{pollVotes[i] === 1 ? '' : 's'}</div>
                        <div class="chat-poll-option-vote-percentage">{Math.round(pollVotes[i] / pollVotes[i] * 100) || 0}%</div>
                    {:else}
                        {#if selectedOptions.includes(option)}
                            {#if poll.multiple}
                                <div class="chat-poll-option-icon material-symbols-rounded">check_box</div>
                            {:else}
                                <div class="chat-poll-option-icon material-symbols-rounded">radio_button_checked</div>
                            {/if}
                        {:else}
                            {#if poll.multiple}
                                <div class="chat-poll-option-icon material-symbols-rounded">check_box_outline_blank</div>
                            {:else}
                                <div class="chat-poll-option-icon material-symbols-rounded">radio_button_unchecked</div>
                            {/if}
                        {/if}
                    {/if}
                    <div class="chat-poll-option-text">{option}</div>
                </div>
            {/each}
        </div>
        <div class="chat-poll-live-container">
            <div class="chat-poll-live-text">{votedMemberIds.length} vote{votedMemberIds.length === 1 ? '' : 's'}</div>
            <div class="chat-poll-live-text">
                {#if timeLeft > 0}
                    {timeLeftString} left
                {:else}
                    Poll ended
                {/if}
            </div>
        </div>
        {#if currMember && timeLeft > 0}
            {#if !votedAlready}
                <button class="chat-poll-vote-button" on:click={vote} transition:slide={{axis:'y', duration:TransitionConstants.DURATION}}>Vote</button>
            {:else}
                <div class="chat-poll-already-text">You have voted already. You cannot change your vote.</div>
            {/if}
        {/if}
    </div>
{/if}