<script lang="ts">
	import { PingConstants } from '$lib/elements/classes/data/chat/PingConstants';
    import logo from '$lib/elements/assets/logo/logo.svg';
	import { RouteConstants } from "$lib/elements/classes/ui/core/RouteConstants";
	import { fade, fly } from "svelte/transition";
	import Dropdown from "../general/dropdown.svelte";
	import type { User } from "firebase/auth";
	import { onMount } from "svelte";
	import { authHandlers, currentUser } from "$lib/elements/stores/auth-store";
	import { auth, getFirestoreCollection, getFirestoreDoc } from "$lib/elements/firebase/firebase";
	import Snackbar from "../general/snackbar.svelte";
	import { ProjectConstants } from "$lib/elements/classes/data/project/ProjectConstants";
	import { currentMember, projectSelected } from "$lib/elements/stores/project-store";
	import { Project } from "$lib/elements/classes/data/project/Project";
	import { DocumentReference, deleteDoc, getDoc, getDocs, onSnapshot, query, setDoc, where, type CollectionReference, type DocumentData } from "firebase/firestore";
	import { TransitionConstants } from "$lib/elements/classes/ui/core/TransitionConstants";
	import { Member } from "$lib/elements/classes/data/project/Member";
	import Menu from "../general/menu.svelte";
	import type { Ping } from "$lib/elements/classes/data/chat/Ping";
	import { goto } from '$app/navigation';
	import Badge from '../general/badge.svelte';
	import { navigating } from '$app/stores';
	import { StringHelper } from '$lib/elements/helpers/StringHelper';

    export let sideOpen: boolean = false;

    let w: Window = null;
    let pathname: string = '';

    let drawerOpen: boolean = false;
    let projectSelectOpen: boolean = false;
    let pingsOpen: boolean = false;

    let defaultProjectName: string = ProjectConstants.DEFAULT_PROJECT_NAME;
    
    let selectedProject: Project = null;
    let selectedProjectName: string = defaultProjectName;
    let selectedProjectIdx: number = 0;

    let projectNames: string[] = [defaultProjectName];
    
    let snackbarOpen: boolean = false;
    let snackbarText: string = '';
    let snackbarType: string = 'neutral';

    let currUser: User = null;
    let currMember: Member = null;

    function toggleDrawer(): void {
        if (selectedProjectName == defaultProjectName) {
            sideOpen = false;
        }
        else {
            sideOpen = true;
            drawerOpen = !drawerOpen;
            if (drawerOpen) {
                projectSelectOpen = false;
                pingsOpen = false;
            }
        }
    }

    function gotoHome(): void {
        goto(RouteConstants.HOME);
        projectSelected.set(null);
    }

    function autoRedirect(): void {
        navigating.subscribe((value) => {
            w = window;
            pathname = w.location.pathname;

            if (pathname != '/') {
                localStorage.setItem('selectedProjectRoute', pathname);
                sideOpen = true;
            } else {
                sideOpen = false;
            }
            history.forward();
        });
        if (selectedProjectName == defaultProjectName) {
            gotoHome();
        }
    }

    function getCurrMember(): void {
        currentMember.subscribe((value) => {
            currMember = value;
            // if (currMember) {
            //     currMember.setObjects();
            // }
        });
    }

    function toggleProjectSelect(): void {
        drawerOpen = false;
        pingsOpen = false;
    }

    function selectProject(): void {
        drawerOpen = false;
        pingsOpen = false;
        if (currMember == null) {
            return;
        }
        let project: Project = currMember.joinedProjects[selectedProjectIdx - 1];
        if (project || selectedProjectName == defaultProjectName) {
            selectedProject = project;
            if (selectedProjectName != defaultProjectName && location.pathname == '/') {
                projectSelected.set(project.id);
                goto(RouteConstants.DEFAULT_PROJECT_ROUTE);
            } else if (selectedProjectName == defaultProjectName) {
                gotoHome();
            }
        }
        localStorage.setItem('selectedProjectId', selectedProject ? selectedProject.id : '');
        
        sideOpen = selectedProjectName != defaultProjectName;
    }

    function login(): void {
        drawerOpen = false;
        projectSelectOpen = false;
        pingsOpen = false;
        localStorage.clear();
        goto('/login');
    }

    function autoLogin(): void {
        auth.onAuthStateChanged(
            (user) => {
                if (user != null) {
                    currentUser.set(user);
                    currUser = user;

                    let memberDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('members', user.uid);
                    onSnapshot(memberDoc, {
                        includeMetadataChanges: true
                    }, (doc) => {
                        if (doc.exists()) {
                            let member: Member = new Member(doc.data());
                            member.setObjects();
                            currMember = member;

                            currentMember.set(member);

                            getCurrMember();
                        }
                    });
                }
            }
        );
    }

    function logout(): void {
        drawerOpen = false;
        projectSelectOpen = false;
        pingsOpen = false;
        try {
            authHandlers.logout().then(
                () => {
                    localStorage.clear();
                    openSnackbar('Logged out successfully. Good bye!', 'neutral');

                    goto(RouteConstants.HOME).then(() => {
                        location.reload();
                    });
                }
            ).catch(
                (error: any) => {
                    openSnackbar('Error logging out. Please try again.', 'error');
                }
            );
        }
        catch(error: any) {
            openSnackbar('Error logging out. Please try again.', 'error');
        }
    }

    function editProfile(): void {
        drawerOpen = false;
        projectSelectOpen = false;
    }

    function togglePings(): void {
        drawerOpen = false;
        projectSelectOpen = false;
        pingsOpen = !pingsOpen;
    }

    function getUnreadCount(pings: Ping[]): number {
        let count: number = 0;
        for (let ping of pings) {
            if (!ping.read) {
                count++;
            }
        }
        return count;
    }

    function markPingRead(ping: Ping): void {
        drawerOpen = false;
        projectSelectOpen = false;

        if (!currMember || !ping) {
            return;
        }

        ping.read = true;

        let pingDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('pings', ping.id);
        setDoc(pingDoc, ping.compactify()).catch(
            (error: any) => {
                openSnackbar('Error marking notification as read. Please try again.', 'error');
            }
        );
    }

    function markAllPingsRead(): void {
        for (let ping of currMember.pings) {
            markPingRead(ping);
        }
    }

    function getPingColor(ping: Ping): string {
        if (ping.type == PingConstants.TYPES.PROJECT) {
            return 'var(--primary-dark)';
        } else if (ping.type == PingConstants.TYPES.USER) {
            return 'var(--accent-dark)';
        } else if (ping.type == PingConstants.TYPES.SYSTEM) {
            return 'var(--grey-700)';
        } else if (ping.type == PingConstants.TYPES.ERROR) {
            return 'var(--error)';
        } else {
            return 'var(--grey-700)';
        }
    }

    function openSnackbar(text: string, type: string): void {
        snackbarText = text;
        snackbarType = type;
        snackbarOpen = true;
    }

    onMount(() => {
        autoRedirect();
        autoLogin();
    });
