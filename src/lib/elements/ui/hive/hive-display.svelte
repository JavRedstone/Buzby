<script lang="ts">
	import { HiveConstants } from "$lib/elements/classes/ui/hive/HiveConstants";
	import { MathHelper } from "$lib/elements/helpers/MathHelper";
	import { Vector2 } from "three";
	import Honeycomb from "./honeycomb.svelte";
	import { createEventDispatcher, onMount } from "svelte";
	import { projectSelected } from "$lib/elements/stores/project-store";
	import { Task } from "$lib/elements/classes/data/time/Task";
	import type { Project } from "$lib/elements/classes/data/project/Project";
	import Snackbar from "../general/snackbar.svelte";
	import { TaskConstants } from "$lib/elements/classes/data/time/TaskConstants";
	import { StringHelper } from "$lib/elements/helpers/StringHelper";

    let dispatch = createEventDispatcher();

    let honeycombAngles: number[] = MathHelper.getAnglesForPolygon(6);
    let honeycombOffset: Vector2[] = [];
    for (let i = 0; i < honeycombAngles.length; i++) {
        honeycombOffset.push(MathHelper.getOffsetForAngle(honeycombAngles[i], Math.PI / 2, HiveConstants.HONEYCOMB_RADIUS * 2));
    }

    let hiveDisplayContainer: HTMLDivElement = null;

    let slidingWidth: number = 20000;
    let slidingHeight: number = 20000;
    let slidingScale: number = 1;

    let project: Project = null;

    let centerTask: Task = new Task({
        id: TaskConstants.TASK_CENTER_ID,
        hivePosX: 0,
        hivePosY: 0,
    });
    let tasks: Task[] = [];
    let placeholderTasks: Task[] = [];
    let projectPercentage: number = 0;
    
    let openedMenuTask: Task = null;

    let snackbarOpen: boolean = false;
    let snackbarText: string = "";
    let snackbarType: string = "neutral";

    function getTasks(): void {
        projectSelected.subscribe((value) => {
            if (value.project != null) {
                project = value.project;
                tasks = value.project.tasks;
                placeholderTasks = [];

                let total = 0;
                for (let task of tasks) {
                    total += task.percentage;
                }
                projectPercentage = total / tasks.length;

                centerTask.percentage = projectPercentage;
                setPlaceHolders(centerTask);

                for (let task of tasks) {
                    setPlaceHolders(task);
                }
            } else {
                project = null;
                tasks = [];
                placeholderTasks = [];
                projectPercentage = 0;
            }
        });
    }

    function setPlaceHolders(task: Task): void {
        for (let placeholder of placeholderTasks) {
            if (MathHelper.areNumberAlmostEqual(placeholder.hivePosX, task.hivePosX) && MathHelper.areNumberAlmostEqual(placeholder.hivePosY, task.hivePosY)) {
                placeholderTasks.splice(placeholderTasks.indexOf(placeholder), 1);
                break;
            }
        }

        for (let i = 0; i < honeycombOffset.length; i++) {
            let pos: Vector2 = new Vector2(task.hivePosX + honeycombOffset[i].x, task.hivePosY + honeycombOffset[i].y);

            let badPos: boolean = false;

            if (MathHelper.areNumberAlmostEqual(centerTask.hivePosX, pos.x) && MathHelper.areNumberAlmostEqual(centerTask.hivePosY, pos.y)) {
                badPos = true;
            }
            for (let task2 of tasks) {
                if (MathHelper.areNumberAlmostEqual(task2.hivePosX, pos.x) && MathHelper.areNumberAlmostEqual(task2.hivePosY, pos.y)) {
                    badPos = true;
                    break;
                }
            }
            for (let placeholder of placeholderTasks) {
                if (MathHelper.areNumberAlmostEqual(placeholder.hivePosX, pos.x) && MathHelper.areNumberAlmostEqual(placeholder.hivePosY, pos.y)) {
                    badPos = true;
                    break;
                }
            }

            if (!badPos) {
                placeholderTasks.push(new Task({
                    id: `${StringHelper.generateID()}${HiveConstants.HONEYCOMB_PLACEHOLDER_ID}`,
                    hivePosX: pos.x,
                    hivePosY: pos.y,
                }));
            }
        }
    }

    function move(event: MouseEvent): void {
        if (event.buttons === 1) {
            hiveDisplayContainer.scrollLeft -= event.movementX;
            hiveDisplayContainer.scrollTop -= event.movementY;
        }
    }

    function zoom(event: WheelEvent): void {
        event.preventDefault();
        let newScale = slidingScale - event.deltaY * HiveConstants.HONEYCOMB_ZOOM_SPEED + event.deltaX * HiveConstants.HONEYCOMB_ZOOM_SPEED;
        if (newScale < HiveConstants.HONEYCOMB_MIN_ZOOM) {
            newScale = HiveConstants.HONEYCOMB_MIN_ZOOM;
        }
        if (newScale > HiveConstants.HONEYCOMB_MAX_ZOOM) {
            newScale = HiveConstants.HONEYCOMB_MAX_ZOOM;
        }
        slidingScale = newScale;
    }

    function setScroll(): void {
        hiveDisplayContainer.scrollLeft = slidingWidth / 2 - hiveDisplayContainer.clientWidth / 2;
        hiveDisplayContainer.scrollTop = slidingHeight / 2 - hiveDisplayContainer.clientHeight / 2;
    }

    function gotoTask(event: CustomEvent): void {
        dispatch("gotoTask", { task: event.detail.task });
    }

    function setOpenedMenu(event: CustomEvent): void {
        openedMenuTask = event.detail.task;
    }

    function setClosedMenu(event: CustomEvent): void {
        if (openedMenuTask && openedMenuTask.id === event.detail.task.id) {
            openedMenuTask = null;
        }
    }

    function openSnackbarHoneycomb(event: CustomEvent): void {
        openSnackbar(event.detail.text, event.detail.type);
    }

    function openSnackbar(text: string, type: string): void {
        snackbarText = text;
        snackbarType = type;
        snackbarOpen = true;
    }

    onMount(() => {
        getTasks();
        setScroll();
    });
