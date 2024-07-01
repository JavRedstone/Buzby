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
	.hive-title {
		position: absolute;
		padding: 8px;
        font-size: 16px;
        font-weight: 500;
        color: var(--grey-800);
		user-select: none;
		z-index: 100;
    }
</style>
<div transition:fade={{duration: TransitionConstants.DURATION}}>
	<div class="hive-title">Hive</div>
    <HiveDisplay on:gotoTask={gotoTask} />
</div>
<HiveList width="40%" bind:taskGotoed={taskGotoed} />