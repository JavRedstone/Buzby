<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import type { Message } from "$lib/elements/classes/data/chat/Message";
	import { StringHelper } from "$lib/elements/helpers/StringHelper";
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import { onMount } from 'svelte';
	import { deleteDoc, updateDoc, type DocumentData, type DocumentReference } from 'firebase/firestore';
	import { getFirestoreDoc } from '$lib/elements/firebase/firebase';
	import Snackbar from '../general/snackbar.svelte';
	import type { Chat } from '$lib/elements/classes/data/chat/Chat';
	import { projectSelected } from '$lib/elements/stores/project-store';

    export let message: Message = null;
    export let chat: Chat = null;
    export let hasAvatar: boolean = false;

    let existed: boolean = false;
    let hovered: boolean = false;

    let editOpen: boolean = false;
    let messageText: string = message.text;

    let snackbarOpen: boolean = false;
    let snackbarText: string = "";
    let snackbarType: string = "neutral";

    function editMessage(): void {
        if (message.text === messageText) {
            cancelEdit();
            return;
        }
        if (message.text.length === 0) {
            openSnackbar("Message cannot be empty.", "error");
            return;
        }
        editOpen = false;
        message.text = messageText;
        let messageDoc: DocumentReference<DocumentData> = getFirestoreDoc('messages', message.id);
        projectSelected.update((value) => {
            value.project.chat = chat;
            return value;
        });
        updateDoc(messageDoc, message.compactify());
    }

    function openEdit(): void {
        editOpen = true;
        messageText = message.text;
    }

    function cancelEdit(): void {
        editOpen = false;
        message.text = messageText;
    }

    function deleteMessage(): void {
        let messageDoc: DocumentReference<DocumentData> = getFirestoreDoc('messages', message.id);
        chat.messageIds = chat.messageIds.filter((id) => id !== message.id);
        chat.messages = chat.messages.filter((msg) => msg.id !== message.id);
        projectSelected.update((value) => {
            value.project.chat = chat;
            return value;
        });
        deleteDoc(messageDoc).then(() => {
            let chatDoc: DocumentReference<DocumentData> = getFirestoreDoc('chats', chat.id);
            updateDoc(chatDoc, chat.compactify());
        });
    };

    function setKeybinds(): void {
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && editOpen) {
                editMessage();
            }
            else if (event.key === 'Escape' && editOpen) {
                cancelEdit();
            }
        });
    }

    function openSnackbar(text: string, type: string): void {
        snackbarText = text;
        snackbarType = type;
        snackbarOpen = true;
    }

    onMount(() => {
        existed = true;
        setKeybinds();
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

    .chat-message-small {
        width: calc(100% - 98px);
        font-size: 13px;
        word-wrap: break-word;
    }

    .chat-message-large-container {
        display: flex;
        align-items: center;
    }

    .chat-message-large {
        width: calc(100% - 48px);
        font-size: 13px;
        word-wrap: break-word;
    }

    .chat-message-time {
        width: 50px;
        font-size: 10px;
        color: transparent;
        user-select: none;

        transition: color var(--transition-duration);
    }

    .chat-message-container:hover .chat-message-time {
        color: var(--grey-600);
    }

    .chat-message-action {
        font-size: 18px;
        color: var(--grey-600);
        cursor: pointer;

        transition: color var(--transition-duration);

        &:hover {
            color: var(--grey-800);
        }
    }

    .chat-message-remove {
        font-size: 18px;
        color: var(--error);
        cursor: pointer;

        transition: color var(--transition-duration);

        &:hover {
            color: var(--error-dark);
        }
    }

    .chat-message-small-edit-input {
        box-sizing: border-box;
        width: calc(100% - 98px);
        padding-left: 4px;
        padding-right: 4px;
        padding-top: 0;
        padding-bottom: 0;
        background-color: var(--grey-200);
        outline: none;
        border: 1px solid var(--grey-400);
        border-radius: 4px;
        font-size: 12px;
        color: var(--grey-800);
        user-select: none;

        transition: border-color var(--transition-duration);

        &:hover {
            border-color: var(--accent-light);
        }

        &:focus {
            border-color: var(--accent);
        }
    }

    .chat-message-large-edit-input {
        box-sizing: border-box;
        width: calc(100% - 48px);
        padding-left: 4px;
        padding-right: 4px;
        padding-top: 0;
        padding-bottom: 0;
        background-color: var(--grey-200);
        outline: none;
        border: 1px solid var(--grey-400);
        border-radius: 4px;
        font-size: 12px;
        color: var(--grey-800);
        user-select: none;

        transition: border-color var(--transition-duration);

        &:hover {
            border-color: var(--accent-light);
        }

        &:focus {
            border-color: var(--accent);
        }
    }
</style>
{#if message && existed}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="chat-message-container" on:mouseenter={() => hovered = true} on:mouseleave={() => hovered = false} transition:fly={{x: 10, duration: TransitionConstants.DURATION}}>
        {#if hasAvatar}
            <div class="chat-message-avatar-container"></div>
            <div class="chat-message-big-container">
                <div class="chat-message-header">
                    <div class="chat-message-name">{message.sender.displayName}</div>
                    <div class="chat-message-date">{StringHelper.getFormattedDate(message.createdAt)}</div>
                </div>
                <div class="chat-message-large-container">
                    {#if editOpen}
                        <!-- svelte-ignore a11y-autofocus -->
                        <input class="chat-message-large-edit-input" bind:value={messageText} on:focusout={cancelEdit} autofocus />
                    {:else}
                        <div class="chat-message-large">{message.text}</div>
                    {/if}
                    {#if hovered}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <span class="chat-message-action material-symbols-rounded"  on:click={openEdit} transition:fade={{duration: TransitionConstants.DURATION}}>edit</span>
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <span class="chat-message-remove material-symbols-rounded" on:click={deleteMessage} transition:fade={{duration: TransitionConstants.DURATION}}>delete</span>
                    {/if}
                </div>
            </div>
        {:else}
            <div class="chat-message-time">{StringHelper.getFormattedTime(message.createdAt)}</div>
            {#if editOpen}
                <!-- svelte-ignore a11y-autofocus -->
                <input class="chat-message-small-edit-input" bind:value={messageText} on:focusout={cancelEdit} autofocus />
            {:else}
                <div class="chat-message-small">{messageText}</div>
            {/if}
            {#if hovered}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <span class="chat-message-action material-symbols-rounded" on:click={openEdit} transition:fade={{duration: TransitionConstants.DURATION}}>edit</span>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <span class="chat-message-remove material-symbols-rounded" on:click={deleteMessage} transition:fade={{duration: TransitionConstants.DURATION}}>delete</span>
            {/if}
        {/if}
    </div>
{/if}
<Snackbar type={snackbarType} bind:open={snackbarOpen}>{snackbarText}</Snackbar>