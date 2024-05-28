<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { Message } from "$lib/elements/classes/data/chat/Message";
	import { StringHelper } from "$lib/elements/helpers/StringHelper";
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import { onMount } from 'svelte';

    export let message: Message = null;
    export let hasAvatar: boolean = false;

    let existed: boolean = false;
    let showSmallTime: boolean = false;

    onMount(() => {
        existed = true;
    });
</script>
<style>
    .chat-message-container {
        display: flex;
        align-items: center;
        width: 100%;
        padding-left: 8px;
        padding-right: 8px;
        padding-top: 4px;
        padding-bottom: 4px;
        color: var(--grey-800);

        transition: background-color var(--transition-duration);

        &:hover {
            background-color: var(--grey-200);
        }
    }

    .chat-message-avatar-container {
        width: 42px;
        height: 42px;
        flex-shrink: 0;
        border-radius: 50%;
        background-color: var(--grey-300);
        margin-right: 8px;
    }

    .chat-message-big-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 100%;
    }

    .chat-message-header {
        display: flex;
        align-items: center;
    }

    .chat-message-name {
        font-weight: 500;
        font-size: 14px;
    }

    .chat-message-date {
        margin-left: 8px;
        font-size: 10px;
        color: var(--grey-600);
    }

    .chat-message {
        width: calc(100% - 50px);
        font-size: 13px;
        word-wrap: break-word;
    }

    .chat-message-time {
        width: 50px;
        font-size: 10px;
        color: var(--grey-600);
        user-select: none;
    }

    .chat-message-time-placeholder {
        width: 50px;
    }
</style>
{#if message && existed}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="chat-message-container" on:mouseenter={() => showSmallTime = true} on:mouseleave={() => showSmallTime = false} transition:fly={{x: 10, duration: TransitionConstants.DURATION}}>
        {#if hasAvatar}
            <div class="chat-message-avatar-container"></div>
            <div class="chat-message-big-container">
                <div class="chat-message-header">
                    <div class="chat-message-name">{message.sender.displayName}</div>
                    <div class="chat-message-date">{StringHelper.getFormattedDate(message.createdAt)}</div>
                </div>
                <div class="chat-message">{message.text}</div>
            </div>
        {:else}
            {#if showSmallTime}
                <div class="chat-message-time">{StringHelper.getFormattedTime(message.createdAt)}</div>
            {:else}
                <div class="chat-message-time-placeholder"></div>
            {/if}
            <div class="chat-message">{message.text}</div>
        {/if}
    </div>
{/if}