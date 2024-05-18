import { writable } from "svelte/store";
import { GroupConstants } from "../classes/data/group/GroupConstants";
import { Group } from "$lib/elements/classes/data/group/Group";

export const groupSelected = writable({
    groupName: GroupConstants.DEFAULT_GROUP_NAME,
    group: new Group({})
});

export const member = writable({
    member: null
});