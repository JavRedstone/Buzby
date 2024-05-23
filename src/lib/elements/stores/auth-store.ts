import { writable } from "svelte/store";
import { auth } from "$lib/elements/firebase/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, type User, type UserCredential, sendPasswordResetEmail } from "firebase/auth";

export const userStatus = writable({
    currentUser: null
});

export const authHandlers = {
    signup: async function (email: string, password: string): Promise<UserCredential> {
        return await createUserWithEmailAndPassword(auth, email, password);
    },
    verifyEmail: async function (user: User): Promise<void> {
        return await sendEmailVerification(user);
    },
    forgotPassword: async function (email: string): Promise<void> {
        return await sendPasswordResetEmail(auth, email);
    },
    login: async function (email: string, password: string): Promise<UserCredential> {
        return await signInWithEmailAndPassword(auth, email, password);
    },
    logout: async function (): Promise<void> {
        return await signOut(auth);
    }
};