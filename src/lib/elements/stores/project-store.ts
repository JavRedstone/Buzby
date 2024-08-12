import { writable } from "svelte/store";
import { Member } from "../classes/data/project/Member";

export const projectSelected = writable<string>('');
export const currentMember = writable<Member>(null);