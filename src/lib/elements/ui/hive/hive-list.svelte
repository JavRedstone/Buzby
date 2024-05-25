<script lang="ts">
	import { HiveConstants } from "$lib/elements/classes/ui/hive/HiveConstants";
	import { MathHelper } from "$lib/elements/helpers/MathHelper";
	import type { Vector2 } from "three";
	import Honeycomb from "./honeycomb.svelte";
	import { onMount } from "svelte";
	import { projectSelected } from "$lib/elements/stores/project-store";
	import type { Task } from "$lib/elements/classes/data/time/Task";

    let honeycombAngles: number[] = MathHelper.getAnglesForPolygon(6);
    let honeycombOffset: Vector2[] = [];
    for (let i = 0; i < honeycombAngles.length; i++) {
        honeycombOffset.push(MathHelper.getOffsetForAngle(honeycombAngles[i], Math.PI / 2, HiveConstants.HONEYCOMB_RADIUS));
    }

    let tasks: Task[] = [];
    let taskPositions: Vector2[] = [];
    let projectPercentage: number = 0;

    function getTasks(): void {
        projectSelected.subscribe((value) => {
            if (value.project) {
                tasks = value.project.tasks;

                let total = 0;
                for (let i = 0; i < tasks.length; i++) {
                    total += tasks[i].percentage;

                    
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