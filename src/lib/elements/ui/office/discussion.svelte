<script lang="ts">
	import ChatMessage from './chat-message.svelte';
	import { fly, fade, slide } from 'svelte/transition';
	import { Message } from "$lib/elements/classes/data/chat/Message";
	import { currentMember, projectSelected } from "$lib/elements/stores/project-store";
	import { onDestroy, onMount } from "svelte";
	import Snackbar from "$lib/elements/ui/general/snackbar.svelte";
	import { deleteDoc, getDoc, serverTimestamp, setDoc, type DocumentData, type DocumentReference } from "firebase/firestore";
	import { getFirestoreDoc } from "$lib/elements/firebase/firebase";
	import type { Project } from "$lib/elements/classes/data/project/Project";
	import { StringHelper } from "$lib/elements/helpers/StringHelper";
	import type { Member } from "$lib/elements/classes/data/project/Member";
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import ProgressCircle from '../general/progress-circle.svelte';
	import ProgressLine from '../general/progress-line.svelte';
	import { Ping } from '$lib/elements/classes/data/chat/Ping';
	import { PingConstants } from '$lib/elements/classes/data/chat/PingConstants';
	import Menu from '../general/menu.svelte';
	import { Poll } from '$lib/elements/classes/data/chat/Poll';
	import Dropdown from '../general/dropdown.svelte';
	import { MessageConstants } from '$lib/elements/classes/data/chat/MessageConstants';
	import { PollOption } from '$lib/elements/classes/data/chat/PollOption';

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
    let videoOpen: boolean = false;
    let pollOpen: boolean = false;

    let extraLink: string = "";
    let extraLinkName: string = "";
    let extraImageUrl: string = "";
    let extraVideoUrl: string = "";

    let extraPollQuestion: string = "";
    let extraPollOptions: string[] = ["", ""];
    let extraPollDuration: string = MessageConstants.POLL_DEFAULT_DURATION;
    let extraPollDurationIdx: number = MessageConstants.POLL_DURATIONS.indexOf(MessageConstants.POLL_DEFAULT_DURATION);
    let extraPollDurationOpen: boolean = false;
    let extraPollMultiple: boolean = false;

    let finalizedLink: string = "";
    let finalizedLinkName: string = "";
    let finalizedImageUrl: string = "";
    let finalizedVideoUrl: string = "";
    let finalizedPollQuestion: string = "";
    let finalizedPollOptions: string[] = [];
    let finalizedPollDurationIdx: number = MessageConstants.POLL_DURATIONS.indexOf(MessageConstants.POLL_DEFAULT_DURATION);
    let finalizedPollMultiple: boolean = false;

    let replyOpen: boolean = false;
    let replyMessage: Message = null;

    let highlightedId: string = "";
    let isHighlighted: boolean = false;
    
    let snackbarOpen: boolean = false;
    let snackbarText: string = "";
    let snackbarType: string = "neutral";

    function getMember(): void {
        currentMember.subscribe((c) => {
            currMember = c;
            if (c != null) {
                projectSelected.subscribe((value) => {
                    project = currMember.projects.find((p) => p.id === value);

                    if (project) {
                        messages = project.messages;

                        if (messagesContainer) {
                            messagesContainer.scrollTop = messagesContainer.scrollHeight;
                        }
                    }
                });
            }
        });
    }

    function removeExtraLink(): void {
        extraLink = "";
        extraLinkName = "";
    }

    function removeExtraImage(): void {
        extraImageUrl = "";
    }

    function removeExtraVideo(): void {
        extraVideoUrl = "";
    }

    function removeExtraPoll(): void {
        extraPollQuestion = "";
        extraPollOptions = ["", ""];
        extraPollDuration = MessageConstants.POLL_DEFAULT_DURATION;
        extraPollDurationIdx = MessageConstants.POLL_DURATIONS.indexOf(MessageConstants.POLL_DEFAULT_DURATION);
        extraPollDurationOpen = false;
        extraPollMultiple = false;
    }

    function removeFinalizedLink(): void {
        finalizedLink = "";
        finalizedLinkName = "";
    }

    function removeFinalizedImage(): void {
        finalizedImageUrl = "";
    }

    function removeFinalizedVideo(): void {
        finalizedVideoUrl = "";
    }

    function removeFinalizedPoll(): void {
        finalizedPollQuestion = "";
        finalizedPollOptions = [];
        finalizedPollDurationIdx = MessageConstants.POLL_DURATIONS.indexOf(MessageConstants.POLL_DEFAULT_DURATION);
        finalizedPollMultiple = false;
    }

    function removeLink(): void {
        removeExtraLink();
        removeFinalizedLink();
    }

    function removeImage(): void {
        removeExtraImage();
        removeFinalizedImage();
    }

    function removeVideo(): void {
        removeExtraVideo();
        removeFinalizedVideo();
    }

    function removePoll(): void {
        removeExtraPoll();
        removeFinalizedPoll();
    }

    function clearExtra(): void {
        removeExtraLink();
        removeExtraImage();
        removeExtraVideo();
        removeExtraPoll();
    }

    function clearFinalized(): void {
        removeFinalizedLink();
        removeFinalizedImage();
        removeFinalizedVideo();
        removeFinalizedPoll();
    }

    function toggleExtra(): void {
        extrasOpen = !extrasOpen;
        linkOpen = false;
        imageOpen = false;
        videoOpen = false;
        pollOpen = false;

        clearExtra();
    }

    function openLink(): void {
        linkOpen = true;
        extrasOpen = false;

        removeExtraLink();
    }

    function openImage(): void {
        imageOpen = true;
        extrasOpen = false;

        removeExtraImage();
    }

    function openVideo(): void {
        videoOpen = true;
        extrasOpen = false;

        removeExtraVideo();
    }

    function openPoll(): void {
        pollOpen = true;
        extrasOpen = false;

        removeExtraPoll();
    }

    function addLink(): void {
        if (extraLink.trim().length === 0) {
            openSnackbar("Link is empty.", "error");
            return;
        }

        if (extraLink.length > MessageConstants.URL_MAX_LENGTH) {
            openSnackbar(`Link is too long. Max length is ${MessageConstants.URL_MAX_LENGTH} characters.`, "error");
            return;
        }

        if (extraLinkName.trim().length === 0) {
            extraLinkName = extraLink.substring(0, MessageConstants.URL_NAME_MAX_LENGTH);
        }

        if (extraLinkName.length > MessageConstants.URL_NAME_MAX_LENGTH) {
            openSnackbar(`Link display text is too long. Max length is ${MessageConstants.URL_NAME_MAX_LENGTH} characters.`, "error");
            return;
        }

        finalizedLink = extraLink;
        finalizedLinkName = extraLinkName;
        clearExtra();
        removeFinalizedImage();
        removeFinalizedVideo();
        removeFinalizedPoll();
        linkOpen = false;
    }

    function addImage(): void {
        if (extraImageUrl.trim().length === 0) {
            openSnackbar("Image URL is empty.", "error");
            return;
        }

        if (extraImageUrl.length > MessageConstants.URL_MAX_LENGTH) {
            openSnackbar(`Image URL is too long. Max length is ${MessageConstants.URL_MAX_LENGTH} characters.`, "error");
            return;
        }

        finalizedImageUrl = extraImageUrl;
        clearExtra();
        removeFinalizedLink();
        removeFinalizedVideo();
        removeFinalizedPoll();
        imageOpen = false;
    }

    function addVideo(): void {
        if (extraVideoUrl.trim().length === 0) {
            openSnackbar("Video url is empty.", "error");
            return;
        }

        if (extraVideoUrl.length > MessageConstants.URL_MAX_LENGTH) {
            openSnackbar(`Video url is too long. Max length is ${MessageConstants.URL_MAX_LENGTH} characters.`, "error");
            return;
        }

        if (extraVideoUrl.search("youtube.com") === -1 && extraVideoUrl.search("youtu.be") === -1) {
            invalidVideo();
            return;
        }

        finalizedVideoUrl = extraVideoUrl;
        clearExtra();
        removeFinalizedLink();
        removeFinalizedImage();
        removeFinalizedPoll();
        videoOpen = false;
    }

    function addPoll(): void {
        if (extraPollQuestion.trim().length === 0) {
            openSnackbar("Poll question is empty.", "error");
            return;
        }

        if (extraPollQuestion.length > MessageConstants.POLL_QUESTION_MAX_LENGTH) {
            openSnackbar(`Poll question is too long. Max length is ${MessageConstants.POLL_QUESTION_MAX_LENGTH} characters.`, "error");
            return;
        }

        let options: string[] = extraPollOptions.filter((option) => option.trim().length > 0);
        if (options.length < 2) {
            openSnackbar("Poll must have at least 2 options.", "error");
            return;
        }

        if (options.length > MessageConstants.POLL_MAX_OPTIONS) {
            openSnackbar(`Poll has too many options. Max number of options is ${MessageConstants.POLL_MAX_OPTIONS}.`, "error");
            return;
        }

        finalizedPollQuestion = extraPollQuestion;
        finalizedPollOptions = options;
        finalizedPollDurationIdx = extraPollDurationIdx;
        finalizedPollMultiple = extraPollMultiple;
        clearExtra();
        removeFinalizedLink();
        removeFinalizedImage();
        removeFinalizedVideo();
        pollOpen = false;
    }

    function addPollOption(): void {
        if (extraPollOptions.length < MessageConstants.POLL_MAX_OPTIONS) {
            extraPollOptions = [...extraPollOptions, ""];
        }
        else {
            openSnackbar(`You can only add up to ${MessageConstants.POLL_MAX_OPTIONS} options in a poll.`, "error");
        }
    }

    function removePollOption(idx: number): void {
        if (extraPollOptions.length > 2) {
            extraPollOptions = extraPollOptions.filter((_, index) => index !== idx);
        }
        else {
            openSnackbar("Poll must have at least 2 options.", "error");
        }
    }

    function invalidImage(): void {
        openSnackbar("Invalid image URL. Please add a valid image URL.", "error");
        removeImage();
    }

    function invalidVideo(): void {
        openSnackbar("Invalid Youtube video URL. Please add a valid video URL.", "error");
        removeVideo();
    }

    function getEmbed(url: string): string {
        let videoId: string = url.split("v=")[1];
        let ampersandPosition: number = videoId.indexOf("&");
        if (ampersandPosition !== -1) {
            videoId = videoId.substring(0, ampersandPosition);
        }
        return `https://www.youtube.com/embed/${videoId}`;
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
        if (messageText.length > MessageConstants.MESSAGE_MAX_LENGTH) {
            openSnackbar(`Message is too long. Max length is ${MessageConstants.MESSAGE_MAX_LENGTH} characters.`, "error");
            messageProcessing = false;
            return;
        }
        
        messagePercentage = 0;

        if (currMember) {
            let poll: Poll = null;
            let pollOptions: PollOption[] = [];
            if (finalizedPollQuestion.length > 0) {
                poll = new Poll({
                    id: StringHelper.generateID(),
                    question: finalizedPollQuestion,
                    multiple: finalizedPollMultiple,
                    duration: MessageConstants.POLL_DURATIONS_MS[finalizedPollDurationIdx],
                    createdAtTemp: serverTimestamp()
                });

                for (let option of finalizedPollOptions) {
                    pollOptions.push(new PollOption({
                        id: StringHelper.generateID(),
                        pollId: poll.id,
                        memberId: null,
                        text: option,
                        createdAtTemp: serverTimestamp()
                    }));
                }

                removeFinalizedPoll();
            }

            let message: Message = new Message({
                id: StringHelper.generateID(),
                projectId: project.id,
                memberId: currMember.id,
                replyId: replyOpen && replyMessage ? replyMessage.id : '',
                pollId: poll ? poll.id : '',
                text: messageText,
                edited: false,
                createdAtTemp: serverTimestamp()
            });

            if (project.messages.length > MessageConstants.MESSAGE_MAX_COUNT) {
                for (let i = 0; i < project.messages.length - MessageConstants.MESSAGE_MAX_COUNT; i++) {
                    let messageDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("messages", project.messages[i].id);
                    deleteDoc(messageDoc);
                }
            }
            
            messageText = "";
            messagePercentage = 0;
            clearFinalized();

            replyOpen = false;
            
            let messageDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("messages", message.id);
            setDoc(messageDoc, message.compactify()).then(() => {
                getDoc(messageDoc).then(async (doc) => {
                    let newMessage: Message = new Message(doc.data());
                    newMessage.member = currMember;
                    newMessage.reply = replyMessage;

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
                                    setDoc(pingDoc, ping.compactify());
                                    m.pingIds.push(ping.id);
                                    let memberDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("members", m.id);
                                    await setDoc(memberDoc, m.compactify());
                                    break;
                                }
                            }
                        }
                    }
                    
                    if (newMessage.pollId.length > 0) {
                        let pollDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("polls", newMessage.pollId);
                        setDoc(pollDoc, poll.compactify());

                        for (let pollOption of pollOptions) {
                            let pollOptionDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("pollOptions", pollOption.id);
                            setDoc(pollOptionDoc, pollOption.compactify());
                        }
                    }

                    messageProcessing = false;
                    messagePercentage = 0;
                    cancelReply();

                    if (newMessage.reply != null && newMessage.reply.memberId !== currMember.id) {
                        let ping: Ping = new Ping({
                            id: StringHelper.generateID(),
                            memberId: newMessage.reply.memberId,
                            projectId: project.id,
                            messageId: newMessage.id,
                            type: PingConstants.TYPES.USER,
                            title: "Member replied",
                            message: `Member "${currMember.displayName}" replied to your message in "${project.name}".`,
                            createdAtTemp: serverTimestamp(),
                        });
                        let pingDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("pings", ping.id);
                        setDoc(pingDoc, ping.compactify());
                    }
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

    function jumpToMessage(messageId: string): void {
        if (messagesContainer) {
            let messageElement: HTMLElement = messagesContainer.querySelector(`#message-${messageId}`);
            if (messageElement) {
                messageElement.scrollIntoView({behavior: "smooth", block: "center"});
                highlightedId = messageId;
                isHighlighted = true;
            }
        }
    }

    function mentionSender(message: Message): void {
        if (message.member != null) {
            messageText = `${messageText} @${message.member.displayName} `;
            messageInput.focus();
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

    function removeKeybinds(): void {
        document.removeEventListener("keydown", (event) => {
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
        setKeybinds();
    });

    onDestroy(() => {
        removeKeybinds();
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
        box-shadow: 0 0 32px 0 rgba(0, 0, 0, 0.1);
    }

    .discussion-title-container {
        display: flex;
        align-items: center;
        padding: 8px;
        border-bottom: 1px solid var(--grey-300);
        user-select: none;
    }

    .discussion-title {
        font-size: 16px;
        font-weight: 500;
        color: var(--grey-800);
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

    .discussion-reply-jump {
        font-size: 12px;
        color: var(--grey-100);
        cursor: pointer;
        transition: color var(--transition-duration);

        &:hover {
            color: var(--grey-300);
        }
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

    .discussion-extra-title {
        font-size: 16px;
        font-weight: 500;
        color: var(--grey-800);
        margin-bottom: 8px;
    }

    .discussion-extra-subtitle {
        font-size: 14px;
        color: var(--grey-800);
        margin-bottom: 4px;
    }

    .discussion-extra-preview-cancel {
        font-size: 16px;
        color: var(--grey-800);
        cursor: pointer;
        transition: color var(--transition-duration);

        &:hover {
            color: var(--accent);
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
        height: 80px;
        max-width: calc(100% - 120px);
    }

    .discussion-video-container {
        box-sizing: border-box;
        position: absolute;
        left: 0;
        top: -118px;
        width: 100%;
        height: 116px;
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

    .discussion-video-preview {
        position: absolute;
        left: 108px;
        max-width: calc(100% - 120px);
    }

    .discussion-poll-container {
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

    .discussion-poll-preview-message {
        font-size: 12px;
        color: var(--grey-800);
    }

    .discussion-poll-options-container {
        box-sizing: border-box;
        margin-top: 8px;
        margin-bottom: 8px;
        padding: 8px;
        border: 1px solid var(--grey-400);
        border-radius: 4px;
    }

    .discussion-poll-option-container {
        margin-bottom: 4px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }

    .discussion-poll-option-field {
        box-sizing: border-box;
        width: 100%;
        padding-left: 4px;
        padding-right: 4px;
        padding-top: 2px;
        padding-bottom: 2px;
        margin-left: 4px;
        margin-right: 4px;
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

    .discussion-extra-poll-add-option {
        padding-left: 4px;
        padding-right: 4px;
        padding-top: 2px;
        padding-bottom: 2px;
        font-size: 12px;
        color: var(--grey-800);
        border: 1px solid var(--grey-400);
        outline: none;
        border-radius: 4px;
        cursor: pointer;

        transition: border-color var(--transition-duration);

        &:hover {
            border-color: var(--accent-light);
        }
    }

    .discussion-extra-poll-multiple-container {
        display: flex;
        align-items: center;
        margin-top: 8px;
        margin-bottom: 8px;
    }

    .discussion-extra-poll-multiple-checkbox {
        width: 16px;
        height: 16px;
        margin-right: 4px;
        accent-color: var(--primary);
        cursor: pointer;
    }

    .discussion-extra-poll-multiple-label {
        font-size: 12px;
        color: var(--grey-800);
    }

    .discussion-extra-poll-duration-label {
        font-size: 12px;
        color: var(--grey-800);
    }
</style>
{#if project}
    <div class="discussion-container" transition:fly={{x: "50%", duration: TransitionConstants.DURATION}}>
        <div class="discussion-title-container">
            <div class="discussion-title">Discussion</div>
        </div>
        <div class="discussion-messages-container" bind:this={messagesContainer}>
            {#each messages as message, i}
                <ChatMessage bind:message={message} bind:project={project} hasAvatar={message.memberId !== project.messages[i - 1]?.memberId || message.createdAt.getTime() - project.messages[i - 1]?.createdAt.getTime() > MessageConstants.MESSAGE_GROUP_TIME || message.replyId.length > 0} highlightedId={highlightedId} bind:isHighlighted={isHighlighted} on:reply={() => openReply(message)} on:jumpToReply={() => jumpToMessage(message.replyId)} on:clickedName={() => mentionSender(message)} />
            {/each}
        </div>
        <div class="discussion-input-container">
            {#if replyOpen}
                <div class="discussion-reply-container" style="top: {finalizedLink.length > 0 || finalizedPollQuestion.length > 0 ? -49 : finalizedImageUrl.length > 0 ? -121 : -25}px" transition:fade={{duration: TransitionConstants.DURATION}}>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div class="discussion-reply-jump" on:click={() => jumpToMessage(replyMessage.id)}>Replying to {replyMessage && replyMessage.member ? replyMessage.member.displayName : ''}</div>
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
                    <span class="discussion-extra-preview-cancel material-symbols-rounded" on:click={removeLink}>close</span>
                </div>
            {/if}
            {#if finalizedImageUrl.length > 0}
                <div class="discussion-image-container" transition:fade={{duration: TransitionConstants.DURATION}}>
                    Image preview:
                    <!-- svelte-ignore a11y-img-redundant-alt -->
                    <img class="discussion-image-preview" src={finalizedImageUrl} alt="Image preview" on:error={invalidImage} />
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <span class="discussion-extra-preview-cancel material-symbols-rounded" on:click={removeImage}>close</span>
                </div>
            {/if}
            {#if finalizedVideoUrl.length > 0}
                <div class="discussion-video-container" transition:fade={{duration: TransitionConstants.DURATION}}>
                    Video preview:
                    <!-- svelte-ignore a11y-media-has-caption -->
                    <iframe class="discussion-video-preview" width="160" height="100" src={getEmbed(finalizedVideoUrl)} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <span class="discussion-extra-preview-cancel material-symbols-rounded" on:click={removeVideo}>close</span>
                </div>
            {/if}
            {#if finalizedPollQuestion.length > 0}
                <div class="discussion-poll-container" transition:fade={{duration: TransitionConstants.DURATION}}>
                    <div class="discussion-poll-preview-message">A poll has been added to the message.</div>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <span class="discussion-extra-preview-cancel material-symbols-rounded" on:click={removePoll}>close</span>
                </div>
            {/if}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <span class="discussion-input-icon-button material-symbols-rounded" on:click={toggleExtra}>add_circle</span>
            <Menu bind:open={extrasOpen} left="8px" bottom="48px" width="200px">
                <button class="discussion-extra-button" on:click={openLink}>
                    <span class="discussion-extra-button-icon material-symbols-rounded">link</span>
                    <span>Link</span>
                </button>
                <button class="discussion-extra-button" on:click={openImage}>
                    <span class="discussion-extra-button-icon material-symbols-rounded">image</span>
                    <span>Image URL</span>
                </button>
                <button class="discussion-extra-button" on:click={openVideo}>
                    <span class="discussion-extra-button-icon material-symbols-rounded">youtube_activity</span>
                    <span>Youtube video URL</span>
                </button>
                <button class="discussion-extra-button" on:click={openPoll}>
                    <span class="discussion-extra-button-icon material-symbols-rounded">ballot</span>
                    <span>Poll</span>
                </button>
            </Menu>
            <Menu bind:open={linkOpen} left="8px" bottom="48px" width="calc(100% - 64px)">
                <div class="discussion-extra-title">Add link</div>
                <input class="discussion-extra-input-field" type="text" placeholder="Type a link..." maxlength={MessageConstants.URL_MAX_LENGTH} bind:value={extraLink} />
                <input class="discussion-extra-input-field" type="text" placeholder="Type a display text..." maxlength={MessageConstants.URL_NAME_MAX_LENGTH} bind:value={extraLinkName} />
                <button class="discussion-extra-action" on:click={addLink}>Add</button>
                <button class="discussion-extra-cancel" on:click={toggleExtra}>Cancel</button>
            </Menu>
            <Menu bind:open={imageOpen} left="8px" bottom="48px" width="calc(100% - 64px)">
                <div class="discussion-extra-title">Add image URL</div>
                <input class="discussion-extra-input-field" type="text" placeholder="Type an image URL..." maxlength={MessageConstants.URL_MAX_LENGTH} bind:value={extraImageUrl} />
                <button class="discussion-extra-action" on:click={addImage}>Add</button>
                <button class="discussion-extra-cancel" on:click={toggleExtra}>Cancel</button>
            </Menu>
            <Menu bind:open={videoOpen} left="8px" bottom="48px" width="calc(100% - 64px)">
                <div class="discussion-extra-title">Add Youtube video URL</div>
                <input class="discussion-extra-input-field" type="text" placeholder="Type a Youtube video URL..." maxlength={MessageConstants.URL_MAX_LENGTH} bind:value={extraVideoUrl} />
                <button class="discussion-extra-action" on:click={addVideo}>Add</button>
                <button class="discussion-extra-cancel" on:click={toggleExtra}>Cancel</button>
            </Menu>
            <Menu bind:open={pollOpen} left="8px" bottom="48px" width="calc(100% - 64px)">
                <div class="discussion-extra-title">Add poll</div>
                <div class="discussion-extra-subtitle">Poll question</div>
                <input class="discussion-extra-input-field" type="text" placeholder="Type a poll question..." maxlength={MessageConstants.POLL_QUESTION_MAX_LENGTH} bind:value={extraPollQuestion} />
                <div class="discussion-poll-options-container">
                    <div class="discussion-extra-subtitle">Poll options</div>
                    {#each extraPollOptions as option, i}
                        <div class="discussion-poll-option-container" transition:slide={{duration: TransitionConstants.DURATION}}>
                            <span class="material-symbols-rounded">check_circle</span>
                            <input class="discussion-poll-option-field" type="text" placeholder={`Option ${i + 1}`} maxlength={MessageConstants.POLL_OPTION_MAX_LENGTH} bind:value={extraPollOptions[i]} />
                            {#if extraPollOptions.length > 2}
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <!-- svelte-ignore a11y-no-static-element-interactions -->
                                <span class="discussion-extra-preview-cancel material-symbols-rounded" on:click={() => removePollOption(i)}>close</span>
                            {/if}
                        </div>
                    {/each}
                    {#if extraPollOptions.length < MessageConstants.POLL_MAX_OPTIONS}
                        <button class="discussion-extra-poll-add-option" on:click={addPollOption}>Add option</button>
                    {/if}
                </div>
                <div class="discussion-extra-subtitle">Poll settings</div>
                <div class="discussion-extra-poll-duration-label">Poll duration</div>
                <Dropdown label="Poll duration" items={MessageConstants.POLL_DURATIONS} defaultItem="" bind:selectedItem={extraPollDuration} bind:selectedItemIdx={extraPollDurationIdx} bind:open={extraPollDurationOpen} small={true} maxHeight="100px" />
                <div class="discussion-extra-poll-multiple-container">
                    <input class="discussion-extra-poll-multiple-checkbox" type="checkbox" bind:checked={extraPollMultiple} />
                    <div class="discussion-extra-poll-multiple-label">Allow multiple votes</div>
                </div>
                <button class="discussion-extra-action" on:click={addPoll}>Add</button>
                <button class="discussion-extra-cancel" on:click={toggleExtra}>Cancel</button>
            </Menu>
            <input type="text" class="discussion-input-field" placeholder="Type a message..." maxlength={MessageConstants.MESSAGE_MAX_LENGTH} bind:value={messageText} on:focusin={() => messageFocused = true} on:focusout={() => messageFocused = false} bind:this={messageInput} />
            <div class="discussion-input-field-progress-line-container">
                <ProgressLine percentage={messagePercentage} autoFill={true} autofillTime={MessageConstants.MESSAGE_TIMEOUT} />
            </div>
            <div class="discussion-input-icon-progress-circle-container">
                <ProgressCircle radius={12} bind:percentage={messagePercentage} autoFill={true} autofillTime={MessageConstants.MESSAGE_TIMEOUT} />
            </div>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <span class="discussion-input-icon-button material-symbols-rounded" on:click={sendMessage}>send</span>
        </div>
    </div>
{/if}
<Snackbar type={snackbarType} bind:open={snackbarOpen}>{snackbarText}</Snackbar>