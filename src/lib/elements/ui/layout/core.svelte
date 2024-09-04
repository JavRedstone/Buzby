<script lang="ts">
	import Avatar from './../general/avatar.svelte';
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
	import { MemberConstants } from '$lib/elements/classes/data/project/MemberConstants';

    export let sideOpen: boolean = false;

    let w: Window = null;
    let pathname: string = '';

    let drawerOpen: boolean = false;
    let projectSelectOpen: boolean = false;
    let pingsOpen: boolean = false;
    let avatarOpen: boolean = false;

    let defaultProjectName: string = ProjectConstants.DEFAULT_PROJECT_NAME;
    
    let selectedProjectId: string = '';
    let selectedProjectRoute: string = '';

    let selectedProject: Project = null;
    let selectedProjectName: string = defaultProjectName;
    let selectedProjectIdx: number = 0;

    let projectNames: string[] = [defaultProjectName];
    
    let snackbarOpen: boolean = false;
    let snackbarText: string = '';
    let snackbarType: string = 'neutral';

    let currUser: User = null;
    let currMember: Member = null;

    $: w ? setRoute() : null;

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
        goto(RouteConstants.HOME).then(() => {
            localStorage.clear();
            projectSelected.set(null);
            selectedProject = null;
            selectedProjectName = defaultProjectName;
            selectedProjectIdx = 0;
        });
    }

    function autoRedirect(): void {
        navigating.subscribe((value) => {
            selectedProjectId = localStorage.getItem('selectedProjectId');

            w = window;
            if (value) {
                pathname = value.to.route.id;
            } else {
                pathname = w.location.pathname;
            }

            setRoute();
            history.forward();
        });
    }

    function setRoute(): void {
        if (pathname != '/' && pathname != '/login' && pathname != '/signup') {
            if (selectedProject) {
                localStorage.setItem('selectedProjectRoute', pathname);

                setProject(selectedProject);
            }

            sideOpen = true;
        } else {
            sideOpen = false;
        }
    }

    function getCurrMember(): void {
        currentMember.subscribe((value) => {
            currMember = value;

            if (currMember) {
                projectSelected.subscribe((value) => {
                    selectedProject = currMember.joinedProjects.find((project) => project.id == value);
                    if (selectedProject && selectedProject.id && selectedProjectId != '') {
                        selectedProjectName = selectedProject.name;
                        selectedProjectIdx = currMember.joinedProjects.findIndex((p) => p.id == selectedProject.id) + 1;
                    }
                });

                projectNames = [defaultProjectName];
                for (let project of currMember.joinedProjects) {
                    projectNames = [...projectNames, project.name];
                }

                selectedProjectId = localStorage.getItem('selectedProjectId');
                if (selectedProjectId) {
                    let project: Project = currMember.joinedProjects.find((project) => project.id == selectedProjectId);
                    if (project) {
                        setProject(project);
                        goto(selectedProjectRoute).then(() => {
                            setRoute();
                        });
                    }
                }
            }
        });
    }

    function toggleProjectSelect(): void {
        drawerOpen = false;
        pingsOpen = false;
    }

    function selectProject(): void {
        drawerOpen = false;
        pingsOpen = false;

        if (selectedProjectIdx == 0 || !currMember) {
            gotoHome();
        }
        
        let project: Project = currMember.joinedProjects[selectedProjectIdx - 1];
        if (project) {
            setProject(project);
            goto(selectedProjectRoute).then(() => {
                setRoute();
            });
        }
    }

    function setProject(project: Project): void {
        if (project && currMember) {
            selectedProject = project;
            selectedProjectName = project.name;
            selectedProjectIdx = currMember.joinedProjects.findIndex((p) => p.id == project.id) + 1;

            projectSelected.set(project.id);

            selectedProjectRoute = localStorage.getItem('selectedProjectRoute');
            if (!selectedProjectRoute) {
                selectedProjectRoute = RouteConstants.DEFAULT_PROJECT_ROUTE;
            }

            localStorage.setItem('selectedProjectId', project.id);
            localStorage.setItem('selectedProjectRoute', selectedProjectRoute);

            sideOpen = selectedProjectName != defaultProjectName;
        }
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
                            let data = doc.data();

                            if (data) {
                                currMember ? currMember.set(data) : currMember = new Member(data);
                                currMember.setObjects();
                            }

                            currentMember.set(currMember);

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
        avatarOpen = false;
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

    function togglePings(): void {
        drawerOpen = false;
        projectSelectOpen = false;
        avatarOpen = false;
        pingsOpen = !pingsOpen;
    }

    function toggleAvatar(): void {
        drawerOpen = false;
        projectSelectOpen = false;
        pingsOpen = false;
        avatarOpen = !avatarOpen;
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

    function markPing(ping: Ping, read: boolean): void {
        drawerOpen = false;
        projectSelectOpen = false;

        if (!currMember || !ping) {
            return;
        }

        ping.read = read;

        let pingDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('pings', ping.id);
        setDoc(pingDoc, ping.compactify()).catch(
            (error: any) => {
                openSnackbar('Error marking notification as read. Please try again.', 'error');
            }
        );
    }

    function markAllPingsRead(): void {
        for (let ping of currMember.pings) {
            if (!ping.read) {
                markPing(ping, true);
            }
        }
    }

    function cycleAvatar(right: boolean) {
        if (!currMember) {
            return;
        }

        let next: number = right ? currMember.avatarChoice + 1 : currMember.avatarChoice - 1;
        if (next < 0) {
            next = MemberConstants.AVATAR_CHOICES.length - 1;
        } else if (next >= MemberConstants.AVATAR_CHOICES.length) {
            next = 0;
        }

        currMember.avatarChoice = next;
        let memberDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('members', currMember.id);
        setDoc(memberDoc, currMember.compactify()).then(
            () => {
                openSnackbar('Avatar changed successfully!', 'success');
            }
        ).catch(
            (error: any) => {
                openSnackbar('Error changing avatar. Please try again.', 'error');
            }
        );
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
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

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

        transition: background-color var(--transition-duration), opacity var(--transition-duration);

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

    .core-avatar-container {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .core-avatar-cycle {
        font-size: 24px;
        color: var(--grey-800);
        cursor: pointer;
        user-select: none;

        transition: color var(--transition-duration);

        &:hover {
            color: var(--primary-dark);
        }
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
                {#if currMember.pings.length > 0 && getUnreadCount(currMember.pings) > 0}
                    <Badge>{getUnreadCount(currMember.pings)}</Badge>
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
                        <div class="core-ping-container" style="{i == currMember.pings.length - 1 ? 'border-bottom: none;' : ''} opacity: {ping.read ? 0.5 : 1}">
                            <div class="core-ping-title" style="color: {getPingColor(ping)}">{ping.title}</div>
                            <div class="core-ping-time">{StringHelper.getFormattedDate(ping.createdAt)}</div>
                            <div class="core-ping-message">{ping.message}</div>
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <!-- svelte-ignore a11y-missing-attribute -->
                            <a class="core-ping-mark-read" on:click={() => markPing(ping, !ping.read)}>
                                <span class="material-symbols-rounded">
                                    {#if ping.read}
                                        mark_email_unread
                                    {:else}
                                        mark_email_read
                                    {/if}
                                </span>
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
            <a on:click={toggleAvatar}>
                <span class="core-header-icon material-symbols-rounded">account_circle</span>
            </a>
            {#if currMember}
                <Menu bind:open={avatarOpen} right="0" top="48px" width="80px">
                    <div class="core-avatar-container">
                        <span class="core-avatar-cycle material-symbols-rounded" on:click={() => cycleAvatar(false)}>chevron_left</span>
                        <Avatar member={currMember} size="48px" />
                        <span class="core-avatar-cycle material-symbols-rounded" on:click={() => cycleAvatar(true)}>chevron_right</span>
                    </div>
                </Menu>
            {/if}
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