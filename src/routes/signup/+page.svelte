<svelte:head>
    <title>Buzby | Sign Up</title>
</svelte:head>
<script lang="ts">
	import { StringHelper } from '$lib/elements/helpers/StringHelper';
    import type { User, UserCredential } from "firebase/auth";
	import { type DocumentData, setDoc, DocumentReference } from "firebase/firestore";
    import { getFirestoreDoc } from "$lib/elements/firebase/firebase";
	import { authHandlers, userStatus } from "$lib/elements/stores/auth-store";
	import Snackbar from "$lib/elements/ui/general/snackbar.svelte";
	import { onMount } from "svelte";
	import { memberStatus } from "$lib/elements/stores/project-store";
	import { Member } from "$lib/elements/classes/data/project/Member";
	import { goto } from '$app/navigation';

    let email: string = '';
    let password: string = '';

    let currUser: User = null;
    
    let snackbarOpen: boolean = false;
    let snackbarText: string = '';
    let snackbarType: string = 'neutral';
    
    function checkUser(): void {
        userStatus.subscribe((value: any) => {
            if (value.currentUser != null && value.currentUser.emailVerified) {
                goto('/');
            }
        });
    }

    function signup(): void {
        try {
            authHandlers.signup(email, password).then(
                (credential: UserCredential) => {
                    currUser = credential.user;
                    let memberDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('members', credential.user.uid);
                    let member: Member = new Member({
                        id: credential.user.uid,
                        displayName: credential.user.displayName == null ? StringHelper.getEmailName(credential.user.email) : credential.user.displayName,
                        email: credential.user.email.toLowerCase(),

                        avatarHat: 0,
                        avatarGlasses: 0,

                        projectIds: [],
                        requestedProjectIds: [],

                        pings: [],

                        createdAt: new Date(),
                    });
                    setDoc(memberDoc, member.compactify()).then(() => {
                        memberStatus.update((value) => {
                            value.currentMember = member;
                            return value;
                        });
                        sendVerificationEmail();
                    }).catch(() => {
                        openSnackbar('Error signing up. Please try again.', 'error');
                    });
                }
            ).catch(
                (error: any) => {
                    if (error.code === 'auth/email-already-in-use') {
                        openSnackbar('This email is already in use. Please try again.', 'error');
                    }
                    else if (error.code === 'auth/invalid-email') {
                        openSnackbar('Email is invalid. Please try again.', 'error');
                    }
                    else if (error.code === 'auth/operation-not-allowed') {
                        openSnackbar('Email/password accounts are not enabled. Please try again.', 'error');
                    }
                    else if (error.code === 'auth/weak-password') {
                        openSnackbar('Password is too weak. Please try again.', 'error');
                    }
                    else {
                        openSnackbar('Error signing up. Please try again.', 'error');
                    }
                }
            )
        }
        catch (error: any) {
            openSnackbar('Error signing up. Please try again.', 'error');
        }
    }

    function sendVerificationEmail(again: boolean = false): void {
        authHandlers.verifyEmail(currUser).then(
            () => {
                if (again) {
                    openSnackbar('Email verification sent. Please check your email to verify, then login.', 'success');
                } else {
                    openSnackbar('Signed up successfully. Please check your email to verify, then login.', 'success');
                }
            }
        ).catch(
            (error: any) => {
                openSnackbar('Error sending email verification. Please try again.', 'error');
            }
        );
    }
    
    function openSnackbar(text: string, type: string): void {
        snackbarText = text;
        snackbarType = type;
        snackbarOpen = true;
    }

    onMount(() => {
        checkUser();
    });
</script>
<style>
    .signup-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        user-select: none;
    }

    .signup-form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding-left: 16px;
        padding-right: 16px;
        padding-bottom: 16px;
        border: 2px solid var(--grey-300);
        border-radius: 8px;
    }

    .signup-title {
        font-size: 32px;
        color: var(--grey-800);
    }

    .signup-input-container {
        width: 300px;
        height: 30px;
        margin-top: 16px;
    }

    .signup-icon {
        float: left;
        font-size: 32px;
        color: var(--grey-800);
    }

    .signup-input {
        float: right;
        width: 240px;
        padding-left: 8px;
        padding-right: 8px;
        padding-top: 4px;
        padding-bottom: 4px;
        background-color: var(--off-white);
        outline: none;
        border: 2px solid var(--grey-300);
        border-radius: 4px;
        font-size: 16px;
        color: var(--grey-800);
        
        transition: border-color var(--transition-duration);

        &:hover {
            border-color: var(--accent-light);
        }

        &:focus {
            border-color: var(--accent);
        }
    }

    .signup-button {
        width: 100%;
        margin-top: 16px;
        padding-top: 8px;
        padding-bottom: 8px;
        background-color: var(--accent-dark);
        color: var(--grey-100);
        border: none;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;

        transition: background-color var(--transition-duration);

        &:hover {
            background-color: var(--accent-darker);
        }
    }

    .signup-signup {
        margin-top: 16px;
        font-size: 16px;
        color: var(--grey-800);
    }

    .signup-resend {
        margin-top: 4px;
        font-size: 12px;
        cursor: pointer;
    }
</style>
<div class="signup-container">
    <form class="signup-form" on:submit|preventDefault={signup}>
        <h1 class="signup-title">Sign Up</h1>
        <div class="signup-input-container">
            <span class="signup-icon material-symbols-rounded">mail</span>
            <input class="signup-input" type="email" id="email" placeholder="Enter email" bind:value={email} required>
        </div>
        <div class="signup-input-container">
            <span class="signup-icon material-symbols-rounded">password</span>
            <input class="signup-input" type="password" id="password" placeholder="Enter password" bind:value={password} required>
        </div>
        <button class="signup-button" type="submit">Sign Up</button>
        <div class="signup-signup">Returning? <a href="/login">Log In</a></div>
        {#if currUser != null}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-missing-attribute -->
            <a class="signup-resend" on:click={() => sendVerificationEmail(true)}>Resend verification email</a>
        {/if}
    </form>
</div>
<Snackbar type={snackbarType} bind:open={snackbarOpen}>{snackbarText}</Snackbar>