</script>
<style>
    .core-header-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 48px;
        background-color: rgba(var(--off-white-rgb), 0.25);
    }

    .core-header-logo {
        position: absolute;
        top: 3px;
        height: 42px;
        cursor: pointer;
        user-select: none;

        transition: left var(--transition-duration);
    }

    .core-header-icon {
        position: absolute;
        top: 8px;
        font-size: 32px;
        color: var(--primary-dark);

        cursor: pointer;
        user-select: none;

        transition: color var(--transition-duration);

        &:hover {
            color: var(--accent-dark);
        }
    }

    .core-header-icon-container {
        position: absolute;
    }

    .core-project-dropdown {
        position: absolute;
        top: 6px;
        
        transition: left var(--transition-duration);
    }

    .core-drawer-left-container {
        position: fixed;
        top: 48px;
        left: 48px;
        width: 115px;
        height: calc(100vh - 48px);
        background-color: var(--off-white-dark);

        z-index: 1000;
    }

    .core-drawer-left-container-small {
        position: fixed;
        top: 48px;
        left: 0;
        width: 48px;
        height: calc(100vh - 48px);
        background-color: #e0e4e7;

        z-index: 1000;
    }

    .core-drawer-icon {
        font-size: 36px;
        margin: 3px;
        padding: 3px;
        color: var(--grey-700);
        border-radius: 50%;
        
        cursor: pointer;
        user-select: none;

        transition: color var(--transition-duration), background-color var(--transition-duration);

        &:hover {
            color: var(--primary-dark);
            background-color: var(--off-white);
        }
    }

    .core-drawer-link {
        display: block;
        padding: 6px;
        margin: 6px;
        margin-bottom: 12px;
        border-radius: 8px;
        color: var(--grey-700);
        
        transition: background-color var(--transition-duration);

        &:hover {
            background-color: var(--off-white);
        }
    }

    .core-drawer-right-container {
        position: fixed;
        top: 48px;
        right: 0;
        width: 100vw;
        height: calc(100vh - 48px);
        background-color: rgba(0, 0, 0, 0.1);

        z-index: 999;
    }

    .core-pings-title {
        border-bottom: 1px solid var(--grey-400);
        font-size: 16px;
        padding-bottom: 4px;
        text-align: center;
    }

    .core-ping-container {
        position: relative;
        padding: 4px;
        border-bottom: 1px solid var(--grey-300);
        background-color: var(--off-white);

        transition: background-color var(--transition-duration);

        &:hover {
            background-color: var(--off-white-light);
        }
    }

    .core-ping-title {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 2px;
    }

    .core-ping-message {
        font-size: 10px;
    }

    .core-ping-time {
        font-size: 10px;
        color: var(--grey-500);
    }

    .core-ping-mark-read {
        position: absolute;
        right: 4px;
        top: 4px;
        cursor: pointer;
    }

    .core-pings-mark-all {
        position: absolute;
        top: 8px;
        cursor: pointer;
    }
