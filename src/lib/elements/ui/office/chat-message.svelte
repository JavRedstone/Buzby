<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import type { Message } from "$lib/elements/classes/data/chat/Message";
	import { StringHelper } from "$lib/elements/helpers/StringHelper";
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import { createEventDispatcher, onMount } from 'svelte';
	import { deleteDoc, updateDoc, type DocumentData, type DocumentReference } from 'firebase/firestore';
	import { getFirestoreDoc } from '$lib/elements/firebase/firebase';
	import Snackbar from '../general/snackbar.svelte';
	import { memberStatus, projectSelected } from '$lib/elements/stores/project-store';
	import type { Project } from '$lib/elements/classes/data/project/Project';
	import type { Member } from '$lib/elements/classes/data/project/Member';
	import { ChatConstants } from '$lib/elements/classes/data/chat/ChatConstants';

    let dispatch = createEventDispatcher();
    
    export let message: Message = null;
    export let project: Project = null;
    export let hasAvatar: boolean = false;
    export let highlightedId: string = "";
    export let isHighlighted: boolean = false;

    let currMember: Member = null;

    let existed: boolean = false;
    let hovered: boolean = false;

    let editOpen: boolean = false;
    let messageText: string = message.text;

    let messageFormattedText: string = getMessageFormattedText(message.text);
    let messageFormatting: string = getMessageFormatting(message.text);

    let snackbarOpen: boolean = false;
    let snackbarText: string = "";
    let snackbarType: string = "neutral";

    let highlightTimeout: any = null;

    $: message.text ? messageFormattedText = getMessageFormattedText(message.text) : messageFormattedText = "";
    $: message.text ? messageFormatting = getMessageFormatting(message.text) : messageFormatting = "";
    $: isHighlighted && highlightedId == message.id ? highlightTimeout = setTimeout(() => isHighlighted = false, ChatConstants.HIGHLIGHT_DURATION) : clearTimeout(highlightTimeout);

    function getMember(): void {
        memberStatus.subscribe((value) => {
            currMember = value.currentMember;
        });
    }

    function reply(): void {
        dispatch('reply');
    }

    function jumpToReply(): void {
        dispatch('jumpToReply');
    }

    function openEdit(): void {
        editOpen = true;
        messageText = message.text;
    }

    function cancelEdit(): void {
        editOpen = false;
        messageText = message.text;
        messageFormattedText = getMessageFormattedText(message.text);
        messageFormatting = getMessageFormatting(message.text);
    }
    
    function editMessage(): void {
        messageFormattedText = getMessageFormattedText(messageText);
        if (messageText.trim().length === 0 || messageFormattedText.trim().length === 0) {
            cancelEdit();
            openSnackbar("Message cannot be empty.", "error");
            return;
        }
        editOpen = false;
        if (messageText === message.text) {
            return;
        }
        message.text = messageText;
        message.edited = true;
        let messageDoc: DocumentReference<DocumentData> = getFirestoreDoc('messages', message.id);
        projectSelected.update((value) => {
            value.project.chat = project.chat;
            return value;
        });
        updateDoc(messageDoc, message.compactify());
    }

    function deleteMessage(): void {
        let messageDoc: DocumentReference<DocumentData> = getFirestoreDoc('messages', message.id);
        project.chat.messageIds = project.chat.messageIds.filter((id) => id !== message.id);
        project.chat.messages = project.chat.messages.filter((msg) => msg.id !== message.id);
        projectSelected.update((value) => {
            value.project.chat = project.chat;
            return value;
        });
        deleteDoc(messageDoc).then(() => {
            let chatDoc: DocumentReference<DocumentData> = getFirestoreDoc('chats', project.chat.id);
            updateDoc(chatDoc, project.chat.compactify());
        });
    };

    function getMessageFormatting(text: string): string {
        let textFormatting: string = '';
        if (text.search(/\*\*\*(.*?)\*\*\*/g) != -1) {
            textFormatting += 'font-weight: 700; font-style: italic;';
        }
        else if (text.search(/\*\*(.*?)\*\*/g) != -1) {
            textFormatting += 'font-weight: 700;';
        }
        else if (text.search(/\*(.*?)\*/g) != -1) {
            textFormatting += 'font-style: italic;';
        }
        if (text.search(/__(.*?)__/g) != -1) {
            textFormatting += 'text-decoration: underline;';
        }
        if (text.search(/~~(.*?)~~/g) != -1) {
            textFormatting += 'text-decoration: line-through;';
        }
        if (text.search(/### (.*?)/g) != -1) {
            textFormatting += 'font-size: 12px; font-weight: 700;';
        }
        else if (text.search(/## (.*?)/g) != -1) {
            textFormatting += 'font-size: 14px; font-weight: 700;';
        }
        else if (text.search(/# (.*?)/g) != -1) {
            textFormatting += 'font-size: 16px; font-weight: 700;';
        }

        if (text.search(/`(.*?)`/g) != -1) {
            textFormatting = 'background-color: var(--grey-300); padding-left: 4px; padding-right: 4px; padding-top: 2px; padding-bottom: 2px; border-radius: 4px; font-family: monospace;';
        }
        return textFormatting;
    }

    function getMessageFormattedText(text: string): string {
        let formattedText: string = text;
        formattedText = formattedText.replace(/`(.*?)`/g, '$1');
        if (text != formattedText) {
            return formattedText;
        }
        formattedText = formattedText.replace(/\*\*\*(.*?)\*\*\*/g, '$1');
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '$1');
        formattedText = formattedText.replace(/\*(.*?)\*/g, '$1');
        formattedText = formattedText.replace(/__(.*?)__/g, '$1');
        formattedText = formattedText.replace(/~~(.*?)~~/g, '$1');
        formattedText = formattedText.replace(/### (.*?)/g, '$1');
        formattedText = formattedText.replace(/## (.*?)/g, '$1');
        formattedText = formattedText.replace(/# (.*?)/g, '$1');
        return formattedText;
    }

    function setKeybinds(): void {
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && editOpen) {
                editMessage();
            }
            else if (event.key === 'Escape' && editOpen) {
                cancelEdit();
            }
            else if (event.ctrlKey && event.key === 'b' && messageText.trim().length > 0 && editOpen) {
                messageText = `**${messageText}**`;
            }
            else if (event.ctrlKey && event.key === 'i' && messageText.trim().length > 0 && editOpen) {
                messageText = `*${messageText}*`;
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
        getMember();
        setKeybinds();
    });
</script>
<style>
    .chat-message-container {
        position: relative;
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
        box-sizing: border-box;
        font-size: 13px;
        word-wrap: break-word;
    }

    .chat-message-large-container {
        display: flex;
        align-items: center;
    }

    .chat-message-large {
        box-sizing: border-box;
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

    .chat-message-reply-arrow {
        position: absolute;
        left: 28px;
        bottom: 48px;
        width: 28px;
        height: 12px;
        border-left: 2px solid var(--grey-400);
        border-top: 2px solid var(--grey-400);
        border-top-left-radius: 8px;
    }

    .chat-message-reply-display {
        position: absolute;
        left: 64px;
        bottom: 52px;
        width: calc(100% - 136px);
        font-size: 12px;
        color: var(--grey-600);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        cursor: pointer;
        user-select: none;

        transition: color var(--transition-duration);

        &:hover {
            color: var(--grey-800);
        }
    }

    .chat-message-reply-deleted {
        position: absolute;
        left: 64px;
        bottom: 52px;
        width: calc(100% - 136px);
        font-size: 12px;
        color: var(--grey-500);
        font-style: italic;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        user-select: none;
    }

    .chat-message-highlight-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(var(--primary-rgb), 0.1);
    }
</style>
{#if message && existed}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div id="message-{message.id}" class="chat-message-container" style={(message.edited ? 'border-left: 2px solid var(--grey-300);' : '') + (message.replyId.length > 0 ? 'padding-top: 28px;' : '')} on:mouseenter={() => hovered = true} on:mouseleave={() => hovered = false} transition:fly={{x: 10, duration: TransitionConstants.DURATION}}>
        {#if isHighlighted && highlightedId == message.id}
            <div class="chat-message-highlight-overlay" transition:fade={{duration: TransitionConstants.DURATION}}></div>
        {/if}
        {#if hasAvatar}
            {#if message.replyId.length > 0}
                <div class="chat-message-reply-arrow"></div>
                {#if message.reply != null}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div class="chat-message-reply-display" on:click={jumpToReply}>
                        {message.reply.sender.displayName}: {message.reply.text}
                    </div>
                {:else}
                    <div class="chat-message-reply-deleted">Original message deleted.</div>
                {/if}
            {/if}
            
            <div class="chat-message-avatar-container"></div>
            <div class="chat-message-big-container">
                <div class="chat-message-header">
                    <div class="chat-message-name">{message.sender.displayName}</div>
                    <div class="chat-message-date">{StringHelper.getFormattedDate(message.createdAt)}</div>
                </div>
                <div class="chat-message-large-container">
                    {#if editOpen}
                        <!-- svelte-ignore a11y-autofocus -->
                        <input class="chat-message-large-edit-input" style="width: {message.senderId == currMember.id ? 'calc(100% - 66px)' : 'calc(100% - 30px)'};" bind:value={messageText} on:focusout={cancelEdit} autofocus />
                    {:else}
                        <div class="chat-message-large" style={messageFormatting + `width: ${message.senderId == currMember.id ? 'calc(100% - 66px)' : 'calc(100% - 30px)'};`}>{messageFormattedText}</div>
                    {/if}
                    {#if hovered}
                        {#if message.senderId == currMember.id}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <span class="chat-message-action material-symbols-rounded" on:click={reply}>reply</span>
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <span class="chat-message-action material-symbols-rounded" on:click={openEdit}>edit</span>
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <span class="chat-message-remove material-symbols-rounded" on:click={deleteMessage}>delete</span>
                        {:else}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <span class="chat-message-action material-symbols-rounded" on:click={reply}>reply</span>
                        {/if}
                    {/if}
                </div>
            </div>
        {:else}
            <div class="chat-message-time">{StringHelper.getFormattedTime(message.createdAt)}</div>
            {#if editOpen}
                <!-- svelte-ignore a11y-autofocus -->
                <input class="chat-message-small-edit-input" style="width: {message.senderId == currMember.id ? 'calc(100% - 116px)' : 'calc(100% - 80px)'};" bind:value={messageText} on:focusout={cancelEdit} autofocus />
            {:else}
                <div class="chat-message-small" style={messageFormatting + `width: ${message.senderId == currMember.id ? 'calc(100% - 116px)' : 'calc(100% - 80px)'};`}>{messageFormattedText}</div>
            {/if}
            {#if hovered}
                {#if message.senderId == currMember.id}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <span class="chat-message-action material-symbols-rounded" on:click={reply}>reply</span>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <span class="chat-message-action material-symbols-rounded" on:click={openEdit}>edit</span>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <span class="chat-message-remove material-symbols-rounded" on:click={deleteMessage}>delete</span>
                {:else}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <span class="chat-message-action material-symbols-rounded" on:click={reply}>reply</span>
                {/if}
            {/if}
        {/if}
    </div>
{/if}
<Snackbar type={snackbarType} bind:open={snackbarOpen}>{snackbarText}</Snackbar>