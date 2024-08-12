import { CollectionReference, DocumentReference, onSnapshot, query, Timestamp, where, type DocumentData } from "firebase/firestore";
import { Ping } from "../chat/Ping";
import { MemberConstants } from "./MemberConstants";
import { getFirestoreCollection, getFirestoreDoc } from "$lib/elements/firebase/firebase";
import { MemberProject } from "./MemberProject";
import { Project } from "./Project";
import { currentMember } from "$lib/elements/stores/project-store";

export class Member {
    public id: string;
    
    public displayName: string;
    public email: string;
    public statusBase: number = MemberConstants.STATUS_BASES.ONLINE;
    public statusHead: number = MemberConstants.STATUS_HEADS.DEFAULT;
    public statusEyes: number = MemberConstants.STATUS_EYES.DEFAULT;
    public statusNeck: number = MemberConstants.STATUS_NECKS.DEFAULT;
    public avatarChoice: number = MemberConstants.AVATAR_CHOICES.DEFAULT;
    public createdAt: Date;
    public createdAtTemp: any;

    public pingIds: string[] = [];
    public pings: Ping[] = [];
    
    public memberProjects: MemberProject[] = [];
    public projectIds: string[] = [];
    public projects: Project[] = [];
    public ownedProjectIds: string[] = [];
    public ownedProjects: Project[] = [];
    public joinedProjectIds: string[] = [];
    public joinedProjects: Project[] = [];
    public requestedProjectIds: string[] = [];
    public requestedProjects: Project[] = [];

    public constructor(data: any) {
        this.set(data);
    }

    public set(data: any): void {
        this.id = data.id;
        
        this.displayName = data.displayName;
        if (!this.displayName) {
            this.displayName = "Anonymous";
        }
        this.email = data.email;
        if (!this.email) {
            this.email = "";
        }

        this.statusBase = data.statusBase;
        if (this.statusBase == null || this.statusBase == undefined) {
            this.statusBase = MemberConstants.STATUS_BASES.ONLINE;
        }
        this.statusHead = data.statusHead;
        if (this.statusHead == null || this.statusHead == undefined) {
            this.statusHead = MemberConstants.STATUS_HEADS.DEFAULT;
        }
        this.statusEyes = data.statusEyes;
        if (this.statusEyes == null || this.statusEyes == undefined) {
            this.statusEyes = MemberConstants.STATUS_EYES.DEFAULT;
        }
        this.statusNeck = data.statusNeck;
        if (this.statusNeck == null || this.statusNeck == undefined) {
            this.statusNeck = MemberConstants.STATUS_NECKS.DEFAULT;
        }

        this.avatarChoice = data.avatarChoice;
        if (this.avatarChoice == null || this.avatarChoice == undefined) {
            this.avatarChoice = MemberConstants.AVATAR_CHOICES.DEFAULT;
        }

        if (data.createdAt) {
            this.createdAt = data.createdAt.toDate();
            if (!this.createdAt) {
                this.createdAt = new Date();
            }
        }
        else {
            this.createdAt = new Date();
        }

        this.createdAtTemp = data.createdAtTemp;
    }

    public setObjects(): void {
        this.setPings();
        this.setProjects();
    }

    public setPings(): void {
        let pingsCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('pings');
        let pingsQuery = query(pingsCollection, where('memberId', '==', this.id));
        onSnapshot(pingsQuery, (snapshot) => {
            let pings: Ping[] = [];
            snapshot.forEach((doc) => {
                let ping = new Ping(doc.data());
                pings.push(ping);
            });
            pings.sort((a, b) => {
                return a.createdAt.getTime() - b.createdAt.getTime();
            });
            this.pings = pings;
        });
    }

    public setProjects(): void {
        let memberProjectsCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('memberProjects');
        let memberProjectsQuery = query(memberProjectsCollection, where('memberId', '==', this.id));
        onSnapshot(memberProjectsQuery, (snapshot) => {
            let memberProjects: MemberProject[] = [];
            let projectIds: string[] = [];
            let projects: Project[] = [];
            let ownedProjectIds: string[] = [];
            let ownedProjects: Project[] = [];
            let joinedProjectIds: string[] = [];
            let joinedProjects: Project[] = [];
            let requestedProjectIds: string[] = [];
            let requestedProjects: Project[] = [];

            snapshot.forEach((doc) => {
                let memberProject = new MemberProject(doc.data());
                memberProjects.push(memberProject);
                
                let project: Project = new Project({});

                let projectDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('projects', memberProject.projectId);
                onSnapshot(projectDoc, (doc) => {
                    project ? project.set(doc.data()) : project = new Project(doc.data());
                    project.setObjects();
                });

                projectIds.push(project.id);
                projects.push(project);

                if (memberProject.isOwner) {
                    ownedProjectIds.push(project.id);
                    ownedProjects.push(project);
                }

                if (memberProject.hasJoined) {
                    joinedProjectIds.push(project.id);
                    joinedProjects.push(project);
                } else {
                    requestedProjectIds.push(project.id);
                    requestedProjects.push(project);
                }
            });

            this.memberProjects = memberProjects;
            this.projectIds = projectIds;
            this.projects = projects;
            this.ownedProjectIds = ownedProjectIds;
            this.ownedProjects = ownedProjects;
            this.joinedProjectIds = joinedProjectIds;
            this.joinedProjects = joinedProjects;
            this.requestedProjectIds = requestedProjectIds;
            this.requestedProjects = requestedProjects;

            this.projects.sort((a, b) => {
                return a.createdAt.getTime() - b.createdAt.getTime();
            });
        });
    }

    public compactify(): any {
        return {
            id: this.id,
            displayName: this.displayName,
            email: this.email,
            statusBase: this.statusBase,
            statusHead: this.statusHead,
            statusEyes: this.statusEyes,
            statusNeck: this.statusNeck,
            avatarChoice: this.avatarChoice,
            createdAt: this.createdAtTemp ? this.createdAtTemp : Timestamp.fromDate(this.createdAt)
        };
    }
}