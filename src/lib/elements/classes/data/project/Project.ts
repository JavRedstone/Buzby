import { CollectionReference, getDoc, getDocs, onSnapshot, query, Timestamp, where, type DocumentData, type DocumentReference } from "firebase/firestore";
import { Member } from "./Member";
import { getFirestoreCollection, getFirestoreDoc } from "$lib/elements/firebase/firebase";
import { ProjectConstants } from "./ProjectConstants";
import { Task } from "../time/Task";
import { Occasion } from "../time/Occasion";
import { DataConstants } from "../general/DataConstants";
import { goto } from "$app/navigation";
import { Message } from "../chat/Message";
import { MemberProject } from "./MemberProject";
import { currentMember } from "$lib/elements/stores/project-store";

export class Project {
    public id: string;
    public name: string;
    public description: string;
    public color: string;
    public createdAt: Date;
    public createdAtTemp: any;

    public ownerId: string;
    public owner: Member;

    public memberProjects: MemberProject[] = [];
    public memberIds: string[] = [];
    public members: Member[] = [];
    public joinedMemberIds: string[] = [];
    public joinedMembers: Member[] = [];
    public requestedMemberIds: string[] = [];
    public requestedMembers: Member[] = [];

    public messages: Message[] = [];
    public tasks: Task[] = [];
    public occasions: Occasion[] = [];
    
    constructor(data: any) {
        this.set(data);
    }

    public set(data: any): void {
        this.id = data.id;
        if (!this.id) {
            this.id = '';
        }
        
        this.name = data.name;
        if (!this.name) {
            this.name = "Untitled";
        }
        this.description = data.description;
        if (!this.description) {
            this.description = "";
        }
        this.color = data.color;
        if (!this.color) {
            this.color = ProjectConstants.COLORS[0].hex;
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
        this.setMembers();
        this.setMessages();
        this.setTasks();
        this.setOccasions();
    }

    public setMembers(): void {
        let memberProjectCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('memberProjects');
        let memberProjectQuery = query(memberProjectCollection, where('projectId', '==', this.id));
        onSnapshot(memberProjectQuery, (snapshot) => {
            let memberProjects: MemberProject[] = [];
            let members: Member[] = [];
            let joinedMembers: Member[] = [];
            let requestedMembers: Member[] = [];

            snapshot.forEach((doc) => {
                let memberProject = new MemberProject(doc.data());
                memberProjects.push(memberProject);
                
                let member: Member = new Member({});

                let memberDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('members', memberProject.memberId);
                onSnapshot(memberDoc, (doc) => {
                    member ? member.set(doc.data()) : member = new Member(doc.data());
                    currentMember.update((value) => {
                        return value;
                    });
                });
                
                members.push(member);

                if (memberProject.isOwner) {
                    this.owner = member;
                }

                if (memberProject.hasJoined) {
                    joinedMembers.push(member);
                } else {
                    requestedMembers.push(member);
                }
            });
            this.memberProjects = memberProjects;
            this.members = members;
            this.joinedMembers = joinedMembers;
            this.requestedMembers = requestedMembers;

            currentMember.update((value) => {
                return value;
            });
        });
    }

    public setMessages(): void {
        let messagesCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('messages');
        let messagesQuery = query(messagesCollection, where('projectId', '==', this.id));
        onSnapshot(messagesQuery, (snapshot) => {
            let messages: Message[] = [];
            snapshot.forEach((doc) => {
                let message = new Message(doc.data());
            
                let messageDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('messages', message.id);
                onSnapshot(messageDoc, (doc) => {
                    message ? message.set(doc.data()) : message = new Message(doc.data());

                    currentMember.update((value) => {
                        return value;
                    });
                });

                messages.push(message);
            });

            this.messages = messages;

            currentMember.update((value) => {
                return value;
            });
        });
    }

    public setTasks(): void {
        let tasksCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('tasks');
        let tasksQuery = query(tasksCollection, where('projectId', '==', this.id));
        onSnapshot(tasksQuery, (snapshot) => {
            let tasks: Task[] = [];

            snapshot.forEach((doc) => {
                let task = new Task(doc.data());
                
                let taskDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('tasks', task.id);
                onSnapshot(taskDoc, (doc) => {
                    task ? task.set(doc.data()) : task = new Task(doc.data());

                    currentMember.update((value) => {
                        return value;
                    });
                });

                tasks.push(task);
            });

            this.tasks = tasks;

            currentMember.update((value) => {
                return value;
            });
        });
    }

    public setOccasions(): void {
        let occasionsCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('occasions');
        let occasionsQuery = query(occasionsCollection, where('projectId', '==', this.id));
        onSnapshot(occasionsQuery, (snapshot) => {
            let occasions: Occasion[] = [];
            snapshot.forEach((doc) => {
                let occasion = new Occasion(doc.data());
                
                let occasionDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('occasions', occasion.id);
                onSnapshot(occasionDoc, (doc) => {
                    occasion ? occasion.set(doc.data()) : occasion = new Occasion(doc.data());
                    occasion.setObjects();

                    currentMember.update((value) => {
                        return value;
                    });
                });

                occasions.push(occasion);
            });
            this.occasions = occasions;

            currentMember.update((value) => {
                return value;
            });
        });
    }

    public compactify(): any {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            color: this.color,            
            createdAt: this.createdAtTemp ? this.createdAtTemp : Timestamp.fromDate(this.createdAt)
        };
    }
}