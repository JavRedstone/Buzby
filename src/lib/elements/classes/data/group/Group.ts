import { getDoc, type DocumentData, type DocumentReference } from "firebase/firestore";
import { Chat } from "../chat/Chat";
import { Member } from "./Member";
import { getFirestoreDoc } from "$lib/elements/firebase/firebase";

export class Group {
    public id: string;
    public name: string;
    public description: string;

    public memberIds: string[];
    public members: Member[] = [];
    
    public chatId: string;
    public chat: Chat = new Chat({});
    
    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;

        this.memberIds = data.memberIds;
        
        this.chatId = data.chatId;

        this.getObjects();
    }

    public getObjects(): void {
        this.members = [];
        if (this.memberIds) {
            for (let memberId of this.memberIds) {
                let membersDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('members', memberId);
                getDoc(membersDoc).then((doc) => {
                    if (doc.exists()) {
                        this.members.push(new Member(doc.data()));
                    }
                });
            }            
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