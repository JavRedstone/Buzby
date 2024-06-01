<script lang="ts">
	import { PingConstants } from '$lib/elements/classes/data/chat/PingConstants';
    import logo from '$lib/elements/assets/logo/logo.svg';
	import { RouteConstants } from "$lib/elements/classes/ui/core/RouteConstants";
	import { fade, fly } from "svelte/transition";
	import Dropdown from "../general/dropdown.svelte";
	import type { User } from "firebase/auth";
	import { onMount } from "svelte";
	import { authHandlers, userStatus } from "$lib/elements/stores/auth-store";
	import { auth, getFirestoreCollection, getFirestoreDoc } from "$lib/elements/firebase/firebase";
	import Snackbar from "../general/snackbar.svelte";
	import { ProjectConstants } from "$lib/elements/classes/data/project/ProjectConstants";
	import { allProjects, memberStatus, projectSelected } from "$lib/elements/stores/project-store";
	import { Project } from "$lib/elements/classes/data/project/Project";
	import { DocumentReference, getDoc, getDocs, query, setDoc, where, type CollectionReference, type DocumentData } from "firebase/firestore";
	import { TransitionConstants } from "$lib/elements/classes/ui/core/TransitionConstants";
	import { Member } from "$lib/elements/classes/data/project/Member";
	import Menu from "../general/menu.svelte";
	import type { Ping } from "$lib/elements/classes/data/chat/Ping";
	import { goto } from '$app/navigation';
	import Badge from '../general/badge.svelte';
	import { navigating } from '$app/stores';

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
    let projects: Project[] = [];
    let requestedProjects: Project[] = [];

    let pings: Ping[] = [];
    
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
        goto('/');
        projectSelected.update((value) => {
            value.projectName = defaultProjectName;
            value.project = null;
            return value;
        });
    }

    function autoRedirect(): void {
        navigating.subscribe((value) => {
            w = window;
            pathname = w.location.pathname;

            if (pathname != '/') {
                localStorage.setItem('selectedProjectId', '');
                localStorage.setItem('selectedProjectRoute', pathname);
            }
            history.forward();
        });
        if (selectedProjectName == defaultProjectName) {
            gotoHome(); // this works as it reloads page when manually changing link
        }
    }

    function getProjects(): void {
        if (currMember == null) return;
        let projectsCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('projects');
        let projectsQuery = null;
        if (currMember.projectIds.length == 0) {
            projectsQuery = query(projectsCollection, where('id', 'in', ['']));
        } else {
            projectsQuery = query(projectsCollection, where('id', 'in', currMember.projectIds));
        }
        
        let projectsClone: Project[] = [];

        getDocs(projectsQuery).then(
            async (querySnapshot) => {
                querySnapshot.forEach(
                    async (doc) => {
                        let project: Project = new Project(doc.data());
                        await project.setObjects();
                        if (projectsClone.find((p) => p.id == project.id) == null) {
                            projectsClone.push(project);
                        }

                        projectsClone.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

                        allProjects.update((value) => {
                            value.projects = projectsClone;
                            return value;
                        });
                    }
                );

                let prjs: Project[] = [];
                for (let doc of querySnapshot.docs) {
                    let prj: Project = new Project(doc.data());
                    prjs.push(prj);
                }
                prjs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

                let selectedProjectId: string = localStorage.getItem('selectedProjectId');
                let selectedProjectRoute: string = localStorage.getItem('selectedProjectRoute');

                for (let i = 0; i < prjs.length; i++) {
                    let project: Project = prjs[i];
                    if (selectedProjectId && selectedProjectId == project.id) {
                        selectedProject = project;
                        selectedProjectIdx = i + 1;
                        await selectedProject.setObjects();
                        projectSelected.update((value) => {
                            value.projectName = project.name;
                            value.project = project;
                            return value;
                        });
                        if (selectedProject) {
                            if (selectedProjectRoute) {
                                goto(selectedProjectRoute);
                            } else {
                                goto('/hive');
                            }
                        } else {
                            goto('/');
                        }
                    }
                }
            }
        ).catch(
            (error: any) => {
                openSnackbar('Error getting projects. Please try again later.', 'error');
            }
        );

        let requestedProjectsQuery = null;
        if (currMember.requestedProjectIds.length == 0) {
            requestedProjectsQuery = query(projectsCollection, where('id', 'in', ['']));
        } else {
            requestedProjectsQuery = query(projectsCollection, where('id', 'in', currMember.requestedProjectIds));
        }

        let requestedProjectsClone: Project[] = [];

        getDocs(requestedProjectsQuery).then(
            (querySnapshot) => {
                querySnapshot.forEach(
                    async (doc) => {
                        let requestedProject: Project = new Project(doc.data());
                        await requestedProject.setObjects();
                        if (requestedProjectsClone.find((p) => p.id == requestedProject.id) == null) {
                            requestedProjectsClone.push(requestedProject);
                        }

                        requestedProjectsClone.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

                        allProjects.update((value) => {
                            value.requestedProjects = requestedProjectsClone;
                            return value;
                        });
                    }
                );
            }
        ).catch(
            (error: any) => {
                openSnackbar('Error getting requested projects. Please try again later.', 'error');
            }
        );

        allProjects.subscribe((value) => {
            projects = value.projects;
            projectNames = [defaultProjectName];
            for (let project of projects) {
                projectNames = [...projectNames, project.name];
            }
            requestedProjects = value.requestedProjects;
        });

        projectSelected.subscribe((value) => {
            selectedProject = value.project;
            selectedProjectName = value.projectName;
            if (selectedProjectName == defaultProjectName) {
                sideOpen = false;
                drawerOpen = false;
            } else {
                selectedProjectIdx = projects.findIndex((p) => p.id == selectedProject.id) + 1;
                sideOpen = true;
                if (location.pathname == '/') {
                    goto('/hive');
                }
            }
            pingsOpen = false;
            projectSelectOpen = false;
        });
    }

    function toggleProjectSelect(): void {
        drawerOpen = false;
        pingsOpen = false;
    }

    function selectProject(): void {
        drawerOpen = false;
        pingsOpen = false;
        let project: Project = projects[selectedProjectIdx - 1];
        if (project || selectedProjectName == defaultProjectName) {
            selectedProject = project;
            projectSelected.update((value) => {
                value.projectName = selectedProjectName;
                value.project = project;
                return value;
            });
            if (selectedProjectName != defaultProjectName && location.pathname == '/') {
                goto('/hive');
            } else if (selectedProjectName == defaultProjectName) {
                goto('/');
            }
        }
        localStorage.setItem('selectedProjectId', selectedProject ? selectedProject.id : '');
        
        sideOpen = selectedProjectName != defaultProjectName;
    }

    function login(): void {
        drawerOpen = false;
        projectSelectOpen = false;
        pingsOpen = false;
        goto('/login');
    }

    function autoLogin(): void {
        auth.onAuthStateChanged(
            (user) => {
                if (user != null) {
                    userStatus.update((value) => {
                        value.currentUser = user;
                        return value;
                    });
                    currUser = user;

                    let memberDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('members', user.uid);
                    getDoc(memberDoc).then(
                        (doc) => {
                            if (doc.exists()) {
                                let member: Member = new Member(doc.data());
                                memberStatus.update((value) => {
                                    value.currentMember = member;
                                    return value;
                                });
                                currMember = member;

                                getProjects();
                                pings = member.pings;
                                pings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                            }
                        }
                    )
                } else {
                    // No user is signed in.
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
                    currUser = null;
                    currMember = null;
                    selectedProject = null;
                    selectedProjectName = defaultProjectName;
                    selectedProjectIdx = 0;
                    projectNames = [defaultProjectName];
                    projects = [];
                    requestedProjects = []; 
                    pings = [];

                    localStorage.removeItem('selectedProjectId');
                    localStorage.removeItem('selectedProjectRoute');
                    
                    allProjects.update((value) => {
                        value.projects = [];
                        value.requestedProjects = [];
                        return value;
                    });
                    projectSelected.update((value) => {
                        value.projectName = defaultProjectName;
                        value.project = null;
                        return value;
                    });
                    memberStatus.update((value) => {
                        value.currentMember = null;
                        return value;
                    });
                    userStatus.update((value) => {
                        value.currentUser = null;
                        return value;
                    });

                    openSnackbar('Logged out successfully. Good bye!', 'neutral');
                    goto('/').then(() => {
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

    function markPingRead(ping: Ping): void {
        drawerOpen = false;
        projectSelectOpen = false;

        currMember.pings = currMember.pings.filter((p) => p.id != ping.id);

        memberStatus.update((value) => {
            value.currentMember = currMember;
            return value;
        });
        pings = currMember.pings;

        let memberDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('members', currUser.uid);
        setDoc(memberDoc, currMember.compactify()).then(
            () => {
                openSnackbar('Notification marked as read.', 'neutral');
            }
        ).catch(
            (error: any) => {
                openSnackbar('Error marking notification as read. Please try again.', 'error');
            }
        );
    }

    function markAllPingsRead(): void {
        drawerOpen = false;
        projectSelectOpen = false;

        currMember.pings = [];
        memberStatus.update((value) => {
            value.currentMember = currMember;
            return value;
        });
        pings = currMember.pings;

        let memberDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('members', currUser.uid);
        setDoc(memberDoc, currMember.compactify()).then(
            () => {
                openSnackbar('All notifications marked as read.', 'neutral');
            }
        ).catch(
            (error: any) => {
                openSnackbar('Error marking notifications as read. Please try again.', 'error');
            }
        );
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
        background-color: var(--off-white);
    }

    .core-header-logo {
        position: absolute;
        top: 3px;
        left: 44px;
        height: 42px;
        cursor: pointer;
        user-select: none;
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
        left: 200px;
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
    <span class="core-header-icon material-symbols-rounded" style="left: 8px;" on:click={toggleDrawer}>
        {#if drawerOpen}
            close
        {:else if selectedProjectName != defaultProjectName}
            menu_open
        {:else}
            hexagon
        {/if}
    </span>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <img class="core-header-logo" src={logo} alt="logo" on:click={gotoHome} />
    {#if currUser == null || !currUser.emailVerified || currMember == null}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-missing-attribute -->
        <a on:click={login}>
            <span class="core-header-icon material-symbols-rounded" style="right: 8px;">login</span>
        </a>
    {:else}
        <div class="core-project-dropdown">
            <Dropdown label="Select project" items={projectNames} bind:defaultItem={defaultProjectName} bind:selectedItem={selectedProjectName} bind:selectedItemIdx={selectedProjectIdx} bind:open={projectSelectOpen} on:toggle={toggleProjectSelect} on:select={selectProject} />
        </div>
        <div class="core-header-icon-container" style="right: 108px;">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-missing-attribute -->
            <a on:click={togglePings}>
                <span class="core-header-icon material-symbols-rounded">notifications_active</span>
            </a>
            {#if pings.length > 0}
                <Badge>{pings.length}</Badge>
            {/if}
            <Menu bind:open={pingsOpen} right={PingConstants.CONTAINER.RIGHT} top={PingConstants.CONTAINER.TOP} width={PingConstants.CONTAINER.WIDTH} height={PingConstants.CONTAINER.HEIGHT}>
                <div class="core-pings-title">Notifications</div>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <!-- svelte-ignore a11y-missing-attribute -->
                <a class="core-pings-mark-all" on:click={markAllPingsRead}>
                    <span class="material-symbols-rounded">clear_all</span>
                </a>
                {#each pings as ping, i}
                    <div class="core-ping-container" style="{i == pings.length - 1 ? 'border-bottom: none;' : ''}">
                        <div class="core-ping-title" style="color: {ping.type == PingConstants.TYPES.PROJECT ? 'var(--primary-dark)' : ping.type == PingConstants.TYPES.USER ? 'var(--accent-dark);' : ping.type == PingConstants.TYPES.SYSTEM ? 'var(--grey-700);' : ping.type == PingConstants.TYPES.ERROR ? 'var(--error);' : 'var(--grey-700);'}">{ping.title}</div>
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
        </div>
        <div class="core-header-icon-container" style="right: 74px;">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-missing-attribute -->
            <a on:click={logout}>
                <span class="core-header-icon material-symbols-rounded">logout</span>
            </a>
        </div>
        <div class="core-header-icon-container" style="right: 40px;">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-missing-attribute -->
            <a on:click={editProfile}>
                <span class="core-header-icon material-symbols-rounded">account_circle</span>
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