</script>
<style>
    .hive-display-container {
        box-sizing: border-box;
        position: relative;
        width: 60%;
        height: calc(100vh - 48px);
        overflow: hidden;
        border-right: 1px solid var(--grey-300);
    }

    .hive-display-sliding-container {
        border: 1px solid var(--grey-300);
        border-radius: 16px;
        /* https://stackoverflow.com/questions/3540194/how-to-make-a-grid-like-graph-paper-grid-with-just-css */
        background-image: radial-gradient(circle, var(--grey-300) 2px, transparent 2px);
        box-shadow: 0 0 108px 0 rgba(0, 0, 0, 0.1);
        cursor: grab;
    }
</style>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="hive-display-container" on:wheel={zoom} on:mousemove={move} bind:this={hiveDisplayContainer}>
    <div class="hive-display-sliding-container" style="background-size: {HiveConstants.HONEYCOMB_RADIUS}px {HiveConstants.HONEYCOMB_RADIUS}px; width: {slidingWidth}px; height: {slidingHeight}px; transform: scale({slidingScale});">
        <Honeycomb task={centerTask} project={project} offsetX={slidingWidth / 2} offsetY={slidingHeight / 2} on:snackbar={openSnackbarHoneycomb} />
        {#each tasks as task, i}
            <Honeycomb task={task} project={project} offsetX={slidingWidth / 2} offsetY={slidingHeight / 2} on:snackbar={openSnackbarHoneycomb} on:gotoTask={gotoTask} />
        {/each}
        {#each placeholderTasks as task, i}
            <Honeycomb task={task} project={project} openedMenuTask={openedMenuTask} offsetX={slidingWidth / 2} offsetY={slidingHeight / 2} on:snackbar={openSnackbarHoneycomb} on:openTaskMenu={setOpenedMenu} on:closeTaskMenu={setClosedMenu} />
        {/each}
    </div>
</div>
<Snackbar type={snackbarType} bind:open={snackbarOpen}>{snackbarText}</Snackbar>