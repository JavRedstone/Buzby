import { CollectionReference, getDoc, getDocs, query, where, type DocumentData, type DocumentReference } from "firebase/firestore";
import { Chat } from "../chat/Chat";
import { Member } from "./Member";
import { getFirestoreCollection, getFirestoreDoc } from "$lib/elements/firebase/firebase";

export class Project {
    public id: string;
    public name: string;
    public description: string;
    public color: string;

    public ownerId: string;
    public owner: Member = new Member({});

    public memberIds: string[];
    public members: Member[] = [];
    
    public chatId: string;
    public chat: Chat = new Chat({});

    public createdAt: Date;
    
    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.color = data.color;

        this.ownerId = data.ownerId;

        this.memberIds = data.memberIds;
        
        this.chatId = data.chatId;

        this.getObjects();
    }

    public getObjects(): void {
        if (this.ownerId) {
            let ownerDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('members', this.ownerId);
            getDoc(ownerDoc).then((doc) => {
                if (doc.exists()) {
                    this.owner = new Member(doc.data());
                }
            });            
        }
        
        this.members = [];
        if (this.memberIds && this.memberIds.length > 0) {
            let membersCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('members');
            let membersQuery = query(membersCollection, where('id', 'in', this.memberIds));
            getDocs(membersQuery).then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    this.members.push(new Member(doc.data()));
                });
            });
        }

        if (this.chatId) {
            let chatDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('chats', this.chatId);
            getDoc(chatDoc).then((doc) => {
                if (doc.exists()) {
                    this.chat = new Chat(doc.data());
                }
            });            
        }
    }
}