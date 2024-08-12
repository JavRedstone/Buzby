<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import type { Message } from "$lib/elements/classes/data/chat/Message";
	import { StringHelper } from "$lib/elements/helpers/StringHelper";
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { deleteDoc, updateDoc, type DocumentData, type DocumentReference } from 'firebase/firestore';
	import { getFirestoreDoc } from '$lib/elements/firebase/firebase';
	import Snackbar from '../general/snackbar.svelte';
	import { currentMember, projectSelected } from '$lib/elements/stores/project-store';
	import type { Project } from '$lib/elements/classes/data/project/Project';
	import type { Member } from '$lib/elements/classes/data/project/Member';
	import ChatPoll from './chat-poll.svelte';
	import Avatar from '../general/avatar.svelte';
	import { MessageConstants } from '$lib/elements/classes/data/chat/MessageConstants';

    let dispatch = createEventDispatcher();
    
    export let message: Message = null;
    export let project: Project = null;
    export let hasAvatar: boolean = false;
    export let highlightedId: string = "";
    export let isHighlighted: boolean = false;

    let currMember: Member = null;

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
    $: isHighlighted && highlightedId == message.id ? highlightTimeout = setTimeout(() => isHighlighted = false, MessageConstants.MESSAGE_HIGHLIGHT_DURATION) : clearTimeout(highlightTimeout);

    function getMember(): void {
        currentMember.subscribe((value) => {
            currMember = value;
            getMessageFormattedText(message.text);
            getMessageFormatting(message.text);
        });
    }

    function reply(): void {
        dispatch('reply');
    }

    function jumpToReply(): void {
        dispatch('jumpToReply');
    }

    function clickedName(): void {
        dispatch('clickedName');
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
        updateDoc(messageDoc, message.compactify());
    }

    function deleteMessage(): void {
        let messageDoc: DocumentReference<DocumentData> = getFirestoreDoc('messages', message.id);
        project.messageIds = project.messageIds.filter((id) => id !== message.id);
        deleteDoc(messageDoc).then(() => {
            let chatDoc: DocumentReference<DocumentData> = getFirestoreDoc('chats', project.id);
            updateDoc(chatDoc, project.compactify()).then(() => {
                if (message.pollId.length > 0) {
                    let pollDoc: DocumentReference<DocumentData> = getFirestoreDoc('polls', message.pollId);
                    deleteDoc(pollDoc);
                }
            });
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
        if (currMember && (text.search(/@([^\s]+)/g) != -1 || (message.reply != null && message.reply.memberId === currMember.id))) {
            let mentions: string[] = [];
            let mention: string = '';
            if (text.search(/@([^\s]+)/g) != -1) {
                for (let match of text.match(/@([^\s]+)/g)) {
                    for (let m of project.joinedMembers) {
                        if (match.toLowerCase() === `@${m.displayName.toLowerCase()}`) {
                            mentions.push(m.displayName);
                            break;
                        }
                    }
                    if (match.toLowerCase() === `@${currMember.displayName.toLowerCase()}`) {
                        mention = currMember.displayName;
                        break;
                    }
                }
            }
            if (mention.length > 0 || (message.reply != null && message.reply.memberId === currMember.id)) {
                textFormatting += 'background-color: rgba(var(--primary-rgb), 0.25); padding-left: 4px; padding-right: 4px; padding-top: 2px; padding-bottom: 2px; border-radius: 4px;';
            }
            if (mentions.length > 0) {
                textFormatting += 'color: var(--primary-darker);';
            }
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

    function getEmbed(url: string): string {
        let videoId: string = url.split("v=")[1];
        let ampersandPosition: number = videoId.indexOf("&");
        if (ampersandPosition !== -1) {
            videoId = videoId.substring(0, ampersandPosition);
        }
        return `https://www.youtube.com/embed/${videoId}`;
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

    function removeKeybinds(): void {
        window.removeEventListener('keydown', (event) => {
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
        getMember();
        setKeybinds();
    });

    onDestroy(() => {
        removeKeybinds();
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
        position: absolute;
        flex-shrink: 0;;
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
        padding-left: 50px;
        font-weight: 500;
        font-size: 14px;
        cursor: pointer;

        &:hover {
            text-decoration: underline;
        }
    }

    .chat-message-date {
        margin-left: 8px;
        font-size: 10px;
        color: var(--grey-600);
    }

    .chat-message-extra-container {
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    .chat-message {
        box-sizing: border-box;
        font-size: 13px;
        word-wrap: break-word;
    }

    .chat-message-large-container {
        display: flex;
        align-items: center;
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
        margin-left: 2px;
        font-size: 16px;
        color: var(--grey-600);
        cursor: pointer;

        transition: color var(--transition-duration);

        &:hover {
            color: var(--grey-800);
        }
    }

    .chat-message-remove {
        margin-left: 2px;
        font-size: 16px;
        color: var(--error);
        cursor: pointer;

        transition: color var(--transition-duration);

        &:hover {
            color: var(--error-dark);
        }
    }

    .chat-message-edit-input {
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

    .chat-message-reply-arrow {
        position: absolute;
        left: 28px;
        top: 12px;
        width: 28px;
        height: 12px;
        border-left: 2px solid var(--grey-400);
        border-top: 2px solid var(--grey-400);
        border-top-left-radius: 8px;
    }

    .chat-message-reply-display {
        position: absolute;
        left: 64px;
        top: 3px;
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

    .chat-message-link-container {
        display: flex;
        align-items: center;
        margin-top: 4px;
    }

    .chat-message-link-icon {
        font-size: 20px;
        color: var(--grey-600);
        margin-right: 4px;
    }

    .chat-message-link {
        width: 100%;
        font-size: 12px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    .chat-message-image {
        flex-shrink: 0;
        width: auto;
        height: auto;
        max-height: 250px;
        object-fit: contain;
        margin-top: 4px;
    }

    .chat-message-video {
        flex-shrink: 0;
        margin-top: 4px;
    }
</style>
{#if message != null && currMember != null}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div id="message-{message.id}" class="chat-message-container" style={(message.edited ? 'border-left: 2px solid var(--primary);' : '') + (message.replyId.length > 0 ? 'padding-top: 28px;' : '')} on:mouseenter={() => hovered = true} on:mouseleave={() => hovered = false}>
        {#if isHighlighted && highlightedId == message.id}
            <div class="chat-message-highlight-overlay" transition:fade={{duration: TransitionConstants.DURATION}}></div>
        {/if}
        {#if hasAvatar}
            {#if message.replyId.length > 0}
                <div class="chat-message-reply-arrow"></div>
                {#if message.reply != null}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div class="chat-message-reply-display" style="width: {message.memberId == currMember.id ? 'calc(100% - 136px)' : 'calc(100% - 100px)'}" on:click={jumpToReply}>
                        {message.reply.member.displayName}: {message.reply.text}
                    </div>
                {:else}
                    <div class="chat-message-reply-deleted" style="width: {message.memberId == currMember.id ? 'calc(100% - 136px)' : 'calc(100% - 100px)'}">Original message deleted.</div>
                {/if}
            {/if}
            
            <div class="chat-message-avatar-container" style="top: {message.replyId.length > 0 ? 28 : 4}px;">
                <Avatar member={message.member} size="42px" />
            </div>
            <div class="chat-message-big-container">
                <div class="chat-message-header">
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div class="chat-message-name" on:click={clickedName}>{message.member.displayName}</div>
                    <div class="chat-message-date">{StringHelper.getFormattedDate(message.createdAt)}</div>
                </div>
                <div class="chat-message-large-container">
                    <div class="chat-message-extra-container" style="margin-left: 50px; width: {message.memberId == currMember.id ? 'calc(100% - 116px)' : 'calc(100% - 80px)'};">
                        {#if editOpen}
                            <!-- svelte-ignore a11y-autofocus -->
                            <input class="chat-message-edit-input" bind:value={messageText} on:focusout={cancelEdit} autofocus />
                        {:else}
                            <div class="chat-message" style={messageFormatting}>{messageFormattedText}</div>
                        {/if}
                        {#if message.link.length > 0}
                            <div class="chat-message-link-container">
                                <span class="chat-message-link-icon material-symbols-rounded">link</span>
                                <a class="chat-message-link" href={message.link} target="_blank" rel="noopener noreferrer">{message.linkName}</a>
                            </div>
                        {:else if message.imageUrl.length > 0}
                            <!-- svelte-ignore a11y-missing-attribute -->
                            <img class="chat-message-image" src={message.imageUrl} />
                        {:else if message.videoUrl.length > 0}
                            <iframe class="discussion-video-preview" width="100%" height="250" src={getEmbed(message.videoUrl)} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                        {:else if message.pollId.length > 0}
                            <ChatPoll poll={message.poll} />
                        {/if}
                    </div>
                    {#if hovered}
                        {#if message.memberId == currMember.id}
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
            <div class="chat-message-extra-container" style="width: {message.memberId == currMember.id ? 'calc(100% - 116px)' : 'calc(100% - 80px)'};">
                {#if editOpen}
                    <!-- svelte-ignore a11y-autofocus -->
                    <input class="chat-message-edit-input" bind:value={messageText} on:focusout={cancelEdit} autofocus />
                {:else}
                    <div class="chat-message" style={messageFormatting}>{messageFormattedText}</div>
                {/if}
                {#if message.link.length > 0}
                    <div class="chat-message-link-container">
                        <span class="chat-message-link-icon material-symbols-rounded">link</span>
                        <a class="chat-message-link" href={message.link} target="_blank" rel="noopener noreferrer">{message.linkName}</a>
                    </div>
                {:else if message.imageUrl.length > 0}
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <img class="chat-message-image" src={message.imageUrl} />
                {:else if message.videoUrl.length > 0}
                    <iframe class="chat-message-video" width="100%" height="300px" src={getEmbed(message.videoUrl)} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                {:else if message.pollId.length > 0}
                    <ChatPoll poll={message.poll} />
                {/if}
            </div>
            {#if hovered}
                {#if message.memberId == currMember.id}
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