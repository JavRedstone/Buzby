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
    public avatarChoice: number = 0;
    public createdAt: Date;
    public createdAtTemp: any;

    public pingIds: string[] = [];
    public pings: Ping[] = [];
    
    public memberProjects: MemberProject[] = [];
    public projects: Project[] = [];
    public ownedProjects: Project[] = [];
    public joinedProjects: Project[] = [];
    public requestedProjects: Project[] = [];

    public constructor(data: any) {
        this.set(data);
    }

    public set(data: any): void {
        this.id = data.id;
        if (!this.id) {
            this.id = '';
        }
        
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
            this.avatarChoice = 0;
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
                let data = doc.data();
                
                let ping: Ping = new Ping({});
                if (data) {
                    ping ? ping.set(data) : ping = new Ping(data);
                }

                pings.push(ping);
            });

            this.pings = pings;
            
            this.pings.sort((a, b) => {
                if (a.read && !b.read) {
                    return 1;
                }
                if (!a.read && b.read) {
                    return -1;
                }
                return b.createdAt.getTime() - a.createdAt.getTime();
            });

            currentMember.update((value) => {
                return value;
            });
        });
    }

    public setProjects(): void {
        let memberProjectsCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('memberProjects');
        let memberProjectsQuery = query(memberProjectsCollection, where('memberId', '==', this.id));
        onSnapshot(memberProjectsQuery, (snapshot) => {
            let memberProjects: MemberProject[] = [];
            let projects: Project[] = [];
            let ownedProjects: Project[] = [];
            let joinedProjects: Project[] = [];
            let requestedProjects: Project[] = [];

            snapshot.forEach((doc) => {
                let memberProject = new MemberProject(doc.data());
                memberProjects.push(memberProject);
                
                let project: Project = new Project({});

                let projectDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('projects', memberProject.projectId);
                onSnapshot(projectDoc, {
                    includeMetadataChanges: true
                }, (doc) => {
                    if (doc.exists()) {
                        let data = doc.data();
                        if (data) {
                            project ? project.set(data) : project = new Project(data);
                            project.setObjects();
                        }

                        this.projects = projects.sort((a, b) => {
                            return b.createdAt.getTime() - a.createdAt.getTime();
                        });
                        this.ownedProjects = ownedProjects.sort((a, b) => {
                            return b.createdAt.getTime() - a.createdAt.getTime();
                        });
                        this.joinedProjects = joinedProjects.sort((a, b) => {
                            return b.createdAt.getTime() - a.createdAt.getTime();
                        });
                        this.requestedProjects = requestedProjects.sort((a, b) => {
                            return b.createdAt.getTime() - a.createdAt.getTime();
                        });

                        currentMember.update((value) => {
                            return value;
                        });
                    }
                });

                projects.push(project);

                if (memberProject.isOwner) {
                    ownedProjects.push(project);
                }

                if (memberProject.hasJoined) {
                    joinedProjects.push(project);
                } else {
                    requestedProjects.push(project);
                }
            });

            this.memberProjects = memberProjects;
            this.projects = projects;
            this.ownedProjects = ownedProjects;
            this.joinedProjects = joinedProjects;
            this.requestedProjects = requestedProjects;

            currentMember.update((value) => {
                return value;
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