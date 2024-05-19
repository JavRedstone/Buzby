<svelte:head>
    <title>Buzby | Login</title>
</svelte:head>
<script lang="ts">
    import type { UserCredential } from "firebase/auth";
	import { type DocumentData, setDoc, DocumentReference } from "firebase/firestore";
    import { getFirestoreDoc } from "$lib/elements/firebase/firebase";
	import { authHandlers, authStore } from "$lib/elements/stores/auth-store";
	import Snackbar from "$lib/elements/ui/general/snackbar.svelte";
	import { onMount } from 'svelte';
    let email: string = '';
    let password: string = '';

    let snackbarOpen: boolean = false;
    let snackbarText: string = '';
    let snackbarType: string = 'neutral';

    function checkUser(): void {
        authStore.subscribe((value: any) => {
            if (value.currentUser != null && value.currentUser.emailVerified) {
                window.location.href = '/';
            }
        });
    }

    function login(): void {
        try {
            authHandlers.login(email, password).then(
                (credential: UserCredential) => {
                    if (credential.user.emailVerified) {
                        let userDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('users', credential.user.uid);
                        setDoc(userDoc, { email: credential.user.email, uid: credential.user.uid, emailVerified: credential.user.emailVerified }).then(
                            () => {
                                openSnackbar('Logged in successfully. Welcome back!', 'success');
                                window.location.href = '/';
                            }
                        );
                    }
                    else {
                        openSnackbar('Please verify your email before logging in.', 'warning');
                    }
                }
            ).catch(
                (error: any) => {
                    if (error.code === 'auth/invalid-credential') {
                        openSnackbar('Credential is invalid. Please try again.', 'error');
                    }
                    else if (error.code === 'auth/invalid-email') {
                        openSnackbar('Email is invalid. Please try again.', 'error');
                    }
                    else if (error.code === 'auth/user-disabled') {
                        openSnackbar('This account has been disabled. Please try again.', 'error');
                    }
                    else if (error.code === 'auth/user-not-found') {
                        openSnackbar('This account does not exist. Please try again.', 'error');
                    }
                    else if (error.code === 'auth/wrong-password') {
                        openSnackbar('Password is incorrect. Please try again.', 'error');
                    }
                    else {
                        openSnackbar('Error logging in. Please try again.', 'error');
                    }
                }
            );
        }
        catch(error: any) {
            openSnackbar('Error logging in. Please try again.', 'error');
        }
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
    .login-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        user-select: none;
    }

    .login-form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding-left: 16px;
        padding-right: 16px;
        padding-bottom: 16px;
        border: 2px solid var(--gray-400);
        border-radius: 8px;
    }

    .login-title {
        font-size: 32px;
        color: var(--gray-800);
    }

    .login-input-container {
        width: 300px;
        height: 30px;
        margin-top: 16px;
    }

    .login-icon {
        float: left;
        font-size: 32px;
        color: var(--gray-800);
    }

    .login-input {
        float: right;
        width: 240px;
        padding-left: 8px;
        padding-top: 4px;
        padding-bottom: 4px;
        background-color: var(--off-white);
        outline: none;
        border: 2px solid var(--gray-400);
        border-radius: 4px;
        font-size: 16px;
        color: var(--gray-800);
        
        transition: border-color var(--transition-duration);

        &:hover {
            border-color: var(--primary-light);
        }

        &:focus {
            border-color: var(--primary);
        }
    }

    .login-button {
        width: 100%;
        margin-top: 16px;
        padding-top: 8px;
        padding-bottom: 8px;
        background-color: var(--primary-dark);
        color: var(--gray-100);
        border: none;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;

        transition: background-color var(--transition-duration);

        &:hover {
            background-color: var(--primary-darker);
        }
    }

    .login-signup {
        margin-top: 16px;
        font-size: 16px;
        color: var(--gray-800);
    }
</style>
<div class="login-container">
    <form class="login-form" on:submit|preventDefault={login}>
        <h1 class="login-title">Login</h1>
        <div class="login-input-container">
            <span class="login-icon material-symbols-rounded">mail</span>
            <input class="login-input" id="email" placeholder="Enter email" bind:value={email}>
        </div>
        <div class="login-input-container">
            <span class="login-icon material-symbols-rounded">password</span>
            <input class="login-input" type="password" id="password" placeholder="Enter password" bind:value={password}>
        </div>
        <button class="login-button" type="submit">Login</button>
        <div class="login-signup">New here? <a href="/signup">Sign up</a></div>
    </form>
</div>
<Snackbar text={snackbarText} type={snackbarType} bind:open={snackbarOpen} />