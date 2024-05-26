<script lang="ts">
	import { ChatConstants } from "$lib/elements/classes/data/chat/ChatConstants";
	import type { Message } from "$lib/elements/classes/data/chat/Message";
	import { projectSelected } from "$lib/elements/stores/project-store";
	import { onMount } from "svelte";

    let messages: Message[] = [];

    function getMessages(): void {
        projectSelected.subscribe((value) => {
            if (value.project && value.project.chat) {
                messages = value.project.chat.messages;
            }
        })
    }

    function putExtra(): void {
        // TODO: Implement
    }

    function sendMessage(): void {

    }

    onMount(() => {
        getMessages();
    });
</script>
<style>
    .discussion-container {
        position: absolute;
        right: 0;
        top: 0;
        width: 50%;
        min-width: 150px;
        height: 100%;
        background-color: var(--off-white-light);
        border-left: 1px solid var(--grey-300);
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    }

    .discussion-title {
        font-size: 16px;
        font-weight: 500;
        padding: 8px;
        border-bottom: 1px solid var(--grey-300);
    }
    
    .discussion-messages-container {
        height: calc(100% - 82px);
        overflow-y: auto;
    }

    .discussion-input-container {
        display: flex;
        align-items: center;
        padding-top: 8px;
        padding-bottom: 8px;
        border-top: 1px solid var(--grey-300);
    }

    .discussion-input {
        width: 100%;
        padding-left: 4px;
        padding-right: 4px;
        padding-top: 2px;
        padding-bottom: 2px;
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

    .discussion-input-icon-button {
        font-size: 24px;
        color: var(--grey-800);
        cursor: pointer;
        margin-left: 8px;
        margin-right: 8px;

        transition: color var(--transition-duration);

        &:hover {
            color: var(--accent);
        }
    }
</style>
<div class="discussion-container">
    <div class="discussion-title">Discussion</div>
    <div class="discussion-messages-container">

    </div>
    <div class="discussion-input-container">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="discussion-input-icon-button material-symbols-rounded" on:click={putExtra}>add_circle</span>
        <input type="text" class="discussion-input" placeholder="Type a message..." maxlength={ChatConstants.MESSAGE_MAX_LENGTH} />
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="discussion-input-icon-button material-symbols-rounded" on:click={sendMessage}>send</span>
    </div>
</div>