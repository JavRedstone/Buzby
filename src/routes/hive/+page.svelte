<svelte:head>
    <title>Buzby | Hive</title>
</svelte:head>
<script lang="ts">
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import HiveList from '$lib/elements/ui/hive/hive-list.svelte';
	import { fade } from 'svelte/transition';

</script>
<style>

</style>
<div transition:fade={{duration: TransitionConstants.DURATION}}>
    <HiveList />
</div>