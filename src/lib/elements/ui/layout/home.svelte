<svelte:head>
    <title>Buzby</title>
</svelte:head>
<script lang="ts">
	import { goto } from '$app/navigation';
	import { RouteConstants } from '$lib/elements/classes/ui/core/RouteConstants';
	import { TransitionConstants } from '$lib/elements/classes/ui/core/TransitionConstants';
	import { HiveConstants } from '$lib/elements/classes/ui/hive/HiveConstants';
	import { MathHelper } from '$lib/elements/helpers/MathHelper';
	import { ObjectHelper } from '$lib/elements/helpers/ObjectHelper';
	import { onDestroy, onMount } from 'svelte';
    import SvelteTypedJs from 'svelte-typed-js';
	import { scale } from 'svelte/transition';
	import { Vector2 } from 'three';
    let hexagonAngles: number[] = MathHelper.getAnglesForPolygon(6);
    let hexagonOffset: Vector2[] = [];
    for (let i = 0; i < hexagonAngles.length; i++) {
        hexagonOffset.push(MathHelper.getOffsetForAngle(hexagonAngles[i], Math.PI / 2, HiveConstants.HONEYCOMB_RADIUS * 4));
    }

    let innerWidth: number = 0;
    let innerHeight: number = 0;

    let hexagonPositions: Vector2[] = [];
    let hexagonPercentages: number[] = [];
    let hexagonUrgents: boolean[] = [];

    let hexagonInterval: any = null;

    function addHexagon(): void {
        if (hexagonPositions.length >= RouteConstants.HOME_MAX_NUM_HEXAGONS) {
            return;
        }
        let randomPreviousPosition = ObjectHelper.pickRandom(hexagonPositions);
        let previousPosition = randomPreviousPosition ? randomPreviousPosition : new Vector2(0, 0);
        let availableOffsets = hexagonOffset.slice();
        for (let position of hexagonPositions) {
            let index = availableOffsets.findIndex((offset) => MathHelper.areNumberAlmostEqual(offset.x + previousPosition.x, position.x) && MathHelper.areNumberAlmostEqual(offset.y + previousPosition.y, position.y));
            if (index !== -1) {
                availableOffsets.splice(index, 1);
            }
        }
        let randomOffset = ObjectHelper.pickRandom(availableOffsets);
        if (randomOffset) {
            hexagonPositions.push(new Vector2(previousPosition.x + randomOffset.x, previousPosition.y + randomOffset.y));
            hexagonPercentages.push(0);
            hexagonUrgents.push(Math.random() > 0.5);
        }
    }

    function addPercentageToAll(): void {
        for (let i = 0; i < hexagonPercentages.length; i++) {
            hexagonPercentages[i] += HiveConstants.HONEYCOMB_FILL_INCREMENT;

            if (hexagonPercentages[i] > 100) {
                hexagonPercentages[i] = 100;
                hexagonUrgents[i] = false;
            }
        }
    }

    function generateAllHexagons(): void {
        hexagonPositions = [];
        hexagonPercentages = [];
        hexagonUrgents = [];
        hexagonInterval = setInterval(() => {
            addHexagon();
            addPercentageToAll();
        }, RouteConstants.HOME_HEXAGON_INTERVAL);
    }

    function gotoLogin(): void {
        goto(RouteConstants.LOGIN);
    }

    function getInnerDimensions(): void {
        innerWidth = window.innerWidth;
        innerHeight = window.innerHeight;
    }

    function setListeners(): void {
        window.addEventListener('resize', getInnerDimensions);
    }

    function removeListeners(): void {
        window.removeEventListener('resize', getInnerDimensions);
    }

    onMount(() => {
        setListeners();
        getInnerDimensions();
        generateAllHexagons();
    });

    onDestroy(() => {
        clearInterval(hexagonInterval);
        removeListeners();
    });
