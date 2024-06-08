<script lang="ts">
	import type { Project } from "$lib/elements/classes/data/project/Project";
	import { Task } from "$lib/elements/classes/data/time/Task";
	import { HiveConstants } from "$lib/elements/classes/ui/hive/HiveConstants";
	import { StringHelper } from "$lib/elements/helpers/StringHelper";
	import { setDoc, type DocumentData, type DocumentReference } from "firebase/firestore";
	import Menu from "../general/menu.svelte";
	import Snackbar from "../general/snackbar.svelte";
	import { getFirestoreDoc } from "$lib/elements/firebase/firebase";
	import { allProjects, projectSelected } from "$lib/elements/stores/project-store";

    export let task: Task = null;
    export let project: Project = null;

    let taskMenuOpen: boolean = false;
    let taskName: string = "";
    let taskDescription: string = "";
    let taskMembersChecked: boolean[] = [];
    let taskStartDateInput: HTMLInputElement = null;
    let taskEndDateInput: HTMLInputElement = null;

    let snackbarOpen: boolean = false;
    let snackbarText: string = "";
    let snackbarType: string = "neutral";

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
                updateProject();
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
                updateProject();
            }).catch((error) => {
                openSnackbar("Error updating task. Please try again", "error");
            });
        }
    }

    function toggleTaskMenu(): void {
        taskMenuOpen = !taskMenuOpen;
        clearTaskMenu();
    }

    function clearTaskMenu(): void {
        taskName = "";
        taskDescription = "";
        taskMembersChecked = [];
        for (let i = 0; i < project.members.length; i++) {
            taskMembersChecked.push(false);
        }
    }

    function updateProject(): void {
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
    }

    function addTask(): void {
        if (taskStartDateInput && taskEndDateInput) {
            if (taskName.trim().length == 0) {
                openSnackbar("Please enter a task name", "error");
                return;
            }

            if (taskName.trim().length > HiveConstants.TASK_NAME_MAX_LENGTH) {
                openSnackbar(`Task name is too long. Max length is ${HiveConstants.TASK_NAME_MAX_LENGTH} characters`, "error");
                return;
            }

            if (taskDescription.trim().length == 0) {
                openSnackbar("Please enter a task description", "error");
                return;
            }

            if (taskDescription.trim().length > HiveConstants.TASK_DESCRIPTION_MAX_LENGTH) {
                openSnackbar(`Task description is too long. Max length is ${HiveConstants.TASK_DESCRIPTION_MAX_LENGTH} characters`, "error");
                return;
            }

            let startDate: Date = new Date(taskStartDateInput.valueAsNumber);
            let endDate: Date = new Date(taskEndDateInput.valueAsNumber);

            if (startDate == null) {
                openSnackbar("Please enter a start date", "error");
                return;
            }

            if (endDate == null) {
                openSnackbar("Please enter an end date", "error");
                return;
            }

            if (startDate.getTime() >= endDate.getTime()) {
                openSnackbar("End date must be after start date", "error");
                return;
            }

            let assignedIds: string[] = [];
            for (let i = 0; i < taskMembersChecked.length; i++) {
                if (taskMembersChecked[i]) {
                    assignedIds.push(project.members[i].id);
                }
            }

            let newTask: Task = new Task({
                id: StringHelper.generateID(),
                name: taskName.trim(),
                description: taskDescription.trim(),
                percentage: 0,
                assignedIds: assignedIds,
                hivePosX: task.hivePosX,
                hivePosY: task.hivePosY,
                startDate: startDate,
                endDate: endDate,
            });

            project.taskIds.push(newTask.id);
            project.tasks.push(newTask);

            let projectDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("projects", project.id);
            setDoc(projectDoc, project.compactify()).then(() => {
                let taskDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc("tasks", newTask.id);
                setDoc(taskDoc, newTask.compactify()).then(() => {
                    updateProject();
                    openSnackbar("Task added successfully.", "success");
                    toggleTaskMenu();
                }).catch((error) => {
                    openSnackbar("Error adding task. Please try again", "error");
                });
            }).catch((error) => {
                openSnackbar("Error adding task. Please try again", "error");
            });
            
        }
    }

    function openSnackbar(text: string, type: string): void {
        snackbarText = text;
        snackbarType = type;
        snackbarOpen = true;
    }
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
        background-color: var(--primary-light);
        user-select: none;
        cursor: pointer;

        transition: background-color var(--transition-duration);

        &:hover {
            background-color: var(--primary-dark);
        }
    }

    .honeycomb-hexagon-container-center {
        position: absolute;
        background-color: var(--accent-light);
        user-select: none;

        transition: background-color var(--transition-duration);    

        &:hover {
            background-color: var(--accent-dark);
        }
    }

    .honeycomb-hexagon {
        position: absolute;
        height: 95%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(to bottom, var(--primary), var(--primary-dark));
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

    .honeycomb-input-field {
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
    {#if task.id.length == 0}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="honeycomb-hexagon-container-empty hexagon" style="left: {task.hivePosX}px; top: {task.hivePosY}px; width: {HiveConstants.HONEYCOMB_WIDTH}px; height: {HiveConstants.HONEYCOMB_HEIGHT}px; {taskMenuOpen ? 'background-color: var(--primary); color: var(--primary);' : ''}" on:click={toggleTaskMenu}>
            <div class="honeycomb-hexagon-empty hexagon">
                <span class="honeycomb-hexagon-add material-symbols-rounded">add_circle</span>
            </div>
        </div>
        <Menu bind:open={taskMenuOpen} left="{task.hivePosX + HiveConstants.HONEYCOMB_WIDTH}px" top="{task.hivePosY}px" width="200px" height="200px">
            <div class="honeycomb-title">Add task</div>
            <div class="honeycomb-subtitle">Task details</div>
            <input class="honeycomb-input-field" type="text" placeholder="Task name" maxlength={HiveConstants.TASK_NAME_MAX_LENGTH} bind:value={taskName} />
            <input class="honeycomb-input-field" type="text" placeholder="Task description" maxlength={HiveConstants.TASK_DESCRIPTION_MAX_LENGTH} bind:value={taskDescription} />
            <div class="honeycomb-members-container">
                <div class="honeycomb-subtitle">Assign members</div>
                {#each project.members as member, i}
                    <div class="honeycomb-member-container">
                        <input class="honeycomb-input-checkbox" type="checkbox" bind:checked={taskMembersChecked[i]} />
                        <span class="honeycomb-member">{member.displayName}</span>
                    </div>
                {/each}
            </div>
            <div class="honeycomb-date-container">
                <div class="honeycomb-subtitle">Start date</div>
                <input class="honeycomb-input-field" type="datetime-local" bind:this={taskStartDateInput} />
                <div class="honeycomb-subtitle">End date</div>
                <input class="honeycomb-input-field" type="datetime-local" bind:this={taskEndDateInput} />
            </div>
            <button class="honeycomb-action" on:click={addTask}>Add task</button>
            <button class="honeycomb-cancel" on:click={toggleTaskMenu}>Cancel</button>
        </Menu>
    {:else if task.id == HiveConstants.TASK_CENTER_ID}
        <div class="honeycomb-hexagon-container-center hexagon" style="left: {task.hivePosX}px; top: {task.hivePosY}px; width: {HiveConstants.HONEYCOMB_WIDTH}px; height: {HiveConstants.HONEYCOMB_HEIGHT}px;">
            <div class="honeycomb-hexagon-center hexagon">
                <div class="honeycomb-hexagon-fill-center" style="height: {task.percentage}%"></div>
                <div class="honeycomb-hexagon-center-label">Overall</div>
                {#if isNaN(task.percentage)}
                    <div class="honeycomb-hexagon-fill-no-task">No tasks</div>
                {:else}
                    <div class="honeycomb-hexagon-fill-percentage">{Math.round(task.percentage)}%</div>
                {/if}
            </div>
        </div>
    {:else}
        <div class="honeycomb-hexagon-container hexagon" style="left: {task.hivePosX}px; top: {task.hivePosY}px; width: {HiveConstants.HONEYCOMB_WIDTH}px; height: {HiveConstants.HONEYCOMB_HEIGHT}px;">
            <div class="honeycomb-hexagon hexagon">
                <div class="honeycomb-hexagon-fill" style="height: {Math.round(task.percentage)}%"></div>
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
<Snackbar type={snackbarType} bind:open={snackbarOpen}>{snackbarText}</Snackbar>