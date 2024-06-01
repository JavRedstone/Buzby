<script lang="ts">
	import ChatMessage from './chat-message.svelte';
	import { fly } from 'svelte/transition';
	import { ChatConstants } from "$lib/elements/classes/data/chat/ChatConstants";
	import { Message } from "$lib/elements/classes/data/chat/Message";
	import { allProjects, memberStatus, projectSelected } from "$lib/elements/stores/project-store";
	import { onMount } from "svelte";
	import Snackbar from "$lib/elements/ui/general/snackbar.svelte";
	import { deleteDoc, getDoc, setDoc, type DocumentData, type DocumentReference } from "firebase/firestore";
	import { getFirestoreDoc } from "$lib/elements/firebase/firebase";
	import type { Project } from "$lib/elements/classes/data/project/Project";
	import { StringHelper } from "$lib/elements/helpers/StringHelper";
	import type { Member } from "$lib/elements/classes/data/project/Member";
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import ProgressCircle from '../general/progress-circle.svelte';
	import { Chat } from '$lib/elements/classes/data/chat/Chat';
	import ProgressLine from '../general/progress-line.svelte';

    let currMember: Member = null;
    let project: Project = null;
    let messages: Message[] = [];
    
    let messagesContainer: HTMLElement = null;
    let messageFocused: boolean = false;
    let messageText: string = "";
    let messageProcessing: boolean = false;
    let messagePercentage: number = 100;
    
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
        for (let i = 0; i < messages.length; i++) {
            if (project.memberIds.includes(messages[i].senderId)) {
                messages[i].sender = project.members.find((m) => m.id === messages[i].senderId);
            } else {
                await messages[i].getSender();

                // *this is not an infinite loop because the sender is already set
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

    function putExtra(): void {
        // TODO: Implement polls and stuff
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
                replyId: '',
                createdAt: new Date().getTime()
            });

            project.chat.messageIds = [...project.chat.messageIds, message.id];
            project.chat.messages = [...project.chat.messages, message];

            project.chat.messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

            messages = project.chat.messages;

            let lastMessage: Message = messages[0];
            let lastMessageDeleted: boolean = false;

            if (messages.length > ChatConstants.MESSAGE_MAX_COUNT) {
                project.chat.messages = project.chat.messages.slice(1);
                project.chat.messageIds = project.chat.messageIds.filter((id) => id !== lastMessage.id);
                messages = project.chat.messages;
                lastMessageDeleted = true;
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
            
            messageText = "";
            messagePercentage = 0;
            
            let chatDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("chats", project.chatId);
            setDoc(chatDoc, project.chat.compactify()).then(() => {
                let messageDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("messages", message.id);
                setDoc(messageDoc, message.compactify()).then(() => {
                    messageProcessing = false;
                    messagePercentage = 0;
                }).catch((error) => {
                    openSnackbar("An error occurred while sending the message.", "error");
                    messageProcessing = false;
                    messagePercentage = 0;
                });
                if (lastMessageDeleted) {
                    let lastMessageDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("messages", lastMessage.id);
                    deleteDoc(lastMessageDoc).then(() => {
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

    function setKeybinds(): void {
        document.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && messageFocused) {
                sendMessage();
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

    .discussion-input-container {
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
            <ChatMessage bind:message={message} bind:project={project} hasAvatar={message.senderId !== messages[i - 1]?.senderId || message.createdAt.getTime() - messages[i - 1]?.createdAt.getTime() > ChatConstants.MESSAGE_GROUP_TIME} />
        {/each}
    </div>
    <div class="discussion-input-container">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="discussion-input-icon-button material-symbols-rounded" on:click={putExtra}>add_circle</span>
        <input type="text" class="discussion-input-field" placeholder="Type a message..." maxlength={ChatConstants.MESSAGE_MAX_LENGTH} bind:value={messageText} on:focusin={() => messageFocused = true} on:focusout={() => messageFocused = false} />
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