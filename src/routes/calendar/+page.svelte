<svelte:head>
    <title>Buzby | Calendar</title>
</svelte:head>
<script lang="ts">
	import { MemberOccasion } from '$lib/elements/classes/data/time/MemberOccasion';
	import Avatar from '$lib/elements/ui/general/avatar.svelte';
	import { MathHelper } from '$lib/elements/helpers/MathHelper';
	import Menu from '$lib/elements/ui/general/menu.svelte';
	import { StringHelper } from '$lib/elements/helpers/StringHelper';
	import CalendarDay from '$lib/elements/ui/calendar/calendar-day.svelte';
	import { CalendarConstants } from '$lib/elements/classes/ui/calendar/CalendarConstants';
	import Snackbar from '$lib/elements/ui/general/snackbar.svelte';
	import type { Project } from "$lib/elements/classes/data/project/Project";
	import { Occasion } from "$lib/elements/classes/data/time/Occasion";
	import { TimeTick } from "$lib/elements/classes/ui/gantt/TimeTick";
	import { ObjectHelper } from "$lib/elements/helpers/ObjectHelper";
	import { onDestroy, onMount } from "svelte";
	import { fade, slide, scale } from 'svelte/transition';
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import { currentMember, projectSelected } from '$lib/elements/stores/project-store';
	import { OccasionConstants } from '$lib/elements/classes/data/time/OccasionConstants';
	import { ProjectConstants } from '$lib/elements/classes/data/project/ProjectConstants';
	import Tooltip from '$lib/elements/ui/general/tooltip.svelte';
	import { deleteDoc, serverTimestamp, setDoc, type DocumentData, type DocumentReference } from 'firebase/firestore';
	import { getFirestoreDoc } from '$lib/elements/firebase/firebase';
	import type { Member } from '$lib/elements/classes/data/project/Member';

    let currMember: Member = null;
    let project: Project = null;
    let occasions: Occasion[] = [];

    let snackbarOpen: boolean = false;
    let snackbarText: string = "";
    let snackbarType: string = "neutral";
    
    let startTimeRange: Date = new Date();
    let currentOffset: number = 0;
    let currentInterval: any = null;
    let currentTime: Date = new Date();
    
    let days: Date[] = [];
    let times: Date[] = [];

    let contentContainer: HTMLDivElement = null;

    let createOpen: boolean = false;
    
    let temporaryOccasion: Occasion = null;
    let occasionAssignedChecked: boolean[] = [];
    let occasionStartTimeInput: HTMLInputElement = null;
    let occasionEndTimeInput: HTMLInputElement = null;

    let openingDetails: boolean = false;
    let detailsOpen: boolean = false;
    let detailsOccasion: Occasion = null;
    let assignedDetails: Member[] = [];
    
    let editOpen: boolean = false;
    let deleteOpen: boolean = false;

    let occasionEdit: Occasion = null;
    let occasionEditName: string = "";
    let occasionEditDescription: string = "";
    let occasionEditColor: string = "";
    let occasionEditStartTimeInput: HTMLInputElement = null;
    let occasionEditEndTimeInput: HTMLInputElement = null;
    let occasionEditAssignedChecked: boolean[] = [];

    function setDateRange(): void {
        let centerDate: Date = ObjectHelper.addDateType(new Date(), TimeTick.WEEK, currentOffset);
        startTimeRange = ObjectHelper.getFloorDate(centerDate, TimeTick.WEEK);

        setDays();
        setTimes();
        setTimeout(scrollToCurrentTime);
    }

    function setDays(): void {
        days = [];
        for (let i = 0; i < CalendarConstants.DAYS_PER_WEEK; i++) {
            days.push(ObjectHelper.addDateType(startTimeRange, TimeTick.DAY, i));
        }
    }

    function setTimes(): void {
        times = [];
        for (let i = 0; i < CalendarConstants.HOURS_PER_DAY + 1; i++) {
            times.push(ObjectHelper.addDateType(startTimeRange, TimeTick.HOUR, i));
        }
    }

    function scrollToCurrentTime(): void {
        if (contentContainer != null && ObjectHelper.isSameDate(startTimeRange, currentTime, TimeTick.WEEK)) {
            let scrollAmount: number = CalendarConstants.PIXEL_OFFSET + ObjectHelper.getTimeHours(currentTime) * CalendarConstants.PIXELS_PER_HOUR - contentContainer.clientHeight / 2;
            contentContainer.scrollTo({ top: scrollAmount, behavior: 'smooth' });
        }
    }

    function getCurrMember(): void {
        currentMember.subscribe((value) => {
            currMember = value;
            if (currMember != null) {
                projectSelected.subscribe((value) => {
                    project = currMember.projects.find((p) => p.id == value);
                    if (project) {
                        occasions = project.occasions;
                    }
                });
            }
        });
    }

    function shiftLeft(): void {
        currentOffset--;
        setDateRange();
    }

    function shiftRight(): void {
        currentOffset++;
        setDateRange();
    }

    function jumpToToday(): void {
        currentOffset = 0;
        setDateRange();
    }

    function openCreate(event: MouseEvent): void {
        if (!openingDetails) {
            let dateClicked: Date = ObjectHelper.addDateType(startTimeRange, TimeTick.DAY, Math.max(0, Math.floor((event.clientX - contentContainer.getBoundingClientRect().left - 64) / ((contentContainer.clientWidth - 64) / CalendarConstants.DAYS_PER_WEEK))));
            let floorDate: Date = ObjectHelper.getFloorDate(dateClicked, TimeTick.DAY);
            let timeClicked: Date = ObjectHelper.addDateType(floorDate, TimeTick.MINUTE, MathHelper.clamp(Math.floor((event.clientY - contentContainer.getBoundingClientRect().top + contentContainer.scrollTop - 2 * CalendarConstants.PIXEL_OFFSET) / CalendarConstants.PIXELS_PER_HOUR * CalendarConstants.MINUTES_PER_HOUR), 0, CalendarConstants.HOURS_PER_DAY * CalendarConstants.MINUTES_PER_HOUR - OccasionConstants.OCCASION_MIN_DURATION));
            let nearestTime: Date = ObjectHelper.getNearestTime(timeClicked, OccasionConstants.OCCASION_MINUTE_ROUNDING);
            let duration = OccasionConstants.OCCASION_DEFAULT_DURATION;
            let endOfDay = ObjectHelper.addDateType(floorDate, TimeTick.DAY, 1);
            if (ObjectHelper.addDateType(nearestTime, TimeTick.MINUTE, duration) > endOfDay) {
                duration = ObjectHelper.getTimeDifference(endOfDay, nearestTime, TimeTick.MINUTE);
            }
            closeDetails();
            cancelCreate();
            temporaryOccasion = new Occasion({
                startTime: nearestTime,
                endTime: ObjectHelper.addDateType(nearestTime, TimeTick.MINUTE, duration),
            });
            
            createOpen = true;

            setTimeout(() => {
                occasionStartTimeInput.valueAsNumber = ObjectHelper.getDateInputValue(temporaryOccasion.startTime);
                occasionEndTimeInput.valueAsNumber = ObjectHelper.getDateInputValue(temporaryOccasion.endTime);
            });
        }
    }

    function isOccasionOverlapping(occasion: Occasion): boolean {
        for (let i = 0; i < occasions.length; i++) {
            if (occasion.id != occasions[i].id && ObjectHelper.isOverlapping(occasion.startTime, occasion.endTime, occasions[i].startTime, occasions[i].endTime)) {
                return true;
            }
        }
        return false;
    }

    function cancelCreate(): void {
        createOpen = false;
        temporaryOccasion = null;
        occasionAssignedChecked = [];
    }

    function addOccasion(): void {
        if (project.occasions.length >= ProjectConstants.MAX_NUM_OCCASIONS) {
            openSnackbar(`You can only make a maximum of ${ProjectConstants.MAX_NUM_OCCASIONS} occasions.`, "error");
            return;
        }

        if (occasionStartTimeInput && occasionEndTimeInput) {
            if (temporaryOccasion.name.trim().length == 0) {
                openSnackbar("Please enter an occasion name.", "error");
                return;
            }

            if (temporaryOccasion.name.trim().length > OccasionConstants.OCCASION_NAME_MAX_LENGTH) {
                openSnackbar(`Occasion name is too long. Max length is ${OccasionConstants.OCCASION_NAME_MAX_LENGTH} characters.`, "error");
                return;
            }

            if (temporaryOccasion.description.trim().length == 0) {
                openSnackbar("Please enter an occasion description.", "error");
                return;
            }

            if (temporaryOccasion.description.trim().length > OccasionConstants.OCCASION_DESCRIPTION_MAX_LENGTH) {
                openSnackbar(`Occasion description is too long. Max length is ${OccasionConstants.OCCASION_DESCRIPTION_MAX_LENGTH} characters.`, "error");
                return;
            }
            
            let startTime: Date = ObjectHelper.getDateFromInputValue(occasionStartTimeInput.valueAsNumber);
            let endTime: Date = ObjectHelper.getDateFromInputValue(occasionEndTimeInput.valueAsNumber);

            let startNumber: number = startTime.getTime();
            let endNumber: number = endTime.getTime();
            
            if (isNaN(startNumber)) {
                openSnackbar("Please enter a start time.", "error");
                return;
            }

            if (isNaN(endNumber)) {
                openSnackbar("Please enter an end time.", "error");
                return;
            }

            if (endNumber < startNumber) {
                openSnackbar("End time must be after start time.", "error");
                return;
            }

            if (ObjectHelper.getTimeDifference(endTime, startTime, TimeTick.MINUTE) < OccasionConstants.OCCASION_ABSOLUTE_MIN_DURATION) {
                openSnackbar(`Occasion must be at least ${OccasionConstants.OCCASION_ABSOLUTE_MIN_DURATION} minute${OccasionConstants.OCCASION_ABSOLUTE_MIN_DURATION == 1 ? '' : 's'} long.`, "error");
                return;
            }

            let endOfDay: Date = ObjectHelper.addDateType(startTime, TimeTick.DAY, 1);
            if (endTime > endOfDay) {
                endTime = endOfDay;
            }

            let assignedIds: string[] = [];
            for (let i = 0; i < occasionAssignedChecked.length; i++) {
                if (occasionAssignedChecked[i]) {
                    assignedIds.push(project.joinedMembers[i].id);
                }
            }

            if (assignedIds.length == 0) {
                openSnackbar("Please assign at least one member to the occasion.", "error");
                return;
            }

            let newOccasion: Occasion = new Occasion({
                id: StringHelper.generateID(),
                projectId: project.id,
                name: temporaryOccasion.name.trim(),
                description: temporaryOccasion.description.trim(),
                color: temporaryOccasion.color,
                startTime: startTime,
                endTime: endTime,
            });

            if (isOccasionOverlapping(newOccasion)) {
                openSnackbar("You cannot create overlapping occasions.", "error");
                return;
            }

            let occasionDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("occasions", newOccasion.id);
            setDoc(occasionDoc, newOccasion.compactify()).then(() => {
                for (let assignedId of assignedIds) {
                    let memberOccasion: MemberOccasion = new MemberOccasion({
                        id: StringHelper.generateID(),
                        occasionId: newOccasion.id,
                        memberId: assignedId,
                        createdAtTemp: serverTimestamp()
                    });
                    let memberOccasionDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("memberOccasions", memberOccasion.id);
                    setDoc(memberOccasionDoc, memberOccasion.compactify()).then(() => {
                        
                    }).catch((error) => {
                        openSnackbar("An error occurred while adding occasion. Please try again.", "error");
                    });
                }

                openSnackbar("Occasion added successfully.", "success");
                cancelCreate();
            }).catch((error) => {
                openSnackbar("An error occurred while adding occasion. Please try again.", "error");
            });
        }
    }

    function toggleDetails(event: CustomEvent, forceOpen: boolean = false): void {
        hideExtras();

        if (detailsOccasion != null && detailsOccasion.id == event.detail.occasion.id) {
            detailsOpen = !detailsOpen;
        } else {
            detailsOccasion = event.detail.occasion;
            detailsOpen = true;
        }

        if (forceOpen) {
            detailsOpen = true;
        }

        openingDetails = true;
        cancelCreate();

        setTimeout(() => {
            openingDetails = false;
        });
    }

    function closeDetails(): void {
        detailsOpen = false;
        detailsOccasion = null;
        hideExtras();
    }

    function editOccasion(): void {
        editOpen = !editOpen;
        deleteOpen = false;

        if (editOpen) {
            occasionEdit = detailsOccasion;
            occasionEditName = detailsOccasion.name;
            occasionEditDescription = detailsOccasion.description;
            occasionEditColor = detailsOccasion.color;
            occasionEditAssignedChecked = [];
            for (let member of project.joinedMembers) {
                let hasMember: boolean = false;
                for (let memberOccasion of occasionEdit.memberOccasions) {
                    if (memberOccasion.memberId == member.id) {
                        hasMember = true;
                        break;
                    }
                }
                occasionEditAssignedChecked = [...occasionEditAssignedChecked, hasMember];
            }
            setTimeout(() => {
                occasionEditStartTimeInput.valueAsNumber = ObjectHelper.getDateInputValue(detailsOccasion.startTime);
                occasionEditEndTimeInput.valueAsNumber = ObjectHelper.getDateInputValue(detailsOccasion.endTime);
            }, 0);
        }
        else {
            hideExtras();
        }
    }

    function deleteOccasion(): void {
        deleteOpen = !deleteOpen;
        editOpen = false;
    }

    function hideExtras(): void {
        editOpen = false;
        deleteOpen = false;

        occasionEdit = null;
        occasionEditName = "";
        occasionEditDescription = "";
        occasionEditColor = "";
        occasionEditAssignedChecked = [];
    }

    function editOccasionConfirmed(): void {
        if (occasionEditStartTimeInput && occasionEditEndTimeInput) {
            if (occasionEditName.trim().length == 0) {
                openSnackbar("Please enter an occasion name.", "error");
                return;
            }

            if (occasionEditName.trim().length > OccasionConstants.OCCASION_NAME_MAX_LENGTH) {
                openSnackbar(`Occasion name is too long. Max length is ${OccasionConstants.OCCASION_NAME_MAX_LENGTH} characters.`, "error");
                return;
            }

            if (occasionEditDescription.trim().length == 0) {
                openSnackbar("Please enter an occasion description.", "error");
                return;
            }

            if (occasionEditDescription.trim().length > OccasionConstants.OCCASION_DESCRIPTION_MAX_LENGTH) {
                openSnackbar(`Occasion description is too long. Max length is ${OccasionConstants.OCCASION_DESCRIPTION_MAX_LENGTH} characters.`, "error");
                return;
            }
            
            let startTime: Date = ObjectHelper.getDateFromInputValue(occasionEditStartTimeInput.valueAsNumber);
            let endTime: Date = ObjectHelper.getDateFromInputValue(occasionEditEndTimeInput.valueAsNumber);

            let startNumber: number = startTime.getTime();
            let endNumber: number = endTime.getTime();
            
            if (isNaN(startNumber)) {
                openSnackbar("Please enter a start time.", "error");
                return;
            }

            if (isNaN(endNumber)) {
                openSnackbar("Please enter an end time.", "error");
                return;
            }

            if (endNumber < startNumber) {
                openSnackbar("End time must be after start time.", "error");
                return;
            }

            if (ObjectHelper.getTimeDifference(endTime, startTime, TimeTick.MINUTE) < OccasionConstants.OCCASION_ABSOLUTE_MIN_DURATION) {
                openSnackbar(`Occasion must be at least ${OccasionConstants.OCCASION_ABSOLUTE_MIN_DURATION} minute${OccasionConstants.OCCASION_ABSOLUTE_MIN_DURATION == 1 ? '' : 's'} long.`, "error");
                return;
            }

            let endOfDay: Date = ObjectHelper.addDateType(startTime, TimeTick.DAY, 1);
            if (endTime > endOfDay) {
                endTime = endOfDay;
            }

            let prevAssignedIds: string[] = [];
            for (let i = 0; i < occasionEdit.memberOccasions.length; i++) {
                if (occasionEdit.memberOccasions[i].occasionId == occasionEdit.id) {
                    prevAssignedIds.push(occasionEdit.memberOccasions[i].memberId);
                }
            }

            let assignedIds: string[] = [];
            for (let i = 0; i < occasionEditAssignedChecked.length; i++) {
                if (occasionEditAssignedChecked[i]) {
                    assignedIds.push(project.joinedMembers[i].id);
                }
            }

            let membersToAdd: string[] = assignedIds.filter((id) => {
                return !prevAssignedIds.includes(id);
            });
            let membersToRemove: string[] = prevAssignedIds.filter((id) => {
                return !assignedIds.includes(id);
            });

            let memberOccasionsToRemove: MemberOccasion[] = occasionEdit.memberOccasions.filter((mo) => {
                return mo.occasionId == occasionEdit.id && membersToRemove.includes(mo.memberId);
            });

            if (assignedIds.length == 0) {
                openSnackbar("Please assign at least one member to the occasion.", "error");
                return;
            }

            let occasion: Occasion = new Occasion({
                id: detailsOccasion.id,
                projectId: project.id,
                name: occasionEditName.trim(),
                description: occasionEditDescription.trim(),
                color: occasionEditColor,
                startTime: startTime,
                endTime: endTime,
            });

            if (isOccasionOverlapping(occasion)) {
                openSnackbar("You cannot create overlapping occasions.", "error");
                return;
            }

            let occasionDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("occasions", occasion.id);
            setDoc(occasionDoc, occasion.compactify()).then(() => {
                for (let i = 0; i < membersToAdd.length; i++) {
                    let memberOccasion: MemberOccasion = new MemberOccasion({
                        id: StringHelper.generateID(),
                        memberId: membersToAdd[i],
                        occasionId: occasion.id,
                        createdAtTemp: serverTimestamp(),
                    });
                    let memberOccasionDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("memberOccasions", memberOccasion.id);
                    setDoc(memberOccasionDoc, memberOccasion.compactify()).then(() => {
                    }).catch((error) => {
                        openSnackbar("An error occurred while assigning member to occasion. Please try again.", "error");
                    });
                }

                for (let i = 0; i < memberOccasionsToRemove.length; i++) {
                    let memberOccasionDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("memberOccasions", memberOccasionsToRemove[i].id);
                    deleteDoc(memberOccasionDoc).then(() => {
                    }).catch((error) => {
                        openSnackbar("An error occurred while unassigning member from occasion. Please try again.", "error");
                    });
                }

                closeDetails();
                openSnackbar("Occasion edited successfully.", "success");
                cancelCreate();
            }).catch((error) => {
                openSnackbar("An error occurred while editing occasion. Please try again.", "error");
            });
        }
    }

    function deleteOccasionConfirmed(): void {
        let occasionDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("occasions", detailsOccasion.id);
        deleteDoc(occasionDoc).then(() => {
            for (let memberOccasion of detailsOccasion.memberOccasions) {
                let memberOccasionDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("memberOccasions", memberOccasion.id);
                deleteDoc(memberOccasionDoc).then(() => {
                }).catch((error) => {
                    openSnackbar("An error occurred while deleting occasion. Please try again.", "error");
                });
            }
            closeDetails();
            openSnackbar("Occasion deleted successfully.", "success");
        }).catch((error) => {
            openSnackbar("An error occurred while deleting occasion. Please try again.", "error");
        });
    }

    function shift(event: CustomEvent): void {
        toggleDetails(event, true);
        editOccasion();


    }

    function resize(event: CustomEvent): void {
        toggleDetails(event, true);
        editOccasion();

        let occasion: Occasion = event.detail.occasion;
        let top: boolean = event.detail.top;
        let dragging: boolean = event.detail.dragging;
        let amount: number = event.detail.amount;

        let numMinutes: number = amount / CalendarConstants.PIXELS_PER_HOUR * CalendarConstants.MINUTES_PER_HOUR;
        let timeClicked: Date = ObjectHelper.addDateType((top ? occasion.startTime : occasion.endTime), TimeTick.MINUTE, Math.floor(numMinutes) % CalendarConstants.MINUTES_PER_HOUR);
        if (numMinutes > CalendarConstants.MINUTES_PER_HOUR) {
            timeClicked = ObjectHelper.addDateType(timeClicked, TimeTick.HOUR, Math.floor(numMinutes / CalendarConstants.MINUTES_PER_HOUR));
        }
        let timeClickedClamp: Date = new Date(timeClicked.getFullYear(), timeClicked.getMonth(), timeClicked.getDate(), timeClicked.getHours(), MathHelper.clamp(timeClicked.getMinutes(), 0, CalendarConstants.HOURS_PER_DAY * CalendarConstants.MINUTES_PER_HOUR));
        setTimeout(() => {
            if (top) {
                occasion.startTime = timeClickedClamp;
                occasionEditStartTimeInput.valueAsNumber = ObjectHelper.getDateInputValue(timeClickedClamp);
            } else {
                occasion.endTime = timeClickedClamp;
                occasionEditEndTimeInput.valueAsNumber = ObjectHelper.getDateInputValue(timeClickedClamp);
            }
        });
    }
    
    function setCurrentInterval(): void {
        currentInterval = setInterval(() => {
            currentTime = new Date();
        }, 1000);
    }

    function setListeners(): void {
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                cancelCreate();
            }
        });
    }

    function removeListeners(): void {
        window.removeEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                cancelCreate();
            }
        });
    }

    function openSnackbar(text: string, type: string): void {
        snackbarText = text;
        snackbarType = type;
        snackbarOpen = true;
    }

    onMount(() => {
        getCurrMember();
        setDateRange();
        setCurrentInterval();
        setListeners();
    });

    onDestroy(() => {
        clearInterval(currentInterval);
        removeListeners();
    });
