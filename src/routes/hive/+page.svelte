<svelte:head>
    <title>Buzby | Hive</title>
</svelte:head>
<script lang="ts">
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import HiveDisplay from '$lib/elements/ui/hive/hive-display.svelte';
	import HiveList from '$lib/elements/ui/hive/hive-list.svelte';
	import { fade } from 'svelte/transition';

</script>
<style>

</style>
<div transition:fade={{duration: TransitionConstants.DURATION}}>
    <HiveDisplay />
</div>
<HiveList />