</script>
<style>
    .home-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        padding: 16px;
        background-color: var(--grey-900);
        user-select: none;
    }

    .home-container-background {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: center url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='rgb(40,40,40)' viewBox='0 0 100 169.5'%3E%3Cpolygon points='50,34.75 93.5,59.75 93.5,109.75 50,134.75 6.5,109.75 6.5,59.75'%3E%3C/polygon%3E%3Cpolygon points='0,-50 43.5,-25 43.5,25 0,50 -43.5,25 -43.5,-25'%3E%3C/polygon%3E%3Cpolygon points='100,-50 143.5,-25 143.5,25 100,50 56.5,25 56.5,-25'%3E%3C/polygon%3E%3Cpolygon points='0,119.5 43.5,144.5 43.5,194.5 0,219.5 -43.5,194.5 -43.5,144.5'%3E%3C/polygon%3E%3Cpolygon points='100,119.5 143.5,144.5 143.5,194.5 100,219.5 56.5,194.5 56.5,144.5'%3E%3C/polygon%3E%3C/svg%3E");
        background-size: 64px;
    }

    .home-title-container {
        position: fixed;
        top: 0;
        left: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 100%;
        height: 100%;
        padding-left: 32px;
        background-color: rgba(0, 0, 0, 0.25);
        z-index: 1;
    }

    .home-title {
        color: var(--grey-100);
        font-size: 64px;
        line-height: 1.2;
        font-weight: 500;
    }

    .home-typing {
        color: var(--primary-dark);
        font-size: 64px;
        line-height: 1.2;
        font-weight: 500;
    }

    .typing {
        background-image: linear-gradient(to right, var(--primary), var(--primary-dark));
        background-clip: text;
        color: transparent;
    }

    .home-hexagon-container {
        position: absolute;
        background-color: var(--primary);
        user-select: none;
    }

    .home-hexagon {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(to bottom, var(--primary), var(--primary-dark));

        transition: width var(--transition-duration), height var(--transition-duration);
    }

    .home-hexagon-fill {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        background: linear-gradient(to bottom, var(--primary-darker), var(--primary-dark));

        transition: height var(--transition-duration);
    }

    .home-get-started {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 200px;
        margin-top: 32px;
        padding-right: 12px;
        padding-top: 8px;
        padding-bottom: 8px;
        border: none;
        outline: none;
        border-radius: 8px;
        background-color: var(--primary);
        box-shadow: 2px 2px 0 var(--primary-dark);
        color: var(--grey-800);
        font-size: 24px;
        cursor: pointer;
        user-select: none;
        z-index: 1;

        transition: box-shadow var(--transition-duration);

        &:hover {
            box-shadow: 4px 4px 0 var(--primary-dark);
        }
    }

    .home-get-started-icon {
        font-size: 32px;
        margin-right: 8px;
    }
</style>
<div class="home-container">
    <div class="home-container-background">
        <div class="home-title-container">
            <div class="home-title">Groupwork for</div>
            <div class="home-typing">
                <SvelteTypedJs strings={RouteConstants.HOME_GROUPWORK_FOR} loop=true typeSpeed=10 backSpeed=8 smartBackspace=true>
                    <div class="typing"></div>
                </SvelteTypedJs>
            </div>
            <button class="home-get-started" on:click={gotoLogin}>
                <span class="home-get-started-icon material-symbols-rounded">flag</span>
                Get Started
            </button>
        </div>
        {#each hexagonPositions as position, i}
            <div class="home-hexagon-container hexagon" style="left: {innerWidth * 3 / 4 + position.x - HiveConstants.HONEYCOMB_WIDTH / 2}px; top: {innerHeight / 2 + position.y - HiveConstants.HONEYCOMB_HEIGHT / 2}px; width: {2 * HiveConstants.HONEYCOMB_WIDTH}px; height: {2 * HiveConstants.HONEYCOMB_HEIGHT}px;" transition:scale={{opacity:TransitionConstants.OPACITY, start:TransitionConstants.START_SMALL, duration:TransitionConstants.DURATION}}>
                <div class="home-hexagon hexagon" style={hexagonUrgents[i] ? 'width: 85%; height: 85%;' : 'width: 95%; height: 95%;'}>
                    <div class="home-hexagon-fill" style="height: {hexagonPercentages[i]}%"></div>
                </div>
            </div>
        {/each}
    </div>
</div>