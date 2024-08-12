<script lang="ts">
	import { StringHelper } from '$lib/elements/helpers/StringHelper';
	import { Member } from '$lib/elements/classes/data/project/Member';
	import Snackbar from './../general/snackbar.svelte';
	import { Project } from '$lib/elements/classes/data/project/Project';
	import Avatar from './../general/avatar.svelte';
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import { Task } from "$lib/elements/classes/data/time/Task";
	import { onDestroy, onMount } from "svelte";
	import { fade, scale, slide } from "svelte/transition";
	import { currentMember, projectSelected } from '$lib/elements/stores/project-store';
	import { TaskConstants } from '$lib/elements/classes/data/time/TaskConstants.js';
	import { getFirestoreDoc } from '$lib/elements/firebase/firebase';
	import { DocumentReference, type DocumentData, setDoc, deleteDoc } from 'firebase/firestore';
	import { HiveConstants } from '$lib/elements/classes/ui/hive/HiveConstants';
	import { ObjectHelper } from '$lib/elements/helpers/ObjectHelper';
	import { MemberTask } from '$lib/elements/classes/data/time/MemberTask';

    export let task: Task = null;
    export let project: Project = null;
    export let highlightedId: string = "";
    export let isHighlighted: boolean = false;

    let highlightTimeout: any = null;

    $: isHighlighted && highlightedId == task.id ? highlightTimeout = setTimeout(() => isHighlighted = false, HiveConstants.HONEYCOMB_HIGHLIGHT_DURATION) : clearTimeout(highlightTimeout);
    
    let existed: boolean = false;
    let isUrgent: boolean = false;

    let currMember: Member = null;
    let assigned: Member[] = [];

    let editOpen: boolean = false;
    let deleteOpen: boolean = false;
    let taskName: string = "";
    let taskDescription: string = "";
    let taskAssignedChecked: boolean[] = [];
    let taskStartDateInput: HTMLInputElement;
    let taskEndDateInput: HTMLInputElement;

    let snackbarOpen: boolean = false;
    let snackbarText: string = "";
    let snackbarType: string = "neutral";

    $: task ? setUrgent() : null;

    function getCurrMember(): void {
        currentMember.subscribe((value) => {
            currMember = value;
        });
    }

    function setUrgent(): void {
        if (task && task.percentage < 100) {
            let msRemaining: number = task.endDate.getTime() - new Date().getTime();
            if (task.percentage <= TaskConstants.TASK_URGENT_SMALL_THRESHOLD) {
                isUrgent = msRemaining < TaskConstants.TASK_URGENT_SMALL_PROGRESS_TIME;
            }
            else if (task.percentage >= TaskConstants.TASK_URGENT_BIG_THRESHOLD) {
                isUrgent = msRemaining < TaskConstants.TASK_URGENT_BIG_PROGRESS_TIME;
            }
            else {
                isUrgent = msRemaining < TaskConstants.TASK_URGENT_NORMAL_PROGRESS_TIME;
            }
        }
        else {
            isUrgent = false;
        }
    }

    function editTask(): void {
        editOpen = !editOpen;
        deleteOpen = false;

        if (editOpen) {
            taskName = task.name;
            taskDescription = task.description;
            taskAssignedChecked = [];
            for (let i = 0; i < project.members.length; i++) {
                let hasMember: boolean = false;
                for (let i = 0; i < task.memberTasks.length; i++) {
                    if (task.memberTasks[i].memberId == project.members[i].id) {
                        hasMember = true;
                        break;
                    }
                }
                taskAssignedChecked = [...taskAssignedChecked, hasMember];
            }
            setTimeout(() => {
                taskStartDateInput.valueAsNumber = ObjectHelper.getDateInputValue(task.startDate);
                taskEndDateInput.valueAsNumber = ObjectHelper.getDateInputValue(task.endDate);
            }, 0);
        }
        else {
            hideExtras();
        }
    }

    function taskHasMember(task: Task, member: Member): boolean {
        for (let i = 0; i < task.memberTasks.length; i++) {
            if (task.memberTasks[i].memberId == member.id) {
                return true;
            }
        }
        return false;
    }

    function deleteTask(): void {
        deleteOpen = !deleteOpen;
        editOpen = false;
    }

    function hideExtras(): void {
        editOpen = false;
        deleteOpen = false;

        taskName = "";
        taskDescription = "";
        taskAssignedChecked = [];
    }

    function editTaskConfirmed(): void {
        if (taskStartDateInput && taskEndDateInput) {
            if (taskName.trim().length == 0) {
                openSnackbar("Please enter a task name.", "error");
                return;
            }

            if (taskName.trim().length > TaskConstants.TASK_NAME_MAX_LENGTH) {
                openSnackbar(`Task name is too long. Max length is ${TaskConstants.TASK_NAME_MAX_LENGTH} characters.`, "error");
                return;
            }

            if (taskDescription.trim().length == 0) {
                openSnackbar("Please enter a task description.", "error");
                return;
            }

            if (taskDescription.trim().length > TaskConstants.TASK_DESCRIPTION_MAX_LENGTH) {
                openSnackbar(`Task description is too long. Max length is ${TaskConstants.TASK_DESCRIPTION_MAX_LENGTH} characters.`, "error");
                return;
            }

            let startDate: Date = new Date(taskStartDateInput.valueAsNumber);
            let endDate: Date = new Date(taskEndDateInput.valueAsNumber);

            let startNumber: number = ObjectHelper.getDateInputValue(startDate);
            let endNumber: number = ObjectHelper.getDateInputValue(endDate);
            
            if (isNaN(startNumber)) {
                openSnackbar("Please enter a start date.", "error");
                return;
            }

            if (isNaN(endNumber)) {
                openSnackbar("Please enter an end date.", "error");
                return;
            }

            if (endNumber < startNumber) {
                openSnackbar("End date must be after start date.", "error");
                return;
            }

            let prevAssignedIds: string[] = task.memberIds;

            let assignedIds: string[] = [];
            for (let i = 0; i < taskAssignedChecked.length; i++) {
                if (taskAssignedChecked[i]) {
                    assignedIds.push(project.members[i].id);
                }
            }

            let membersToAdd: string[] = assignedIds.filter((id) => {
                return !prevAssignedIds.includes(id);
            });
            let membersToRemove: string[] = prevAssignedIds.filter((id) => {
                return !assignedIds.includes(id);
            });

            let memberTasksToRemove: MemberTask[] = task.memberTasks.filter((mt) => {
                return mt.taskId == task.id && membersToRemove.includes(mt.memberId);
            });

            if (assignedIds.length == 0) {
                openSnackbar("Please assign at least one member to the task.", "error");
                return;
            }

            let newTask: Task = new Task({
                id: task.id,
                name: taskName.trim(),
                description: taskDescription.trim(),
                percentage: task.percentage,
                hiveX: task.hiveX,
                hiveY: task.hiveY,
                startDate: new Date(startNumber),
                endDate: new Date(endNumber),
            });

            let taskDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("tasks", newTask.id);
            setDoc(taskDoc, newTask.compactify()).then(() => {
                for (let i = 0; i < membersToAdd.length; i++) {
                    let memberTask: MemberTask = new MemberTask({
                        id: StringHelper.generateID(),
                        memberId: membersToAdd[i],
                        taskId: newTask.id,
                    });
                    let memberTaskDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("memberTasks", memberTask.id);
                    setDoc(memberTaskDoc, memberTask.compactify()).then(() => {
                    }).catch((error) => {
                        openSnackbar("An error occurred while assigning member to task. Please try again.", "error");
                    });
                }

                for (let i = 0; i < memberTasksToRemove.length; i++) {
                    let memberTaskDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("memberTasks", memberTasksToRemove[i].id);
                    deleteDoc(memberTaskDoc).then(() => {
                    }).catch((error) => {
                        openSnackbar("An error occurred while unassigning member from task. Please try again.", "error");
                    });
                }

                hideExtras();
                openSnackbar("Task edited successfully.", "success");
            }).catch((error) => {
                openSnackbar("An error occurred while editing task. Please try again.", "error");
            });
        }
    }

    function deleteTaskConfirmed(): void {
        project.taskIds = project.taskIds.filter((id) => {
            return id !== task.id;
        });
        project.tasks = project.tasks.filter((t) => {
            return t.id !== task.id;
        });
        let taskDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("tasks", task.id);
        deleteDoc(taskDoc).then(() => {
            openSnackbar("Task deleted successfully.", "success");
        }).catch((error) => {
            openSnackbar("An error occurred while deleting task. Please try again.", "error");
        });
    }

    function openSnackbar(text: string, type: string): void {
        snackbarText = text;
        snackbarType = type;
        snackbarOpen = true;
    }

    onMount(() => {
        existed = true;
        getCurrMember();
    });

    onDestroy(() => {
        existed = false;
        clearTimeout(highlightTimeout);
    });
