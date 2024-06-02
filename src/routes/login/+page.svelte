<svelte:head>
    <title>Buzby | Login</title>
</svelte:head>
<script lang="ts">
    import type { User, UserCredential } from "firebase/auth";
	import { authHandlers, userStatus } from "$lib/elements/stores/auth-store";
	import Snackbar from "$lib/elements/ui/general/snackbar.svelte";
	import { onMount } from 'svelte';
	import { goto } from "$app/navigation";
	import { RouteConstants } from "$lib/elements/classes/ui/core/RouteConstants";

    let email: string = '';
    let password: string = '';

    let currUser: User = null;

    let snackbarOpen: boolean = false;
    let snackbarText: string = '';
    let snackbarType: string = 'neutral';

    function checkUser(): void {
        userStatus.subscribe((value: any) => {
            if (value.currentUser != null && value.currentUser.emailVerified) {
                goto(RouteConstants.HOME);
            }
        });
    }

    function login(): void {
        try {
            authHandlers.login(email, password).then(
                (credential: UserCredential) => {
                    currUser = credential.user;
                    if (credential.user.emailVerified) {
                        openSnackbar('Logged in successfully. Welcome back!', 'success');
                        goto(RouteConstants.HOME);
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

    function sendVerificationEmail(): void {
        authHandlers.verifyEmail(currUser).then(
            () => {
                openSnackbar('Email verification sent. Please check your email to verify, then login.', 'success');
            }
        ).catch(
            (error: any) => {
                openSnackbar('Error sending email verification. Please try again.', 'error');
            }
        );
    }

    function forgotPassword(): void {
        authHandlers.forgotPassword(email).then(
            () => {
                openSnackbar('Password reset email sent. Please check your email to reset your password.', 'success');
            }
        ).catch(
            (error: any) => {
                openSnackbar('Error sending password reset email. Please try again.', 'error');
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
        border: 2px solid var(--grey-300);
        border-radius: 8px;
    }

    .login-title {
        font-size: 32px;
        color: var(--grey-800);
    }

    .login-input-container {
        width: 300px;
        height: 30px;
        margin-top: 16px;
    }

    .login-icon {
        float: left;
        font-size: 32px;
        color: var(--grey-800);
    }

    .login-input {
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
        color: var(--grey-100);
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
        color: var(--grey-800);
    }

    .login-forgot-password {
        margin-top: 4px;
        font-size: 12px;
        color: var(--grey-800);
        cursor: pointer;
    }
    
    .login-resend {
        margin-top: 4px;
        font-size: 12px;
        cursor: pointer;
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
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-missing-attribute -->
        <div class="login-forgot-password">Forgot password? <a on:click={forgotPassword}>Set a new one</a></div>
        {#if currUser != null}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-missing-attribute -->
            <a class="login-resend" on:click={sendVerificationEmail}>Resend verification email</a>
        {/if}
    </form>
</div>
<Snackbar type={snackbarType} bind:open={snackbarOpen}>{snackbarText}</Snackbar>