<script lang="ts">
	import type { Poll } from "$lib/elements/classes/data/chat/Poll";
	import type { Member } from "$lib/elements/classes/data/project/Member";
	import { memberStatus } from "$lib/elements/stores/project-store";
	import { onMount } from "svelte";

    export let poll: Poll = null;

    let currMember: Member = null;

    let selectedOptionIdxs = [];
    let totalVotes = 0;

    function countTotalVotes(): void {
        totalVotes = poll.votes.reduce((acc, curr) => acc + curr, 0);
    }

    function selectOption(idx: number): void {
        if (poll.multiple) {
            if (selectedOptionIdxs.includes(idx)) {
                selectedOptionIdxs = selectedOptionIdxs.filter((i) => i !== idx);
            } else {
                selectedOptionIdxs = [...selectedOptionIdxs, idx];
            }
        } else {
            if (selectedOptionIdxs.includes(idx)) {
                selectedOptionIdxs = [];
            } else {
                selectedOptionIdxs = [idx];
            }
        }
    }
    
    function getCurrMember(): void {
        memberStatus.subscribe((value) => {
            currMember = value.currentMember;
        });
    }

    onMount(() => {
        getCurrMember();
        countTotalVotes(); // this probably wont update so i will fix later
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
        color: var(--grey-800);
        user-select: none;
    }

    .chat-poll-question {
        font-size: 16px;
        font-weight: 500;
    }

    .chat-poll-subtitle {
        font-size: 12px;
        color: var(--grey-500);
        margin-bottom: 8px;
    }

    .chat-poll-options-container {
        display: flex;
        flex-direction: column;
    }

    .chat-poll-option-container {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
    }

    .chat-poll-option-button-container {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        padding: 4px;
        border: 1px solid var(--grey-300);
        border-radius: 4px;
        cursor: pointer;

        transition: border var(--transition-duration);

        &:hover {
            border: 1px solid var(--grey-500);
        }
    }

    .chat-poll-option-icon {
        margin-right: 8px;
        font-size: 20px;
        color: var(--grey-800);
    }

    .chat-poll-option-text {
        font-size: 14px;
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
    }
</style>
<div class="chat-poll-container">
    <div class="chat-poll-question">{poll.question}</div>
    {#if poll.multiple}
        <div class="chat-poll-subtitle">Choose one or more option(s)</div>
    {:else}
        <div class="chat-poll-subtitle">Choose one option</div>
    {/if}
    <div class="chat-poll-options-container">
        {#each poll.options as option, i}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class={currMember && poll.votedMemberIds.includes(currMember.id) ? 'chat-poll-option-container' : 'chat-poll-option-button-container'} on:click={() => selectOption(i)}>
                {#if currMember && poll.votedMemberIds.includes(currMember.id)}
                    <div class="chat-poll-option-percentage-bar" style="width: {poll.votes[i] / totalVotes * 100}%"></div>
                    <div class="chat-poll-option-vote-count">{poll.votes[i]}</div>
                {/if}
                {#if selectedOptionIdxs.includes(i)}
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
                <div class="chat-poll-option-text">{option}</div>
            </div>
        {/each}
    </div>
    {#if currMember && !poll.votedMemberIds.includes(currMember.id)}
        <button class="chat-poll-vote-button">Vote</button>
    {/if}
</div>