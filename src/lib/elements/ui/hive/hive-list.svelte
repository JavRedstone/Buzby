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

    function getTasks(): void {
        projectSelected.subscribe((value) => {
            if (value.project) {
                tasks = value.project.tasks;
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