import { CollectionReference, getDoc, getDocs, query, Timestamp, where, type DocumentData, type DocumentReference } from "firebase/firestore";
import { Chat } from "../chat/Chat";
import { Member } from "./Member";
import { getFirestoreCollection, getFirestoreDoc } from "$lib/elements/firebase/firebase";
import { ProjectConstants } from "./ProjectConstants";
import { Task } from "../time/Task";
import { Occasion } from "../time/Occasion";

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

    public occasionIds: string[] = [];
    public occasions: Occasion[] = [];

    public createdAt: Date;
    public createdAtTemp: any;
    
    constructor(data: any) {
        this.id = data.id;
        if (!this.id) {
            this.id = "";
        }
        
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

        this.occasionIds = data.occasionIds;
        if (!this.occasionIds) {
            this.occasionIds = [];
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

    public async setObjects(): Promise<void> {        
        this.members = [];
        if (this.memberIds && this.memberIds.length > 0) {
            let membersCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('members');
            let membersQuery = query(membersCollection, where('id', 'in', this.memberIds));
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
        else {
            this.members = [];
        }

        if (this.chatId) {
            let chatDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('chats', this.chatId);
            await getDoc(chatDoc).then(async (doc) => {
                if (doc.exists()) {
                    this.chat = new Chat(doc.data());
                    await this.chat.setObjects();
                }
            });
        }
        else {
            this.chat = new Chat({});
        }

        this.tasks = [];
        if (this.taskIds && this.taskIds.length > 0) {
            let tasksCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('tasks');
            let tasksQuery = query(tasksCollection, where('id', 'in', this.taskIds));
            await getDocs(tasksQuery).then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    this.tasks.push(new Task(doc.data()));
                });
            });
        }
        else {
            this.tasks = [];
        }

        this.occasions = [];
        if (this.occasionIds && this.occasionIds.length > 0) {
            let occasionsCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('occasions');
            let occasionsQuery = query(occasionsCollection, where('id', 'in', this.occasionIds));
            await getDocs(occasionsQuery).then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    this.occasions.push(new Occasion(doc.data()));
                });
            });
        }
        else {
            this.occasions = [];
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
            occasionIds: this.occasionIds,
            
            createdAt: this.createdAtTemp ? this.createdAtTemp : Timestamp.fromDate(this.createdAt)
        };
    }
}