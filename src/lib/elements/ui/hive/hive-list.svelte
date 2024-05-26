<script lang="ts">
	import { HiveConstants } from "$lib/elements/classes/ui/hive/HiveConstants";
	import { MathHelper } from "$lib/elements/helpers/MathHelper";
	import { Vector2 } from "three";
	import Honeycomb from "./honeycomb.svelte";
	import { onMount } from "svelte";
	import { projectSelected } from "$lib/elements/stores/project-store";
	import type { Task } from "$lib/elements/classes/data/time/Task";
	import type { TaskPosition } from "$lib/elements/classes/ui/hive/TaskPosition";

    let honeycombAngles: number[] = MathHelper.getAnglesForPolygon(6);
    let honeycombOffset: Vector2[] = [];
    for (let i = 0; i < honeycombAngles.length; i++) {
        honeycombOffset.push(MathHelper.getOffsetForAngle(honeycombAngles[i], Math.PI / 2, HiveConstants.HONEYCOMB_RADIUS));
    }

    let tasks: Task[] = [];
    let taskPositions: TaskPosition[] = [];
    let projectPercentage: number = 0;

    function getTasks(): void {
        projectSelected.subscribe((value) => {
            if (value.project) {
                tasks = value.project.tasks;

                let total = 0;
                for (let task of tasks) {
                    total += task.percentage;

                    let pos: Vector2 = new Vector2();
                    if (task.parentId.length == 0) {
                        // TODO
                        // pos = honeycombOffset
                    }
                }
                projectPercentage = total / tasks.length;
            }
        });
    }

    onMount(() => {
        getTasks();
    });
</script>
<style>
    
</style>
<Honeycomb />