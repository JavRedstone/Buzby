import { writable } from "svelte/store";
import { ProjectConstants } from "../classes/data/project/ProjectConstants";
import { Project } from "$lib/elements/classes/data/project/Project";

export const allProjects = writable({
    projects: [],
    requestedProjects: []
});

export const projectSelected = writable({
    projectName: ProjectConstants.DEFAULT_PROJECT_NAME,
    project: new Project({})
});

export const memberStatus = writable({
    currentMember: null
});