</script>
<style>
    .calendar-title {
        position: absolute;
		padding: 8px;
        font-size: 16px;
        font-weight: 500;
        color: var(--grey-800);
		user-select: none;
		z-index: 100;
    }

    .calendar-header-container {
        position: absolute;
        width: 100%;
        height: 48px;
        top: 8px;
        padding-bottom: 8px;
        box-shadow: 0 8px 4px -4px rgba(0, 0, 0, 0.1);
        user-select: none;
    }

    .calendar-header-icon {
        position: absolute;
        bottom: 4px;
        font-size: 32px;
        color: var(--grey-800);

        cursor: pointer;
        user-select: none;

        z-index: 100;

        transition: color var(--transition-duration);

        &:hover {
            color: var(--primary-dark);
        }
    }

    .calendar-header-month {
        position: absolute;
        bottom: 0;
        left: 8px;
        font-size: 48px;
        font-weight: 500;
        color: var(--grey-300);
    }

    .calendar-header {
        position: absolute;
        width: calc(100% - 64px);
        margin-left: 64px;
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .calendar-header-day-container {
        width: calc(100% / 7);
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .calendar-header-day-date {
        font-size: 24px;
        font-weight: 500;
        z-index: 100;

        transition: color var(--transition-duration);
    }

    .calendar-header-day-name {
        font-size: 12px;
        margin-top: -8px;
        z-index: 100;

        transition: color var(--transition-duration);
    }

    .calendar-content-container {
        position: absolute;
        width: calc(100vw - 48px);
        height: calc(100vh - 104px);
        top: 64px;
        overflow-x: hidden;
        overflow-y: auto;
        user-select: none;
    }

    .calendar-content {
        position: relative;
        width: 100%;
        min-height: 100%;
    }
    
    .calendar-days-container {
        position: absolute;
        width: calc(100% - 64px);
        height: 100%;
        left: 64px;
        top: 0;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    .calendar-ticks-container {
        width: 100%;
        height: 100%;
        margin-left: 8px;
    }

    .calendar-tick-container {
        height: 24px;
        margin-top: 12px;
        margin-bottom: 20px;
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .calendar-tick-date {
        width: 48px;
        font-size: 10px;
        color: var(--grey-600);
    }

    .calendar-tick-line {
        width: 100%;
        height: 1px;
    }

    .calendar-create-title {
        font-size: 16px;
        font-weight: 500;
        color: var(--grey-800);
        margin-bottom: 8px;
    }

    .calendar-create-subtitle {
        font-size: 14px;
        color: var(--grey-800);
        margin-bottom: 4px;
    }

    .calendar-create-field {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
    }

    .calendar-create-input-field {
        box-sizing: border-box;
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

    .calendar-create-icon {
        margin-right: 4px;
        color: var(--grey-800); 
    }

    .calendar-create-color {
        box-sizing: border-box;
        width: 24px;
        height: 24px;
        margin-right: 4px;
        border: 3px solid transparent;
        border-radius: 16px;
        cursor: pointer;

        transition: border-color var(--transition-duration);
    }

    .calendar-create-members-container {
        margin-top: 8px;
        padding: 8px;
        border: 1px solid var(--grey-400);
        border-radius: 4px;
        margin-bottom: 8px;
    }

    .calendar-create-member-container {
        display: flex;
        align-items: center;
        margin-bottom: 4px;
    }

    .calendar-create-input-checkbox {
        margin-right: 4px;
        accent-color: var(--primary);
    }

    .calendar-create-member {
        font-size: 12px;
        color: var(--grey-800);
    }

    .calendar-create-date-container {
        margin-top: 8px;
        margin-bottom: 8px;
        padding: 8px;
        border: 1px solid var(--grey-400);
        border-radius: 4px;
    }

    .calendar-create-action {
        padding-left: 4px;
        padding-right: 4px;
        padding-top: 2px;
        padding-bottom: 2px;
        background-color: var(--accent);
        font-size: 12px;
        color: var(--grey-100);
        border: none;
        outline: none;
        border-radius: 4px;
        cursor: pointer;

        transition: background-color var(--transition-duration), color var(--transition-duration);

        &:hover {
            background-color: var(--primary);
            color: var(--grey-800);
        }
    }

    .calendar-create-remove {
        padding-top: 2px;
        padding-bottom: 2px;
        background-color: var(--error);
        font-size: 12px;
        color: var(--grey-100);
        border: none;
        outline: none;
        border-radius: 4px;
        cursor: pointer;

        transition: background-color var(--transition-duration);

        &:hover {
            background-color: var(--error-dark);
        }
    }

    .calendar-create-cancel {
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

    .calendar-create-is-sure {
        font-size: 12px;
        color: var(--grey-800);
    }

    .calendar-details-color-fill {
        width: 100%;
        height: 8px;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
    }

    .calendar-details-name {
        font-size: 18px;
        font-weight: 500;
        color: var(--grey-800);
    }

    .calendar-details-description {
        width: 100%;
        margin-bottom: 4px;
        font-size: 12px;
        color: var(--grey-600);
    }

    .calendar-details-date-container {
        display: flex;
        align-items: center;
        color: var(--grey-600);
        margin-bottom: 4px;
    }

    .calendar-details-date {
        font-size: 12px;
        margin-left: 4px;
    }

    .calendar-details-assigned-member-subtitle {
        font-size: 14px;
        font-weight: 500;
        color: var(--grey-800);
    }

    .calendar-details-assigned-member-container {
        display: flex;
        align-items: center;
        margin-right: 8px;
        margin-top: 8px;
    }

    .calendar-details-assigned-name {
        margin-left: 8px;
        font-size: 12px;
        color: var(--grey-800);
    }

    .calendar-details-action {
        margin-top: 8px;
        color: var(--grey-600);
        cursor: pointer;

        transition: color var(--transition-duration);

        &:hover {
            color: var(--grey-800);
        }
    }

    .calendar-details-remove {
        margin-top: 8px;
        color: var(--error);
        cursor: pointer;

        transition: color var(--transition-duration);

        &:hover {
            color: var(--error-dark);
        }
    }

    .calendar-details-close {
        position: absolute;
        left: 4px;
        top: 4px;
        background-color: var(--off-white);
        border-radius: 100%;
        font-size: 32px;
        color: var(--grey-600);
        cursor: pointer;
        z-index: 1001;

        transition: color var(--transition-duration);

        &:hover {
            color: var(--grey-800);
        }
    }
</style>
<div transition:fade={{duration: TransitionConstants.DURATION}}>
    <div class="calendar-title">Calendar</div>
    <div class="calendar-header-container">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="calendar-header-icon material-symbols-rounded" on:click={shiftLeft}>chevron_left</span>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="calendar-header-icon material-symbols-rounded" style="left: 24px;" on:click={shiftRight}>chevron_right</span>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="calendar-header-icon material-symbols-rounded" style="left: 48px;" on:click={jumpToToday}>left_click</span>
        <div class="calendar-header-month">{StringHelper.getMonth(startTimeRange)} {startTimeRange.getFullYear()}</div>
        <div class="calendar-header">
            {#each days as day}
                <div class="calendar-header-day-container">
                    <div class="calendar-header-day-date" style="color: {ObjectHelper.isSameDate(day, currentTime, TimeTick.DAY) ? 'var(--accent)' : 'var(--grey-600)'};">{day.getDate()}</div>
                    <div class="calendar-header-day-name" style="color: {ObjectHelper.isSameDate(day, currentTime, TimeTick.DAY) ? 'var(--accent-light)' : 'var(--grey-400)'};">{StringHelper.getDayOfWeek(day)}</div>
                </div>
            {/each}
        </div>
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="calendar-content-container" bind:this={contentContainer} on:click={openCreate}>
        <div class="calendar-content">
            <div class="calendar-ticks-container">
                {#each times as time}
                    <div class="calendar-tick-container">
                        <div class="calendar-tick-date">{StringHelper.getFormattedTime(time)}</div>
                        <div class="calendar-tick-line" style="background-color: {time.getHours() == 0 ? 'var(--grey-400)' : 'var(--grey-300)'}"></div>
                    </div>
                {/each}
            </div>
            <div class="calendar-days-container">
                {#each days as day}
                    <CalendarDay date={day} currentTime={currentTime} occasions={occasions} temporaryOccasion={temporaryOccasion} on:toggleDetails={toggleDetails} on:shift={shift} on:resize={resize} />
                {/each}
            </div>
        </div>
    </div>
    <Menu bind:open={createOpen} right="32px" top="16px" width="250px">
        <div class="calendar-create-title">Add occasion</div>
        <div class="calendar-create-subtitle">Occasion details</div>
        <div class="calendar-create-field">
            <span class="calendar-create-icon material-symbols-rounded">badge</span>
            <input class="calendar-create-input-field" type="text" placeholder="Occasion name" maxlength={OccasionConstants.OCCASION_NAME_MAX_LENGTH} bind:value={temporaryOccasion.name} />
        </div>
        <div class="calendar-create-field">
            <span class="calendar-create-icon material-symbols-rounded">description</span>
            <input class="calendar-create-input-field" type="text" placeholder="Occasion description" maxlength={OccasionConstants.OCCASION_DESCRIPTION_MAX_LENGTH} bind:value={temporaryOccasion.description} />
        </div>
        <div class="calendar-create-field">
            <span class="calendar-create-icon material-symbols-rounded">colors</span>
            {#each ProjectConstants.COLORS as color}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div class="calendar-create-color" style="background-color: {color.hex}; {temporaryOccasion.color == color.hex ? 'border-color: var(--grey-800);' : ''}" on:click={() => temporaryOccasion.color = color.hex}>
                    <Tooltip>{color.displayName}</Tooltip>
                </div>
            {/each}
        </div>
        <div class="calendar-create-members-container">
            <div class="calendar-create-subtitle">Assign members</div>
            {#each project.joinedMembers as member, i}
                <div class="calendar-create-member-container">
                    <input class="calendar-create-input-checkbox" type="checkbox" bind:checked={occasionAssignedChecked[i]} />
                    <span class="calendar-create-member">{member.displayName}</span>
                </div>
            {/each}
        </div>
        <div class="calendar-create-date-container">
            <div class="calendar-create-subtitle">Start time</div>
            <div class="calendar-create-field">
                <span class="calendar-create-icon material-symbols-rounded">today</span>
                <input class="calendar-create-input-field" type="datetime-local" bind:this={occasionStartTimeInput} />
            </div>
            <div class="calendar-create-subtitle">End time</div>
            <div class="calendar-create-field">
                <span class="calendar-create-icon material-symbols-rounded">event</span>
                <input class="calendar-create-input-field" type="datetime-local" bind:this={occasionEndTimeInput} />
            </div>
        </div>
        <button class="calendar-create-action" on:click={addOccasion}>Add occasion</button>
        <button class="calendar-create-cancel" on:click={cancelCreate}>Cancel</button>
    </Menu>
    {#if detailsOpen}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="calendar-details-close material-symbols-rounded" on:click={closeDetails} transition:scale={{duration: TransitionConstants.DURATION}}>cancel</span>
    {/if}
    <Menu bind:open={detailsOpen} left="16px" top="16px" width="250px">
        <div class="calendar-details-color-fill" style="background-color: {detailsOccasion.color}"></div>
        <div class="calendar-details-name">{detailsOccasion.name}</div>
        <div class="calendar-details-description">{detailsOccasion.description}</div>
        <div class="calendar-details-date-container">
            <span class="material-symbols-rounded">today</span>
            <div class="calendar-details-date"><b>Start:</b> {StringHelper.getFormattedDate(detailsOccasion.startTime)}</div>
        </div>
        <div class="calendar-details-date-container">
            <span class="material-symbols-rounded">event</span>
            <div class="calendar-details-date"><b>End:</b> {StringHelper.getFormattedDate(detailsOccasion.endTime)}</div>
        </div>
        <div class="calendar-details-assigned-member-subtitle">Assigned Members</div>
        {#each assignedDetails as member}
            {#if member != null}
                <div class="calendar-details-assigned-member-container">
                    <Avatar member={member} size="24px" />
                    <div class="calendar-details-assigned-name" style={currMember && member.id == currMember.id ? "font-weight: 600" : ""}>{member.displayName}</div>
                </div>
            {/if}
        {/each}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="calendar-details-action material-symbols-rounded" style={editOpen ? 'color: var(--grey-800);' : ''} on:click={editOccasion}>edit</span>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="calendar-details-remove material-symbols-rounded" style={deleteOpen ? 'color: var(--error-dark);' : ''} on:click={deleteOccasion}>delete</span>
        {#if editOpen}
            <div transition:slide={{duration: TransitionConstants.DURATION}}>
                <div class="calendar-create-field">
                    <span class="calendar-create-icon material-symbols-rounded">badge</span>
                    <input class="calendar-create-input-field" type="text" placeholder="Project name" maxlength={OccasionConstants.OCCASION_NAME_MAX_LENGTH} bind:value={occasionEditName} />
                </div>
                <div class="calendar-create-field">
                    <span class="calendar-create-icon material-symbols-rounded">description</span>
                    <input class="calendar-create-input-field" type="text" placeholder="Project description" maxlength={OccasionConstants.OCCASION_DESCRIPTION_MAX_LENGTH} bind:value={occasionEditDescription} />
                </div>
                <div class="calendar-create-field">
                    <span class="calendar-create-icon material-symbols-rounded">colors</span>
                    {#each ProjectConstants.COLORS as color}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div class="calendar-create-color" style="background-color: {color.hex}; {occasionEditColor == color.hex ? 'border-color: var(--grey-800);' : ''}" on:click={() => occasionEditColor = color.hex}>
                            <Tooltip>{color.displayName}</Tooltip>
                        </div>
                    {/each}
                </div>
                <div class="calendar-create-members-container">
                    <div class="calendar-create-subtitle">Assign members</div>
                    {#each project.members as member, i}
                        <div class="calendar-create-member-container">
                            <input class="calendar-create-input-checkbox" type="checkbox" bind:checked={occasionEditAssignedChecked[i]} />
                            <span class="calendar-create-member">{member.displayName}</span>
                        </div>
                    {/each}
                </div>
                <div class="calendar-create-date-container">
                    <div class="calendar-create-subtitle">Start time</div>
                    <div class="calendar-create-field">
                        <span class="calendar-create-icon material-symbols-rounded">today</span>
                        <input class="calendar-create-input-field" type="datetime-local" bind:this={occasionEditStartTimeInput} />
                    </div>
                    <div class="calendar-create-subtitle">End time</div>
                    <div class="calendar-create-field">
                        <span class="calendar-create-icon material-symbols-rounded">event</span>
                        <input class="calendar-create-input-field" type="datetime-local" bind:this={occasionEditEndTimeInput} />
                    </div>
                </div>
                <button class="calendar-create-action" on:click={editOccasionConfirmed}>Save</button>
                <button class="calendar-create-cancel" on:click={hideExtras}>Cancel</button>
            </div>
        {/if}
        {#if deleteOpen}
            <div transition:slide={{duration: TransitionConstants.DURATION}}>
                <div class="calendar-create-field">
                    <div class="calendar-create-is-sure">Are you sure you want to delete this occasion?</div>
                </div>
                <button class="calendar-create-remove" on:click={deleteOccasionConfirmed}>Delete</button>
                <button class="calendar-create-cancel" on:click={hideExtras}>Cancel</button>
            </div>
        {/if}
    </Menu>
</div>
<Snackbar type={snackbarType} bind:open={snackbarOpen}>{snackbarText}</Snackbar>