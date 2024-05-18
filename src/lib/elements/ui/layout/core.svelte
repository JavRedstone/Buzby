<script lang="ts">
    import logo from "$lib/elements/assets/logo.svg";
	import { RouteConstants } from "$lib/elements/classes/ui/core/RouteConstants";
	import { fade, fly } from "svelte/transition";
	import Dropdown from "../general/dropdown.svelte";
	import type { User } from "firebase/auth";
	import { onMount } from "svelte";
	import { authHandlers, authStore } from "$lib/elements/stores/auth-store";
	import { auth, getFirestoreCollection, getFirestoreDoc } from "$lib/elements/firebase/firebase";
	import Snackbar from "../general/snackbar.svelte";
	import { SnackbarConstants } from "$lib/elements/classes/ui/snackbar/SnackbarConstants";
	import { GroupConstants } from "$lib/elements/classes/data/group/GroupConstants";
	import { groupSelected } from "$lib/elements/stores/group-store";
	import { Group } from "$lib/elements/classes/data/group/Group";
	import { getDocs, type CollectionReference, type DocumentData } from "firebase/firestore";
	import { TransitionConstants } from "$lib/elements/classes/ui/core/TransitionConstants";

    export let sideOpen: boolean = false;

    let drawerOpen: boolean = false;
    let groupSelectOpen: boolean = false;

    let defaultGroup: string = GroupConstants.DEFAULT_GROUP_NAME;
    let selectedGroup: string = defaultGroup;
    let groupNames: string[] = [defaultGroup];
    let groups: Group[] = [];
    
    let snackbarOpen: boolean = false;
    let snackbarText: string = '';
    let snackbarType: string = 'neutral';

    let currUser: User = null;

    function toggleDrawer(): void {
        if (selectedGroup == defaultGroup) {
            sideOpen = false;
        }
        else {
            sideOpen = true;
            drawerOpen = !drawerOpen;
            if (drawerOpen) {
                groupSelectOpen = false;
            }
        }
    }

    function getGroups(): void {
        let groupsCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('groups');
        groups = [];
        groupNames = [defaultGroup];
        getDocs(groupsCollection).then(
            (querySnapshot) => {
                querySnapshot.forEach(
                    (doc) => {
                        let group: Group = new Group(doc.data());
                        groups.push(group);
                        groupNames.push(group.name);
                    }
                );
            }
        ).catch(
            (error: any) => {
                openSnackbar('Error getting groups. Please try again later.', 'error');
            }
        );
    }

    function toggleGroupSelect(): void {
        drawerOpen = false;
    }

    function selectGroup(): void {
        drawerOpen = false;
        let group: Group = groups.find((group) => group.name == selectedGroup);
        if (group) {
            groupSelected.update((value) => {
                value.groupName = selectedGroup;
                value.group = group;
                return value;
            });
        }
        sideOpen = selectedGroup != defaultGroup;
    }

    function login(): void {
        drawerOpen = false;
        groupSelectOpen = false;
        window.location.href = "/login";
    }

    function autoLogin(): void {
        auth.onAuthStateChanged(
            (user) => {
                if (user != null) {
                    // User is signed in.
                    authStore.update((curr: any) => {
                        return {
                            ...curr,
                            isLoading: false,
                            currentUser: user,
                            userDoc: getFirestoreDoc('users', user.uid)
                        }
                    });
                    currUser = user;
                } else {
                    // No user is signed in.
                }
            }
        );
    }

    function logout(): void {
        drawerOpen = false;
        groupSelectOpen = false;
        try {
            authHandlers.logout().then(
                () => {
                    currUser = null;
                    openSnackbar('Logged out successfully. Good bye!', 'neutral');
                    window.location.href = '/';
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
        groupSelectOpen = false;
    }

    function openSnackbar(text: string, type: string): void {
        snackbarText = text;
        snackbarType = type;
        snackbarOpen = true;
    }

    onMount(() => {
        autoLogin();
        getGroups();
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

    .core-server-dropdown {
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
        color: var(--gray-700);
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
        padding: 7px;
        margin: 6px;
        margin-bottom: 12px;
        border-radius: 8px;
        color: var(--gray-700);
        
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
</style>
<div class="core-header-container">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span class="core-header-icon material-symbols-rounded" style="left: 8px;" on:click={toggleDrawer}>
        {#if drawerOpen}
            close
        {:else if selectedGroup != defaultGroup}
            menu_open
        {:else}
            hexagon
        {/if}
    </span>
    <a href="/">
        <img class="core-header-logo" src={logo} alt="logo" />
    </a>
    <div class="core-server-dropdown">
        <Dropdown label="Select group" items={groupNames} bind:defaultItem={defaultGroup} bind:selectedItem={selectedGroup} bind:open={groupSelectOpen} on:toggle={toggleGroupSelect} on:select={selectGroup} />
    </div>
    {#if currUser == null}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-missing-attribute -->
        <a on:click={login}>
            <span class="core-header-icon material-symbols-rounded" style="right: 8px;">login</span>
        </a>
    {:else}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-missing-attribute -->
        <a on:click={logout}>
            <span class="core-header-icon material-symbols-rounded" style="right: 42px;">logout</span>
        </a>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-missing-attribute -->
        <a on:click={editProfile}>
            <span class="core-header-icon material-symbols-rounded" style="right: 8px;">account_circle</span>
        </a>
    {/if}
</div>
{#if drawerOpen && selectedGroup != defaultGroup}
    <div class="core-drawer-left-container" transition:fly={{ x: -115, duration: TransitionConstants.DURATION }}>
        {#each RouteConstants.ALL_ROUTES as routeItem}
            <a class="core-drawer-link" href={routeItem.route} on:click={() => drawerOpen = false}>{routeItem.name}</a>
        {/each}
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="core-drawer-right-container" on:click={() => drawerOpen = false} transition:fade={{ duration: TransitionConstants.DURATION }}></div>
{/if}
{#if sideOpen}
    <div class="core-drawer-left-container-small" transition:fly={{ x: -50, duration: TransitionConstants.DURATION }}>
        {#each RouteConstants.ALL_ROUTES as routeItem}
            <a href={routeItem.route} on:click={() => drawerOpen = false}>
                <span class="core-drawer-icon material-symbols-rounded">{routeItem.icon}</span>
            </a>
        {/each}
    </div>
{/if}
<Snackbar text={snackbarText} type={snackbarType} bind:open={snackbarOpen} />