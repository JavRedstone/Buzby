import { CollectionReference, getDoc, getDocs, query, where, type DocumentData, type DocumentReference } from "firebase/firestore";
import { Chat } from "../chat/Chat";
import { Member } from "./Member";
import { getFirestoreCollection, getFirestoreDoc } from "$lib/elements/firebase/firebase";
import { ProjectConstants } from "./ProjectConstants";
import { Task } from "../time/Task";
import { Event } from "../time/Event";
import { DataConstants } from "../general/DataConstants";

export class Project {
    public id: string;
    
    public name: string;
    public description: string;
    public color: string;

    public ownerId: string;
    public owner: Member = new Member({});

    public memberIds: string[];
    public members: Member[] = [];

    public joinedMemberIds: string[];
    public joinedMembers: Member[] = [];
    
    public chatId: string;
    public chat: Chat = new Chat({});

    public taskIds: string[] = [];
    public tasks: Task[] = [];

    public eventIds: string[] = [];
    public events: Event[] = [];

    public createdAt: Date;
    
    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        if (!this.name) {
            this.name = "Unnamed Project";
        }
        this.description = data.description;
        if (!this.description) {
            this.description = "";
        }
        this.color = data.color;
        if (!this.color) {
            this.color = ProjectConstants.COLORS[0].hex;
        }

        this.ownerId = data.ownerId;
        if (!this.ownerId) {
            this.ownerId = "";
        }

        this.memberIds = data.memberIds;
        if (!this.memberIds) {
            this.memberIds = [];
        }
        this.joinedMemberIds = data.joinedMemberIds;
        if (!this.joinedMemberIds) {
            this.joinedMemberIds = [];
        }
        
        this.chatId = data.chatId;
        if (!this.chatId) {
            this.chatId = "";
        }

        this.taskIds = data.taskIds;
        if (!this.taskIds) {
            this.taskIds = [];
        }

        this.eventIds = data.eventIds;
        if (!this.eventIds) {
            this.eventIds = [];
        }

        this.createdAt = new Date(data.createdAt);
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }

    public async getObjects(): Promise<void> {        
        this.members = [];
        if (this.memberIds && this.memberIds.length > 0) {
            let membersCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('members');
            let clonedMemberIds: string[] = this.memberIds.slice();
            while (clonedMemberIds.length > 0) {
                let batchMemberIds = clonedMemberIds.splice(0, DataConstants.MAX_BATCH_SIZE);
                let membersQuery = query(membersCollection, where('id', 'in', batchMemberIds));
                await getDocs(membersQuery).then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        this.members.push(new Member(doc.data()));

                        if (doc.data().id === this.ownerId) {
                            this.owner = new Member(doc.data());
                        }

                        if (this.joinedMemberIds && this.joinedMemberIds.includes(doc.data().id)) {
                            this.joinedMembers.push(new Member(doc.data()));
                        }
                    });
                });
            }
        }
        else {
            this.members = [];
        }

        if (this.chatId) {
            let chatDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('chats', this.chatId);
            await getDoc(chatDoc).then(async (doc) => {
                if (doc.exists()) {
                    this.chat = new Chat(doc.data());
                    await this.chat.getObjects();
                }
            });
        }
        else {
            this.chat = new Chat({});
        }

        this.tasks = [];
        if (this.taskIds && this.taskIds.length > 0) {
            let tasksCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('tasks');
            let clonedTaskIds: string[] = this.taskIds.slice();
            while (clonedTaskIds.length > 0) {
                let batchTaskIds = clonedTaskIds.splice(0, DataConstants.MAX_BATCH_SIZE);
                let tasksQuery = query(tasksCollection, where('id', 'in', batchTaskIds));
                await getDocs(tasksQuery).then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        this.tasks.push(new Task(doc.data()));
                    });
                });
            }
        }
        else {
            this.tasks = [];
        }

        this.events = [];
        if (this.eventIds && this.eventIds.length > 0) {
            let eventsCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('events');
            let clonedEventIds: string[] = this.eventIds.slice();
            while (clonedEventIds.length > 0) {
                let batchEventIds = clonedEventIds.splice(0, DataConstants.MAX_BATCH_SIZE);
                let eventsQuery = query(eventsCollection, where('id', 'in', batchEventIds));
                await getDocs(eventsQuery).then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        this.events.push(new Event(doc.data()));
                    });
                });
            }
        }
        else {
            this.events = [];
        }
    }

    public compactify(): any {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            color: this.color,
            
            ownerId: this.ownerId,
            memberIds: this.memberIds,
            joinedMemberIds: this.joinedMemberIds,
            chatId: this.chatId,
            taskIds: this.taskIds,
            eventIds: this.eventIds,
            
            createdAt: this.createdAt.getTime()
        };
    }
}