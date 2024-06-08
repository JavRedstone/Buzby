<script lang="ts">
	import { HiveConstants } from "$lib/elements/classes/ui/hive/HiveConstants";
	import { MathHelper } from "$lib/elements/helpers/MathHelper";
	import { Vector2 } from "three";
	import Honeycomb from "./honeycomb.svelte";
	import { onMount } from "svelte";
	import { projectSelected } from "$lib/elements/stores/project-store";
	import { Task } from "$lib/elements/classes/data/time/Task";
	import type { Project } from "$lib/elements/classes/data/project/Project";

    let honeycombAngles: number[] = MathHelper.getAnglesForPolygon(6);
    let honeycombOffset: Vector2[] = [];
    for (let i = 0; i < honeycombAngles.length; i++) {
        honeycombOffset.push(MathHelper.getOffsetForAngle(honeycombAngles[i], Math.PI / 2, HiveConstants.HONEYCOMB_RADIUS * 2));
    }

    let project: Project = null;

    let centerTask: Task = new Task({
        id: HiveConstants.TASK_CENTER_ID,
        hivePosX: 100,
        hivePosY: 100,
    });
    let tasks: Task[] = [];
    let placeholderTasks: Task[] = [];
    let projectPercentage: number = 0;

    function getTasks(): void {
        projectSelected.subscribe((value) => {
            if (value.project) {
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
            }
        });
    }

    function setPlaceHolders(task): void {
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
                    hivePosX: pos.x,
                    hivePosY: pos.y,
                }));
            }
        }
    }

    onMount(() => {
        getTasks();
    });
</script>
<style>
    
</style>
<Honeycomb task={centerTask} />
{#each tasks as task, i}
    <Honeycomb task={task} project={project} />
{/each}
{#each placeholderTasks as task, i}
    <Honeycomb task={task} project={project} />
{/each}