</script>
<style>
    .hive-task-container {
        position: relative;
        box-sizing: border-box;
        width: 100%;
        padding: 16px;
        margin-bottom: 8px;
        border-radius: 8px;
        box-shadow: 2px 2px 8px var(--grey-400);
        overflow-wrap: anywhere;
        user-select: none;

        transition: box-shadow var(--transition-duration);

        &:hover {
            box-shadow: 2px 2px 16px var(--grey-400);
        }
    }

    .hive-task-container-urgent {
        position: relative;
        box-sizing: border-box;
        width: 100%;
        padding: 16px;
        margin-bottom: 8px;
        border-radius: 8px;
        box-shadow: 2px 2px 8px var(--primary-dark);
        overflow-wrap: anywhere;
        user-select: none;

        transition: box-shadow var(--transition-duration);

        &:hover {
            box-shadow: 2px 2px 16px var(--primary-dark);
        }
    }

    .hive-task-highlight-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(var(--primary-rgb), 0.1);
    }

    .hive-task-progress-container {
        display: flex;
        align-items: center;
    }

    .hive-task-progress-bar-container {
        width: 100%;
        height: 8px;
        border-radius: 4px;
        background: var(--grey-300);
    }

    .hive-task-progress-bar {
        height: 8px;
        border-radius: 4px;
        background: linear-gradient(to right, var(--primary-light), var(--primary), var(--primary-dark));

        transition: width var(--transition-duration);
    }

    .hive-task-progress {
        width: 52px;
        text-align: right;
        font-size: 14px;
        font-weight: 500;
        color: var(--grey-800);
    }

    .hive-task-name {
        font-size: 22px;
        font-weight: 500;
        color: var(--grey-800);
    }

    .hive-task-description {
        width: 100%;
        margin-bottom: 4px;
        font-size: 14px;
        color: var(--grey-600);
    }

    .hive-task-date-container {
        display: flex;
        align-items: center;
        color: var(--grey-600);
        margin-bottom: 4px;
    }

    .hive-task-date {
        font-size: 14px;
        margin-left: 4px;
    }

    .hive-task-assigned-member-subtitle {
        font-size: 16px;
        font-weight: 500;
        color: var(--grey-800);
    }

    .hive-task-assigned-member-container {
        display: flex;
        align-items: center;
        margin-right: 8px;
        margin-top: 8px;
    }

    .hive-task-assigned-name {
        margin-left: 8px;
        font-size: 14px;
        color: var(--grey-800);
    }

    .hive-task-action {
        margin-top: 8px;
        color: var(--grey-600);
        cursor: pointer;

        transition: color var(--transition-duration);

        &:hover {
            color: var(--grey-800);
        }
    }

    .hive-task-remove {
        margin-top: 8px;
        color: var(--error);
        cursor: pointer;

        transition: color var(--transition-duration);

        &:hover {
            color: var(--error-dark);
        }
    }

    .hive-task-field {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
    }

    .hive-task-input {
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

        transition: border-color var(--transition-duration);

        &:hover {
            border-color: var(--accent-light);
        }

        &:focus {
            border-color: var(--accent);
        }
    }

    .hive-task-icon {
        margin-right: 4px;
        color: var(--grey-800);
    }

    .hive-task-is-sure {
        font-size: 12px;
        color: var(--grey-800);
    }

    .hive-task-subtitle {
        font-size: 14px;
        color: var(--grey-800);
        margin-bottom: 4px;
    }

    .hive-task-members-container {
        margin-top: 8px;
        padding: 8px;
        border: 1px solid var(--grey-400);
        border-radius: 4px;
    }

    .hive-task-dates-container {
        margin-top: 8px;
        margin-bottom: 8px;
        padding: 8px;
        border: 1px solid var(--grey-400);
        border-radius: 4px;
    }

    .hive-task-member-container {
        display: flex;
        align-items: center;
        margin-bottom: 4px;
    }

    .hive-task-input-checkbox {
        margin-right: 4px;
        accent-color: var(--primary);
    }

    .hive-task-member {
        font-size: 12px;
        color: var(--grey-800);
    }

    .hive-task-confirm-action {
        padding-left: 4px;
        padding-right: 4px;
        padding-top: 2px;
        padding-bottom: 2px;
        background-color: var(--primary);
        font-size: 12px;
        color: var(--grey-800);
        border: none;
        outline: none;
        border-radius: 4px;
        cursor: pointer;

        transition: background-color var(--transition-duration), color var(--transition-duration);

        &:hover {
            background-color: var(--accent);
            color: var(--grey-100);
        }
    }
    
    .hive-task-confirm-remove {
        padding-left: 4px;
        padding-right: 4px;
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

    .hive-task-confirm-cancel {
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
</style>
{#if existed && task}
    <div id="task-{task.id}" class={isUrgent ? 'hive-task-container-urgent' : 'hive-task-container'} transition:scale={{opacity: TransitionConstants.OPACITY, start: TransitionConstants.START, duration: TransitionConstants.DURATION}}>
        {#if isHighlighted && highlightedId == task.id}
            <div class="hive-task-highlight-overlay" transition:fade={{duration: TransitionConstants.DURATION}}></div>
        {/if}
        <div class="hive-task-name">{task.name}</div>
        <div class="hive-task-description">{task.description}</div>
        <div class="hive-task-date-container">
            <span class="material-symbols-rounded">today</span>
            <div class="hive-task-date"><b>Start:</b> {StringHelper.getFormattedDate(task.startDate)}</div>
        </div>
        <div class="hive-task-date-container">
            <span class="material-symbols-rounded">event</span>
            <div class="hive-task-date"><b>End:</b> {StringHelper.getFormattedDate(task.endDate)}</div>
        </div>
        <div class="hive-task-progress-container">
            <div class="hive-task-progress-bar-container">
                <div class="hive-task-progress-bar" style="width: {task.percentage}%"></div>
            </div>
            <div class="hive-task-progress">{Math.round(task.percentage)}%</div>
        </div>
        <div class="hive-task-assigned-member-subtitle">Assigned Members</div>
        {#each assigned as member}
            {#if member != null}
                <div class="hive-task-assigned-member-container">
                    <Avatar member={member} size="28px" />
                    <div class="hive-task-assigned-name" style={currMember && member.id == currMember.id ? "font-weight: 600" : ""}>{member.displayName}</div>
                </div>
            {/if}
        {/each}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="hive-task-action material-symbols-rounded" style={editOpen ? 'color: var(--grey-800);' : ''} on:click={editTask}>edit</span>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="hive-task-remove material-symbols-rounded" style={deleteOpen ? 'color: var(--error-dark);' : ''} on:click={deleteTask}>delete</span>
        {#if editOpen}
            <div transition:slide={{duration: TransitionConstants.DURATION}}>
                <div class="hive-task-field">
                    <span class="hive-task-icon material-symbols-rounded">badge</span>
                    <input class="hive-task-input" type="text" placeholder="Project name" maxlength={TaskConstants.TASK_NAME_MAX_LENGTH} bind:value={taskName} />
                </div>
                <div class="hive-task-field">
                    <span class="hive-task-icon material-symbols-rounded">description</span>
                    <input class="hive-task-input" type="text" placeholder="Project description" maxlength={TaskConstants.TASK_DESCRIPTION_MAX_LENGTH} bind:value={taskDescription} />
                </div>
                <div class="hive-task-members-container">
                    <div class="hive-task-subtitle">Assign members</div>
                    {#each project.members as member, i}
                        <div class="hive-task-member-container">
                            <input class="hive-task-input-checkbox" type="checkbox" bind:checked={taskAssignedChecked[i]} />
                            <span class="hive-task-member">{member.displayName}</span>
                        </div>
                    {/each}
                </div>
                <div class="hive-task-dates-container">
                    <div class="hive-task-subtitle">Start date</div>
                    <div class="hive-task-field">
                        <span class="hive-task-icon material-symbols-rounded">today</span>
                        <input class="hive-task-input" type="datetime-local" bind:this={taskStartDateInput} />
                    </div>
                    <div class="hive-task-subtitle">End date</div>
                    <div class="hive-task-field">
                        <span class="hive-task-icon material-symbols-rounded">event</span>
                        <input class="hive-task-input" type="datetime-local" bind:this={taskEndDateInput} />
                    </div>
                </div>
                <button class="hive-task-confirm-action" on:click={editTaskConfirmed}>Save</button>
                <button class="hive-task-confirm-cancel" on:click={hideExtras}>Cancel</button>
            </div>
        {/if}
        {#if deleteOpen}
            <div transition:slide={{duration: TransitionConstants.DURATION}}>
                <div class="hive-task-field">
                    <div class="hive-task-is-sure">Are you sure you want to delete this task?</div>
                </div>
                <button class="hive-task-confirm-remove" on:click={deleteTaskConfirmed}>Delete</button>
                <button class="hive-task-confirm-cancel" on:click={hideExtras}>Cancel</button>
            </div>
        {/if}
    </div>
{/if}
<Snackbar type={snackbarType} bind:open={snackbarOpen}>{snackbarText}</Snackbar>