</style>
<div class="core-header-container">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    {#if drawerOpen || selectedProjectName != defaultProjectName}
        <span class="core-header-icon material-symbols-rounded" style="left: 8px;" on:click={toggleDrawer} transition:fade={{ duration: TransitionConstants.DURATION }}>
            {#if drawerOpen}
                close
            {:else if selectedProjectName != defaultProjectName}
                menu_open
            {/if}
        </span>
    {/if}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <img class="core-header-logo" style="left: {drawerOpen || selectedProjectName != defaultProjectName ? 44 : 8}px;" src={logo} alt="logo" on:click={gotoHome} />
    {#if currUser == null || !currUser.emailVerified || currMember == null}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-missing-attribute -->
        <a on:click={login}>
            <span class="core-header-icon material-symbols-rounded" style="right: 8px;">login</span>
        </a>
    {:else}
        <div class="core-project-dropdown" style="left: {drawerOpen || selectedProjectName != defaultProjectName ? 200 : 164}px;">
            <Dropdown label="Select project" items={projectNames} bind:defaultItem={defaultProjectName} bind:selectedItem={selectedProjectName} bind:selectedItemIdx={selectedProjectIdx} bind:open={projectSelectOpen} on:toggle={toggleProjectSelect} on:select={selectProject} maxHeight="300px" />
        </div>
        <div class="core-header-icon-container" style="right: 108px;">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-missing-attribute -->
            <a on:click={togglePings}>
                <span class="core-header-icon material-symbols-rounded">notifications_active</span>
            </a>
            {#if currMember}
                {#if currMember.pings.length > 0}
                    <Badge>getUnreadCount(currMember.pings)</Badge>
                {/if}
                <Menu bind:open={pingsOpen} right="0" top="48px" width="200px" height="200px">
                    <div class="core-pings-title">Notifications</div>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <a class="core-pings-mark-all" on:click={markAllPingsRead}>
                        <span class="material-symbols-rounded">clear_all</span>
                    </a>
                    {#each currMember.pings as ping, i}
                        <div class="core-ping-container" style="{i == currMember.pings.length - 1 ? 'border-bottom: none;' : ''}">
                            <div class="core-ping-title" style="color: {getPingColor(ping)}">{ping.title}</div>
                            <div class="core-ping-time">{StringHelper.getFormattedDate(ping.createdAt)}</div>
                            <div class="core-ping-message">{ping.message}</div>
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <!-- svelte-ignore a11y-missing-attribute -->
                            <a class="core-ping-mark-read" on:click={() => markPingRead(ping)}>
                                <span class="material-symbols-rounded">mark_email_read</span>
                            </a>
                        </div>
                    {/each}
                </Menu>
            {/if}
        </div>
        <div class="core-header-icon-container" style="right: 74px;">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-missing-attribute -->
            <a on:click={editProfile}>
                <span class="core-header-icon material-symbols-rounded">account_circle</span>
            </a>
        </div>
        <div class="core-header-icon-container" style="right: 40px;">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-missing-attribute -->
            <a on:click={logout}>
                <span class="core-header-icon material-symbols-rounded">logout</span>
            </a>
        </div>
    {/if}
</div>
{#if drawerOpen && selectedProjectName != defaultProjectName}
    <div class="core-drawer-left-container" transition:fly={{ x: -115, duration: TransitionConstants.DURATION }}>
        {#each RouteConstants.ROUTES as routeItem}
            <a class="core-drawer-link" style="{w && pathname == routeItem.route ? 'color: var(--primary-dark); background-color: var(--off-white);' : ''}" href={routeItem.route} on:click={() => drawerOpen = false}>{routeItem.name}</a>
        {/each}
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="core-drawer-right-container" on:click={() => drawerOpen = false} transition:fade={{ duration: TransitionConstants.DURATION }}></div>
{/if}
{#if sideOpen}
    <div class="core-drawer-left-container-small" transition:fly={{ x: -50, duration: TransitionConstants.DURATION }}>
        {#each RouteConstants.ROUTES as routeItem}
            <a href={routeItem.route} on:click={() => drawerOpen = false}>
                <span class="core-drawer-icon material-symbols-rounded" style="{w && pathname == routeItem.route ? 'color: var(--primary-dark); background-color: var(--off-white);' : ''}">{routeItem.icon}</span>
            </a>
        {/each}
    </div>
{/if}
<Snackbar type={snackbarType} bind:open={snackbarOpen}>{snackbarText}</Snackbar>