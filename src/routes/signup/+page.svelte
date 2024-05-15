<svelte:head>
    <title>Buzby | Sign Up</title>
</svelte:head>
<script lang="ts">
    import type { UserCredential } from "firebase/auth";
	import { type DocumentData, setDoc, DocumentReference } from "firebase/firestore";
    import { getFirestoreDoc } from "$lib/elements/firebase/firebase";
	import { authHandlers } from "$lib/elements/stores/authstore";
	import Snackbar from "$lib/elements/ui/general/snackbar.svelte";
	import { SnackbarConstants } from "$lib/elements/classes/ui/snackbar/SnackbarConstants";
    let email: string = '';
    let password: string = '';
    
    let snackbarOpen: boolean = false;
    let snackbarText: string = '';
    let snackbarType: string = 'neutral';

    function signup(): void {
        try {
            authHandlers.signup(email, password).then(
                (credential: UserCredential) => {
                    let userDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('users', credential.user.uid);
                    setDoc(userDoc, { email: credential.user.email, uid: credential.user.uid, emailVerified: credential.user.emailVerified }).then(
                        () => {
                            authHandlers.verifyEmail(credential.user).then(
                                () => {
                                    openSnackbar('Signed up successfully. Please check your email for a verification link.', 'success');
                                    setTimeout(() => {
                                        window.location.href = '/login';
                                    }, SnackbarConstants.DURATION);
                                }
                            ).catch(
                                (error: any) => {
                                    openSnackbar('Error sending email verification. Please try again.', 'error');
                                }
                            );
                        }
                    );
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
    
    function openSnackbar(text: string, type: string): void {
        snackbarOpen = false;
        snackbarText = text;
        snackbarType = type;
        snackbarOpen = true;
    }
</script>
<style>
    .signup-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }

    .signup-form {
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

    .signup-title {
        font-size: 32px;
        color: var(--gray-800);
    }

    .signup-input-container {
        width: 300px;
        height: 30px;
        margin-top: 16px;
    }

    .signup-icon {
        float: left;
        font-size: 32px;
        color: var(--gray-800);
    }

    .signup-input {
        float: right;
        width: 240px;
        padding-left: 8px;
        padding-top: 4px;
        padding-bottom: 4px;
        background-color: var(--off-white);
        border: 2px solid var(--gray-400);
        border-radius: 4px;
        font-size: 16px;
        color: var(--gray-800);
    }

    .signup-button {
        width: 100%;
        margin-top: 16px;
        padding-top: 8px;
        padding-bottom: 8px;
        background-color: var(--accent-dark);
        color: var(--gray-100);
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
        color: var(--gray-800);
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
    </form>
</div>
<Snackbar open={snackbarOpen} text={snackbarText} type={snackbarType} />