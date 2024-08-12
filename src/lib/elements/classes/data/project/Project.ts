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

    public messageIds: string[] = [];
    public messages: Message[] = [];
    public taskIds: string[] = [];
    public tasks: Task[] = [];
    public occasionIds: string[] = [];
    public occasions: Occasion[] = [];
    
    constructor(data: any) {
        this.id = data.id;
        
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
            let memberIds: string[] = [];
            let members: Member[] = [];
            let joinedMemberIds: string[] = [];
            let joinedMembers: Member[] = [];
            let requestedMemberIds: string[] = [];
            let requestedMembers: Member[] = [];

            snapshot.forEach((doc) => {
                let memberProject = new MemberProject(doc.data());
                memberProjects.push(memberProject);
                
                let member: Member = new Member({});

                let memberDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('members', memberProject.memberId);
                onSnapshot(memberDoc, (doc) => {
                    member = new Member(doc.data());
                });
                
                memberIds.push(member.id);
                members.push(member);

                if (memberProject.isOwner) {
                    this.ownerId = member.id;
                    this.owner = member;
                }

                if (memberProject.hasJoined) {
                    joinedMemberIds.push(member.id);
                    joinedMembers.push(member);
                } else {
                    requestedMemberIds.push(member.id);
                    requestedMembers.push(member);
                }
            });
            this.memberProjects = memberProjects;
        });
    }

    public setMessages(): void {
        let messagesCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('messages');
        let messagesQuery = query(messagesCollection, where('projectId', '==', this.id));
        onSnapshot(messagesQuery, (snapshot) => {
            let messageIds: string[] = [];
            let messages: Message[] = [];
            snapshot.forEach((doc) => {
                let message = new Message(doc.data());
            
                let messageDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('messages', message.id);
                onSnapshot(messageDoc, (doc) => {
                    message = new Message(doc.data());
                });

                messageIds.push(message.id);
                messages.push(message);
            });

            this.messageIds = messageIds;
            this.messages = messages;
        });
    }

    public setTasks(): void {
        let tasksCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('tasks');
        let tasksQuery = query(tasksCollection, where('projectId', '==', this.id));
        onSnapshot(tasksQuery, (snapshot) => {
            let taskIds: string[] = [];
            let tasks: Task[] = [];

            snapshot.forEach((doc) => {
                let task = new Task(doc.data());
                
                let taskDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('tasks', task.id);
                onSnapshot(taskDoc, (doc) => {
                    task = new Task(doc.data());
                });

                taskIds.push(task.id);
                tasks.push(task);
            });

            this.taskIds = taskIds;
            this.tasks = tasks;
        });
    }

    public setOccasions(): void {
        let occasionsCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('occasions');
        let occasionsQuery = query(occasionsCollection, where('projectId', '==', this.id));
        onSnapshot(occasionsQuery, (snapshot) => {
            let occasionIds: string[] = [];
            let occasions: Occasion[] = [];
            snapshot.forEach((doc) => {
                let occasion = new Occasion(doc.data());
                
                let occasionDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('occasions', occasion.id);
                onSnapshot(occasionDoc, (doc) => {
                    occasion = new Occasion(doc.data());
                    occasion.setObjects();
                });

                occasionIds.push(occasion.id);
                occasions.push(occasion);
            });
            this.occasionIds = occasionIds;
            this.occasions = occasions;
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