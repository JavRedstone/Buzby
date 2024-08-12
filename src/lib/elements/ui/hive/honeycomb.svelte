<script lang="ts">
	import { scale } from 'svelte/transition';
	import type { Project } from "$lib/elements/classes/data/project/Project";
	import { Task } from "$lib/elements/classes/data/time/Task";
	import { HiveConstants } from "$lib/elements/classes/ui/hive/HiveConstants";
	import { StringHelper } from "$lib/elements/helpers/StringHelper";
	import { getDoc, serverTimestamp, setDoc, type DocumentData, type DocumentReference } from "firebase/firestore";
	import Menu from "../general/menu.svelte";
	import { getFirestoreDoc } from "$lib/elements/firebase/firebase";
	import { currentMember, projectSelected } from "$lib/elements/stores/project-store";
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { ProjectConstants } from '$lib/elements/classes/data/project/ProjectConstants';
	import { TaskConstants } from '$lib/elements/classes/data/time/TaskConstants';
	import { ObjectHelper } from '$lib/elements/helpers/ObjectHelper';
	import { TimeTick } from '$lib/elements/classes/ui/gantt/TimeTick';
	import { MemberTask } from '$lib/elements/classes/data/time/MemberTask';

    export let task: Task = null;
    export let project: Project = null;
    export let openedMenuTask: Task = null;
    export let offsetX: number = 0;
    export let offsetY: number = 0;

    let existed: boolean = false;
    let isUrgent: boolean = false;

    let dispatch = createEventDispatcher();

    let taskMenuOpen: boolean = false;
    let taskName: string = "";
    let taskDescription: string = "";
    let taskMembersChecked: boolean[] = [];
    let taskStartDateInput: HTMLInputElement = null;
    let taskEndDateInput: HTMLInputElement = null;

    $: task ? setUrgent() : null;
    $: openedMenuTask ? setMenuStatus() : null;

    $: task ? setUrgent() : null;

    function setUrgent(): void {
        if (task && task.id.length > 0 && task.id != TaskConstants.TASK_CENTER_ID && task.percentage < 100) {
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

    function addFill(): void {
        if (task.percentage < 100) {
            task.percentage += HiveConstants.HONEYCOMB_FILL_INCREMENT;

            if (task.percentage > 100) {
                task.percentage = 100;
            }
            
            if (task.percentage == 100) {
                openSnackbar("Task completed!", "success");
            }

            let taskDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("tasks", task.id);
            setDoc(taskDoc, task.compactify()).then(() => {
                
            }).catch((error) => {
                openSnackbar("Error updating task. Please try again", "error");
            });
        }
    }

    function removeFill(): void {
        if (task.percentage > 0) {
            task.percentage -= HiveConstants.HONEYCOMB_FILL_INCREMENT;

            if (task.percentage < 0) {
                task.percentage = 0;
            }

            let taskDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("tasks", task.id);
            setDoc(taskDoc, task.compactify()).then(() => {
                
            }).catch((error) => {
                openSnackbar("Error updating task. Please try again", "error");
            });
        }
    }

    function toggleTaskMenu(): void {
        taskMenuOpen = !taskMenuOpen;
        if (taskMenuOpen) {
            dispatch("openTaskMenu", { task: task });

            if (project.taskIds.length >= ProjectConstants.MAX_NUM_TASKS) {
                openSnackbar(`You can only make a maximum of ${ProjectConstants.MAX_NUM_TASKS} tasks.`, "error");
                taskMenuOpen = false;
                return;
            }
            else {
                setTimeout(() => {
                    let startDate: Date = ObjectHelper.getDateFromStartofMinute(new Date());
                    let endDate: Date = ObjectHelper.addDateType(startDate, TimeTick.MINUTE, TaskConstants.TASK_DEFAULT_DURATION);
                    taskStartDateInput.valueAsNumber = ObjectHelper.getDateInputValue(startDate);
                    taskEndDateInput.valueAsNumber = ObjectHelper.getDateInputValue(endDate);
                }, 0);
            }
        } else {
            dispatch("closeTaskMenu", { task: task });
        }
        clearTaskMenu();
    }

    function setMenuStatus(): void {
        if (openedMenuTask.id != task.id) {
            taskMenuOpen = false;
        }
    }

    function clearTaskMenu(): void {
        taskName = "";
        taskDescription = "";
        taskMembersChecked = [];
        for (let i = 0; i < project.joinedMembers.length; i++) {
            taskMembersChecked.push(false);
        }
    }

    function addTask(): void {
        if (project.taskIds.length >= ProjectConstants.MAX_NUM_TASKS) {
            openSnackbar(`You can only make a maximum of ${ProjectConstants.MAX_NUM_TASKS} tasks.`, "error");
            return;
        }

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

            let startDate: Date = ObjectHelper.getDateFromInputValue(taskStartDateInput.valueAsNumber);
            let endDate: Date = ObjectHelper.getDateFromInputValue(taskEndDateInput.valueAsNumber);

            let startNumber: number = startDate.getTime();
            let endNumber: number = endDate.getTime();
            
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

            if (ObjectHelper.getTimeDifference(endDate, startDate, TimeTick.MINUTE) < TaskConstants.TASK_ABSOLUTE_MIN_DURATION) {
                openSnackbar(`Occasion must be at least ${TaskConstants.TASK_ABSOLUTE_MIN_DURATION} minute${TaskConstants.TASK_ABSOLUTE_MIN_DURATION == 1 ? '' : 's'} long.`, "error");
                return;
            }

            let assignedIds: string[] = [];
            for (let i = 0; i < taskMembersChecked.length; i++) {
                if (taskMembersChecked[i]) {
                    assignedIds.push(project.joinedMembers[i].id);
                }
            }

            if (assignedIds.length == 0) {
                openSnackbar("Please assign at least one member to the task.", "error");
                return;
            }

            let newTask: Task = new Task({
                id: StringHelper.generateID(),
                name: taskName.trim(),
                description: taskDescription.trim(),
                percentage: 0,
                hiveX: task.hiveX,
                hiveY: task.hiveY,
                startDate: startDate,
                endDate: endDate
            });

            let taskDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("tasks", newTask.id);
            setDoc(taskDoc, newTask.compactify()).then(() => {
                for (let assignedId of assignedIds) {
                    let memberTask: MemberTask = new MemberTask({
                        id: StringHelper.generateID(),
                        taskId: newTask.id,
                        memberId: assignedId,
                        createdAtTemp: serverTimestamp()
                    });
                    let memberTaskDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("memberTasks", memberTask.id);
                    setDoc(memberTaskDoc, memberTask.compactify()).then(() => {
                        
                    }).catch((error) => {
                        openSnackbar("An error occurred while adding task. Please try again.", "error");
                    });
                }

                openSnackbar("Task added successfully.", "success");
                toggleTaskMenu();
            }).catch((error) => {
                openSnackbar("An error occurred while adding task. Please try again.", "error");
            });
        }
    }

    function gotoTask(): void {
        dispatch("gotoTask", { task: task });
    }

    function openSnackbar(text: string, type: string): void {
        dispatch("snackbar", {text: text, type: type});
    }

    onMount(() => {
        existed = true;
        setUrgent();
    });

    onDestroy(() => {
        existed = false;
    });
</script>
<style>
    .honeycomb-hexagon-container-empty {
        position: absolute;
        background-color: var(--grey-300);
        color: var(--grey-300);
        cursor: pointer;
        user-select: none;

        transition: background-color var(--transition-duration), color var(--transition-duration);

        &:hover {
            background-color: var(--grey-500);
            color: var(--grey-500);
        }
    }

    .honeycomb-hexagon-empty {
        position: absolute;
        height: 95%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background-color: var(--off-white-light);
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }

    .honeycomb-hexagon-add {
        font-size: 32px;
    }

    .honeycomb-hexagon-container {
        position: absolute;
        background-color: var(--primary);
        user-select: none;
        cursor: pointer;

        transition: background-color var(--transition-duration);

        &:hover {
            background-color: var(--primary-dark);
        }
    }

    .honeycomb-hexagon-container-center {
        position: absolute;
        background-color: var(--accent);
        user-select: none;

        transition: background-color var(--transition-duration);    

        &:hover {
            background-color: var(--accent-dark);
        }
    }

    .honeycomb-hexagon {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(to bottom, var(--primary), var(--primary-dark));

        transition: width var(--transition-duration), height var(--transition-duration);
    }

    .honeycomb-hexagon-center {
        position: absolute;
        height: 95%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(to bottom, var(--accent), var(--accent-dark));
    }

    .honeycomb-hexagon-fill {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        background: linear-gradient(to bottom, var(--primary-darker), var(--primary-dark));

        transition: height var(--transition-duration);
    }

    .honeycomb-hexagon-fill-center {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        background: linear-gradient(to bottom, var(--accent-darker), var(--accent-dark));

        transition: height var(--transition-duration);
    }

    .honeycomb-hexagon-fill-percentage {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        color: var(--grey-100);
        font-size: 16px;
        user-select: none;
    }

    .honeycomb-hexagon-center-label {
        position: absolute;
        left: 50%;
        top: 5%;
        transform: translateX(-50%);
        color: var(--grey-100);
        font-size: 10px;
        font-weight: 500;
        user-select: none;
    }

    .honeycomb-hexagon-fill-no-task {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        color: var(--grey-100);
        font-size: 16px;
        line-height: 1;
        text-align: center;
        user-select: none;
    }

    .honeycomb-hexagon-add-fill {
        position: absolute;
        left: 50%;
        top: 5%;
        transform: translateX(-50%);
        color: var(--grey-100);
        font-size: 24px;
        cursor: pointer;

        transition: color var(--transition-duration);

        &:hover {
            color: var(--grey-300);
        }
    }

    .honeycomb-hexagon-remove-fill {
        position: absolute;
        left: 50%;
        bottom: 5%;
        transform: translateX(-50%);
        color: var(--grey-100);
        font-size: 24px;
        cursor: pointer;

        transition: color var(--transition-duration);

        &:hover {
            color: var(--grey-300);
        }
    }

    .honeycomb-title {
        font-size: 16px;
        font-weight: 500;
        color: var(--grey-800);
        margin-bottom: 8px;
    }

    .honeycomb-subtitle {
        font-size: 14px;
        color: var(--grey-800);
        margin-bottom: 4px;
    }

    .honeycomb-field {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
    }

    .honeycomb-input-field {
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

    .honeycomb-icon {
        margin-right: 4px;
        color: var(--grey-800); 
    }

    .honeycomb-members-container {
        margin-top: 8px;
        padding: 8px;
        border: 1px solid var(--grey-400);
        border-radius: 4px;
    }

    .honeycomb-member-container {
        display: flex;
        align-items: center;
        margin-bottom: 4px;
    }

    .honeycomb-input-checkbox {
        margin-right: 4px;
        accent-color: var(--primary);
    }

    .honeycomb-member {
        font-size: 12px;
        color: var(--grey-800);
    }

    .honeycomb-date-container {
        margin-top: 8px;
        margin-bottom: 8px;
        padding: 8px;
        border: 1px solid var(--grey-400);
        border-radius: 4px;
    }

    .honeycomb-action {
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

    .honeycomb-cancel {
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
{#if task != null}
    {#if task.id.endsWith(HiveConstants.HONEYCOMB_PLACEHOLDER_ID)}
        {#if existed}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="honeycomb-hexagon-container-empty hexagon" style="left: {task.hiveX + offsetX - HiveConstants.HONEYCOMB_WIDTH / 2}px; top: {task.hiveY + offsetY - HiveConstants.HONEYCOMB_HEIGHT / 2}px; width: {HiveConstants.HONEYCOMB_WIDTH}px; height: {HiveConstants.HONEYCOMB_HEIGHT}px; {taskMenuOpen ? 'background-color: var(--primary); color: var(--primary);' : ''}" on:click={toggleTaskMenu} transition:scale={{opacity:TransitionConstants.OPACITY, start:TransitionConstants.START_SMALL, duration:TransitionConstants.DURATION}}>
                <div class="honeycomb-hexagon-empty hexagon">
                    <span class="honeycomb-hexagon-add material-symbols-rounded">add_circle</span>
                </div>
            </div>
            <Menu bind:open={taskMenuOpen} left="{task.hiveX + offsetX}px" top="{task.hiveY + offsetY}px" width="250px">
                <div class="honeycomb-title">Add task</div>
                <div class="honeycomb-subtitle">Task details</div>
                <div class="honeycomb-field">
                    <span class="honeycomb-icon material-symbols-rounded">badge</span>
                    <input class="honeycomb-input-field" type="text" placeholder="Task name" maxlength={TaskConstants.TASK_NAME_MAX_LENGTH} bind:value={taskName} />
                </div>
                <div class="honeycomb-field">
                    <span class="honeycomb-icon material-symbols-rounded">description</span>
                    <input class="honeycomb-input-field" type="text" placeholder="Task description" maxlength={TaskConstants.TASK_DESCRIPTION_MAX_LENGTH} bind:value={taskDescription} />
                </div>
                <div class="honeycomb-members-container">
                    <div class="honeycomb-subtitle">Assign members</div>
                    {#each project.joinedMembers as member, i}
                        <div class="honeycomb-member-container">
                            <input class="honeycomb-input-checkbox" type="checkbox" bind:checked={taskMembersChecked[i]} />
                            <span class="honeycomb-member">{member.displayName}</span>
                        </div>
                    {/each}
                </div>
                <div class="honeycomb-date-container">
                    <div class="honeycomb-subtitle">Start date</div>
                    <div class="honeycomb-field">
                        <span class="honeycomb-icon material-symbols-rounded">today</span>
                        <input class="honeycomb-input-field" type="datetime-local" bind:this={taskStartDateInput} />
                    </div>
                    <div class="honeycomb-subtitle">End date</div>
                    <div class="honeycomb-field">
                        <span class="honeycomb-icon material-symbols-rounded">event</span>
                        <input class="honeycomb-input-field" type="datetime-local" bind:this={taskEndDateInput} />
                    </div>
                </div>
                <button class="honeycomb-action" on:click={addTask}>Add task</button>
                <button class="honeycomb-cancel" on:click={toggleTaskMenu}>Cancel</button>
            </Menu>
        {/if}
    {:else if task.id == TaskConstants.TASK_CENTER_ID}
        {#if existed}
            <div class="honeycomb-hexagon-container-center hexagon" style="left: {task.hiveX + offsetX - HiveConstants.HONEYCOMB_WIDTH / 2}px; top: {task.hiveY + offsetY - HiveConstants.HONEYCOMB_HEIGHT / 2}px; width: {HiveConstants.HONEYCOMB_WIDTH}px; height: {HiveConstants.HONEYCOMB_HEIGHT}px;" transition:scale={{opacity:TransitionConstants.OPACITY, start:TransitionConstants.START_SMALL, duration:TransitionConstants.DURATION}}>
                <div class="honeycomb-hexagon-center hexagon">
                    <div class="honeycomb-hexagon-fill-center" style="height: {isNaN(task.percentage) ? 0 : task.percentage}%"></div>
                    <div class="honeycomb-hexagon-center-label">Overall</div>
                    {#if isNaN(task.percentage)}
                        <div class="honeycomb-hexagon-fill-no-task">No tasks</div>
                    {:else}
                        <div class="honeycomb-hexagon-fill-percentage">{Math.round(task.percentage)}%</div>
                    {/if}
                </div>
            </div>
        {/if}
    {:else}
        {#if existed}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="honeycomb-hexagon-container hexagon" style="left: {task.hiveX + offsetX - HiveConstants.HONEYCOMB_WIDTH / 2}px; top: {task.hiveY + offsetY - HiveConstants.HONEYCOMB_HEIGHT / 2}px; width: {HiveConstants.HONEYCOMB_WIDTH}px; height: {HiveConstants.HONEYCOMB_HEIGHT}px;" on:click={gotoTask} transition:scale={{opacity:TransitionConstants.OPACITY, start:TransitionConstants.START_SMALL, duration:TransitionConstants.DURATION}}>
                <div class="honeycomb-hexagon hexagon" style={isUrgent ? 'width: 85%; height: 85%;' : 'width: 95%; height: 95%;'}>
                    <div class="honeycomb-hexagon-fill" style="height: {task.percentage}%"></div>
                    <div class="honeycomb-hexagon-fill-percentage">{task.percentage}%</div>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div class="honeycomb-hexagon-add-fill material-symbols-rounded" on:click={addFill}>add</div>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div class="honeycomb-hexagon-remove-fill material-symbols-rounded" on:click={removeFill}>remove</div>
                </div>
            </div>
        {/if}
    {/if}
{/if}