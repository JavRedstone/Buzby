<script lang="ts">
	import ChatMessage from './chat-message.svelte';
	import { fly, fade } from 'svelte/transition';
	import { ChatConstants } from "$lib/elements/classes/data/chat/ChatConstants";
	import { Message } from "$lib/elements/classes/data/chat/Message";
	import { allProjects, memberStatus, projectSelected } from "$lib/elements/stores/project-store";
	import { onMount } from "svelte";
	import Snackbar from "$lib/elements/ui/general/snackbar.svelte";
	import { deleteDoc, getDoc, serverTimestamp, setDoc, type DocumentData, type DocumentReference } from "firebase/firestore";
	import { getFirestoreDoc } from "$lib/elements/firebase/firebase";
	import type { Project } from "$lib/elements/classes/data/project/Project";
	import { StringHelper } from "$lib/elements/helpers/StringHelper";
	import type { Member } from "$lib/elements/classes/data/project/Member";
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import ProgressCircle from '../general/progress-circle.svelte';
	import { Chat } from '$lib/elements/classes/data/chat/Chat';
	import ProgressLine from '../general/progress-line.svelte';
	import { Ping } from '$lib/elements/classes/data/chat/Ping';
	import { PingConstants } from '$lib/elements/classes/data/chat/PingConstants';
	import Menu from '../general/menu.svelte';

    let currMember: Member = null;
    let project: Project = null;
    let messages: Message[] = [];
    
    let messagesContainer: HTMLElement = null;
    let messageInput: HTMLInputElement = null;
    let messageFocused: boolean = false;
    let messageText: string = "";
    let messageProcessing: boolean = false;
    let messagePercentage: number = 100;

    let extrasOpen: boolean = false;
    let linkOpen: boolean = false;
    let imageOpen: boolean = false;
    let pollOpen: boolean = false;

    let extraLink: string = "";
    let extraLinkName: string = "";
    let extraImage: string = "";
    let finalizedLink: string = "";
    let finalizedLinkName: string = "";
    let finalizedImage: string = "";

    let replyOpen: boolean = false;
    let replyMessage: Message = null;

    let highlightedId: string = "";
    let isHighlighted: boolean = true;
    
    let snackbarOpen: boolean = false;
    let snackbarText: string = "";
    let snackbarType: string = "neutral";

    function getMember(): void {
        memberStatus.subscribe((value) => {
            currMember = value.currentMember;
        });
    }

    function getProject(): void {        
        projectSelected.subscribe(async (value) => {
            if (value.project && value.project.chat) {
                project = value.project;
                messages = value.project.chat.messages;

                await setMessages();
            }
        })
    }

    async function setMessages(): Promise<void> {
        let hasGottenNewSender: boolean = false;
        for (let i = 0; i < messages.length; i++) {
            if (project.memberIds.includes(messages[i].senderId)) {
                messages[i].sender = project.members.find((m) => m.id === messages[i].senderId);
            } else if (messages[i].sender.id == null) {
                await messages[i].getSender();
                hasGottenNewSender = true;
            }

            if (messages[i].replyId.length > 0) {
                messages[i].reply = messages.find((m) => m.id === messages[i].replyId);
            }
        }

        messages = messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        project.chat.messages = messages;

        if (hasGottenNewSender) {
            allProjects.update((value) => {
                value.projects = value.projects.map((p) => {
                    if (p.id === project.id) {
                        return project;
                    }
                    return p;
                });
                return value;
            });
            

            projectSelected.update((value) => {
                value.project = project;
                value.projectName = project.name;
                return value;
            });
        }

        if (messagesContainer) {
            setTimeout(() => {
                if (messagesContainer) {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            }, 0); // Wait for the DOM to update
        }
    }

    async function refreshChat(ignorePercentage: boolean): Promise<void> {
        if (messagePercentage < 100 && !ignorePercentage) {
            return;
        }
        let chatDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("chats", project.chatId);
        let doc = await getDoc(chatDoc);
        if (doc.exists()) {
            project.chat = new Chat(doc.data());
            await project.chat.setObjects();
            messages = project.chat.messages;
            await setMessages();
        }
        messagePercentage = 0;
    }

    function toggleExtra(): void {
        extrasOpen = !extrasOpen;
        linkOpen = false;
        imageOpen = false;
        pollOpen = false;

        extraLink = "";
        extraImage = "";
    }

    function openLink(): void {
        linkOpen = true;
        extrasOpen = false;

        extraLink = "";
    }

    function openImage(): void {
        imageOpen = true;
        extrasOpen = false;

        extraImage = "";
    }

    function openPoll(): void {
        pollOpen = true;
        extrasOpen = false;
    }

    function addLink(): void {
        if (extraLink.trim().length === 0) {
            openSnackbar("Link is empty.", "error");
            return;
        }

        if (extraLink.length > ChatConstants.URL_MAX_LENGTH) {
            openSnackbar(`Link is too long. Max length is ${ChatConstants.URL_MAX_LENGTH} characters.`, "error");
            return;
        }

        if (extraLinkName.trim().length === 0) {
            extraLinkName = extraLink;
        }

        if (extraLinkName.length > ChatConstants.LINK_NAME_MAX_LENGTH) {
            openSnackbar(`Link display text is too long. Max length is ${ChatConstants.LINK_NAME_MAX_LENGTH} characters.`, "error");
            return;
        }

        finalizedLink = extraLink;
        finalizedLinkName = extraLinkName;
        extraLink = "";
        extraLinkName = "";
        extraImage = "";
        finalizedImage = "";
        linkOpen = false;
    }

    function addImage(): void {
        if (extraImage.trim().length === 0) {
            openSnackbar("Image url is empty.", "error");
            return;
        }

        if (extraImage.length > ChatConstants.URL_MAX_LENGTH) {
            openSnackbar(`Image url is too long. Max length is ${ChatConstants.URL_MAX_LENGTH} characters.`, "error");
            return;
        }

        finalizedImage = extraImage;
        extraLink = "";
        extraLinkName = "";
        extraImage = "";
        finalizedLink = "";
        finalizedLinkName = "";
        imageOpen = false;
    }

    function invalidImage(event: Event): void {
        openSnackbar("Invalid image url. Please add a valid image url.", "error");
        finalizedImage = "";
    }

    function removeLink(): void {
        finalizedLink = "";
        finalizedLinkName = "";
    }

    function removeImage(): void {
        finalizedImage = "";
    }

    async function sendMessage(): Promise<void> {
        if (messageProcessing || messagePercentage < 100) {
            return;
        } else {
            messageProcessing = true;
        }

        if (messageText.trim().length === 0) {
            messageProcessing = false;
            return;
        }
        if (messageText.length > ChatConstants.MESSAGE_MAX_LENGTH) {
            openSnackbar(`Message is too long. Max length is ${ChatConstants.MESSAGE_MAX_LENGTH} characters.`, "error");
            messageProcessing = false;
            return;
        }
        
        messagePercentage = 0;

        if (currMember) {
            await refreshChat(true);

            let message: Message = new Message({
                id: StringHelper.generateID(),
                text: messageText,
                senderId: currMember.id,
                replyId: replyOpen && replyMessage ? replyMessage.id : '',
                link: finalizedLink,
                linkName: finalizedLinkName,
                imageUrl: finalizedImage,
                pollId: '',
                createdAtTemp: serverTimestamp()
            });

            project.chat.messageIds = [...project.chat.messageIds, message.id];

            let lastMessage: Message = messages[0];
            let lastMessageDeleted: boolean = false;
            if (project.chat.messageIds.length > ChatConstants.MESSAGE_MAX_COUNT) {
                project.chat.messageIds = project.chat.messageIds.filter((id) => id !== lastMessage.id);
                lastMessageDeleted = true;
            }
            
            messageText = "";
            messagePercentage = 0;
            removeLink();
            removeImage();

            replyOpen = false;
            
            let chatDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("chats", project.chatId);
            setDoc(chatDoc, project.chat.compactify()).then(() => {
                let messageDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("messages", message.id);
                setDoc(messageDoc, message.compactify()).then(() => {
                    getDoc(messageDoc).then(async (doc) => {
                        let newMessage: Message = new Message(doc.data());
                        newMessage.sender = currMember;
                        newMessage.reply = replyMessage;
                        project.chat.messages = [newMessage, ...project.chat.messages];
                        messages = project.chat.messages;

                        if (newMessage.text.search(/@([^\s]+)/g) != -1) {
                            let pingedMembers: Member[] = [];
                            for (let match of newMessage.text.match(/@([^\s]+)/g)) {
                                for (let m of project.joinedMembers) {
                                    if (match.toLowerCase() === `@${m.displayName.toLowerCase()}` && !pingedMembers.includes(m) && m.id !== currMember.id) {
                                        pingedMembers.push(m);
                                        let ping: Ping = new Ping({
                                            id: StringHelper.generateID(),
                                            type: PingConstants.TYPES.USER,
                                            title: "Member pinged",
                                            message: `Member "${currMember.displayName}" pinged you in project "${project.name}".`,
                                            createdAtTemp: serverTimestamp(),
                                        });
                                        let pingDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("pings", ping.id);
                                        await setDoc(pingDoc, ping.compactify());
                                        m.pingIds.push(ping.id);
                                        let memberDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("members", m.id);
                                        await setDoc(memberDoc, m.compactify());
                                        break;
                                    }
                                }
                            }
                        }

                        if (newMessage.reply != null && newMessage.reply.senderId !== currMember.id) {
                            let ping: Ping = new Ping({
                                id: StringHelper.generateID(),
                                type: PingConstants.TYPES.USER,
                                title: "Member replied",
                                message: `Member "${currMember.displayName}" replied to your message in "${project.name}".`,
                                createdAtTemp: serverTimestamp(),
                            });
                            let pingDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("pings", ping.id);
                            await setDoc(pingDoc, ping.compactify());
                            newMessage.reply.sender.pingIds.push(ping.id);
                            let memberDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("members", newMessage.reply.sender.id);
                            await setDoc(memberDoc, newMessage.reply.sender.compactify());
                        }

                        projectSelected.update((value) => {
                            value.project = project;
                            value.projectName = project.name;
                            return value;
                        });

                        allProjects.update((value) => {
                            value.projects = value.projects.map((p) => {
                                if (p.id === project.id) {
                                    return project;
                                }
                                return p;
                            });
                            return value;
                        });

                        messageProcessing = false;
                        messagePercentage = 0;
                        cancelReply();
                    }).catch((error) => {
                        openSnackbar("An error occurred while sending the message.", "error");
                        messageProcessing = false;
                        messagePercentage = 0;
                        cancelReply();
                    });
                    messagePercentage = 0;
                }).catch((error) => {
                    openSnackbar("An error occurred while sending the message.", "error");
                    messageProcessing = false;
                    messagePercentage = 0;
                    cancelReply();
                });
                if (lastMessageDeleted) {
                    let lastMessageDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("messages", lastMessage.id);
                    deleteDoc(lastMessageDoc).then(() => {
                        project.chat.messages = project.chat.messages.slice(1);
                        messages = project.chat.messages;

                        projectSelected.update((value) => {
                            value.project = project;
                            value.projectName = project.name;
                            return value;
                        });

                        allProjects.update((value) => {
                            value.projects = value.projects.map((p) => {
                                if (p.id === project.id) {
                                    return project;
                                }
                                return p;
                            });
                            return value;
                        });

                        messageProcessing = false;
                        messagePercentage = 0;
                    }).catch((error) => {
                        openSnackbar("An error occurred while sending the message.", "error");
                        messageProcessing = false;
                        messagePercentage = 0;
                    });
                }
            }).catch((error) => {
                openSnackbar("An error occurred while sending the message.", "error");
                messageProcessing = false;
                messagePercentage = 0;
            });
        } else {
            openSnackbar("An error occurred while sending the message.", "error");
            messageProcessing = false;
            messagePercentage = 0;
        }
    }

    function openReply(message: Message): void {
        replyOpen = true;
        replyMessage = message;
        messageInput.focus();
    }

    function jumpToReply(message: Message): void {
        if (messagesContainer) {
            let messageElement: HTMLElement = messagesContainer.querySelector(`#message-${message.replyId}`);
            if (messageElement) {
                messageElement.scrollIntoView({behavior: "smooth", block: "center"});
                highlightedId = message.replyId;
                isHighlighted = true;
            }
        }
    }

    function cancelReply(): void {
        replyOpen = false;
        replyMessage = null;
    }

    function setKeybinds(): void {
        document.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && messageFocused) {
                sendMessage();
            }
            else if (event.key === 'Escape' && replyOpen) {
                cancelReply();
            }
            else if (event.ctrlKey && event.key === 'b' && messageText.trim().length > 0 && messageFocused) {
                messageText = `**${messageText}**`;
            }
            else if (event.ctrlKey && event.key === 'i' && messageText.trim().length > 0 && messageFocused) {
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
        getProject();
        setKeybinds();
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

    .discussion-title-container {
        display: flex;
        align-items: center;
        padding: 8px;
        border-bottom: 1px solid var(--grey-300);
    }

    .discussion-title {
        font-size: 16px;
        font-weight: 500;
        color: var(--grey-800);
    }

    .discussion-title-icon-progress-circle-container {
        position: absolute;
        right: 8px;
        margin-top: -1px;
    }

    .discussion-title-icon-button {
        position: absolute;
        right: 10px;
        font-size: 24px;
        color: var(--grey-800);
        cursor: pointer;
        transition: color var(--transition-duration);

        &:hover {
            color: var(--accent);
        }
    }
    
    .discussion-messages-container {
        height: calc(100% - 82px);
        overflow-y: auto;
        overflow-x: hidden;
    }

    .discussion-reply-container {
        box-sizing: border-box;
        position: absolute;
        left: 0;
        width: 100%;
        height: 24px;
        padding-left: 8px;
        padding-right: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: var(--accent);
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
        color: var(--grey-100);
        font-size: 12px;
        z-index: 1;
        user-select: none;
    }

    .discussion-reply-cancel {
        font-size: 16px;
        color: var(--grey-100);
        cursor: pointer;
        transition: color var(--transition-duration);

        &:hover {
            color: var(--grey-300);
        }
    }

    .discussion-input-container {
        position: absolute;
        bottom: 0;
        width: 100%;
        display: flex;
        align-items: center;
        padding-top: 8px;
        padding-bottom: 8px;
        border-top: 1px solid var(--grey-300);
    }

    .discussion-input-field {
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
        user-select: none;

        transition: border-color var(--transition-duration);

        &:hover {
            border-color: var(--accent-light);
        }

        &:focus {
            border-color: var(--accent);
        }
    }

    .discussion-input-field-progress-line-container {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
    }

    .discussion-input-icon-button {
        position: relative;
        margin-left: 8px;
        margin-right: 8px;
        font-size: 24px;
        color: var(--grey-800);
        cursor: pointer;
        transition: color var(--transition-duration);

        &:hover {
            color: var(--accent);
        }
    }

    .discussion-input-icon-progress-circle-container {
        position: absolute;
        right: 8px;
    }

    .discussion-extra-button {
        display: flex;
        align-items: center;
        padding: 8px;
        margin-bottom: 4px;
        width: 100%;
        background-color: var(--grey-200);
        border: 1px solid var(--grey-400);
        border-radius: 4px;
        outline: none;
        font-size: 14px;
        color: var(--grey-800);
        cursor: pointer;

        transition: background-color var(--transition-duration), border-color var(--transition-duration), color var(--transition-duration);

        &:hover {
            color: var(--accent);
            border-color: var(--accent);
            background-color: rgba(var(--accent-rgb), 0.1);
        }
    }

    .discussion-extra-button-icon {
        margin-right: 8px;
        font-size: 24px;
    }

    .discussion-extra-input-field {
        box-sizing: border-box;
        width: 100%;
        padding-left: 4px;
        padding-right: 4px;
        padding-top: 2px;
        padding-bottom: 2px;
        margin-bottom: 4px;
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

    .discussion-extra-action {
        padding-left: 4px;
        padding-right: 4px;
        padding-top: 2px;
        padding-bottom: 2px;
        background-color: var(--accent-light);
        font-size: 12px;
        color: var(--grey-800);
        border: none;
        outline: none;
        border-radius: 4px;
        cursor: pointer;

        transition: background-color var(--transition-duration), color var(--transition-duration);

        &:hover {
            background-color: var(--accent-dark);
            color: var(--grey-100);
        }
    }

    .discussion-extra-cancel {
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

    .discussion-link-container {
        box-sizing: border-box;
        position: absolute;
        left: 0;
        top: -25px;
        width: 100%;
        height: 24px;
        padding-left: 8px;
        padding-right: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: var(--grey-200);
        color: var(--grey-800);
        font-size: 12px;
        z-index: 1;
        user-select: none;
    }

    .discussion-link-preview {
        position: absolute;
        left: 90px;
        width: calc(100% - 114px);
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .discussion-link-cancel {
        font-size: 16px;
        color: var(--grey-800);
        cursor: pointer;
        transition: color var(--transition-duration);

        &:hover {
            color: var(--accent);
        }
    }

    .discussion-image-container {
        box-sizing: border-box;
        position: absolute;
        left: 0;
        top: -97px;
        width: 100%;
        height: 96px;
        padding-left: 8px;
        padding-right: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: var(--grey-200);
        color: var(--grey-800);
        font-size: 12px;
        z-index: 1;
        user-select: none;
    }

    .discussion-image-preview {
        position: absolute;
        left: 108px;
        height: 72px;
        max-width: calc(100% - 120px);
        border-radius: 4px;
    }

    .discussion-image-cancel {
        font-size: 16px;
        color: var(--grey-800);
        cursor: pointer;
        transition: color var(--transition-duration);

        &:hover {
            color: var(--accent);
        }
    }
</style>
<div class="discussion-container" transition:fly={{x: "50%", duration: TransitionConstants.DURATION}}>
    <div class="discussion-title-container">
        <div class="discussion-title">Discussion</div>
        <div class="discussion-title-icon-progress-circle-container">
            <ProgressCircle radius={12} bind:percentage={messagePercentage} storageName="messageRefreshPercentage" autoFill={true} autofillTime={ChatConstants.MESSAGE_TIMEOUT} />
        </div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="discussion-title-icon-button material-symbols-rounded" on:click={() => refreshChat(false)}>refresh</span>
    </div>
    <div class="discussion-messages-container" bind:this={messagesContainer}>
        {#each messages as message, i}
            <ChatMessage bind:message={message} bind:project={project} hasAvatar={message.senderId !== messages[i - 1]?.senderId || message.createdAt.getTime() - messages[i - 1]?.createdAt.getTime() > ChatConstants.MESSAGE_GROUP_TIME || message.replyId.length > 0 && message.reply != null} highlightedId={highlightedId} bind:isHighlighted={isHighlighted} on:reply={() => openReply(message)} on:jumpToReply={() => jumpToReply(message)} />
        {/each}
    </div>
    <div class="discussion-input-container">
        {#if replyOpen}
            <div class="discussion-reply-container" style="top: {finalizedLink.length > 0 ? -49 : finalizedImage.length > 0 ? -121 : -25}px" transition:fade={{duration: TransitionConstants.DURATION}}>
                Replying to {replyMessage.sender.displayName}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <span class="discussion-reply-cancel material-symbols-rounded" on:click={cancelReply}>close</span>
            </div>
        {/if}
        {#if finalizedLink.length > 0}
            <div class="discussion-link-container" transition:fade={{duration: TransitionConstants.DURATION}}>
                Link preview:
                <a class="discussion-link-preview" href={finalizedLink} target="_blank" rel="noopener noreferrer">{finalizedLinkName}</a>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <span class="discussion-link-cancel material-symbols-rounded" on:click={removeLink}>close</span>
            </div>
        {/if}
        {#if finalizedImage.length > 0}
            <div class="discussion-image-container" transition:fade={{duration: TransitionConstants.DURATION}}>
                Image preview:
                <!-- svelte-ignore a11y-img-redundant-alt -->
                <img class="discussion-image-preview" src={finalizedImage} alt="Image preview" on:error={invalidImage} />
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <span class="discussion-image-cancel material-symbols-rounded" on:click={removeImage}>close</span>
            </div>
        {/if}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="discussion-input-icon-button material-symbols-rounded" on:click={toggleExtra}>add_circle</span>
        <Menu bind:open={extrasOpen} left="8px" bottom="48px" width="150px">
            <button class="discussion-extra-button" on:click={openLink}>
                <span class="discussion-extra-button-icon material-symbols-rounded">link</span>
                <span>Link</span>
            </button>
            <button class="discussion-extra-button" on:click={openImage}>
                <span class="discussion-extra-button-icon material-symbols-rounded">image</span>
                <span>Image url</span>
            </button>
            <button class="discussion-extra-button" on:click={openPoll}>
                <span class="discussion-extra-button-icon material-symbols-rounded">ballot</span>
                <span>Poll</span>
            </button>
        </Menu>
        <Menu bind:open={linkOpen} left="8px" bottom="48px" width="calc(100% - 64px)">
            <input class="discussion-extra-input-field" type="text" placeholder="Type a link..." bind:value={extraLink} />
            <input class="discussion-extra-input-field" type="text" placeholder="Type a display text..." bind:value={extraLinkName} />
            <button class="discussion-extra-action" on:click={addLink}>Add</button>
            <button class="discussion-extra-cancel" on:click={toggleExtra}>Cancel</button>
        </Menu>
        <Menu bind:open={imageOpen} left="8px" bottom="48px" width="calc(100% - 64px)">
            <input class="discussion-extra-input-field" type="text" placeholder="Type an image url..." bind:value={extraImage} />
            <button class="discussion-extra-action" on:click={addImage}>Add</button>
            <button class="discussion-extra-cancel" on:click={toggleExtra}>Cancel</button>
        </Menu>
        <input type="text" class="discussion-input-field" placeholder="Type a message..." maxlength={ChatConstants.MESSAGE_MAX_LENGTH} bind:value={messageText} on:focusin={() => messageFocused = true} on:focusout={() => messageFocused = false} bind:this={messageInput} />
        <div class="discussion-input-field-progress-line-container">
            <ProgressLine percentage={messagePercentage} autoFill={true} autofillTime={ChatConstants.MESSAGE_TIMEOUT} />
        </div>
        <div class="discussion-input-icon-progress-circle-container">
            <ProgressCircle radius={12} percentage={messagePercentage} autoFill={true} autofillTime={ChatConstants.MESSAGE_TIMEOUT} />
        </div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="discussion-input-icon-button material-symbols-rounded" on:click={sendMessage}>send</span>
    </div>
</div>
<Snackbar type={snackbarType} bind:open={snackbarOpen}>{snackbarText}</Snackbar>