<svelte:head>
    <title>Buzby | Hive</title>
</svelte:head>
<script lang="ts">
	import { Task } from '$lib/elements/classes/data/time/Task';
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import HiveDisplay from '$lib/elements/ui/hive/hive-display.svelte';
	import HiveList from '$lib/elements/ui/hive/hive-list.svelte';
	import { fade } from 'svelte/transition';

	let taskGotoed: Task = null;

	function gotoTask(event: CustomEvent) {
		taskGotoed = event.detail.task;
	}
</script>
<style>

</style>
<div transition:fade={{duration: TransitionConstants.DURATION}}>
    <HiveDisplay on:gotoTask={gotoTask} />
</div>
<HiveList bind:taskGotoed={taskGotoed} />