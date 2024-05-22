import { CollectionReference, getDocs, query, where, type DocumentData } from "firebase/firestore";
import { Message } from "./Message";
import { getFirestoreCollection } from "$lib/elements/firebase/firebase";

export class Chat {
    public id: string;
    
    public messageIds: string[];
    public messages: Message[] = [];
    
    constructor(data: any) {
        this.id = data.id;

        this.messageIds = data.messageIds;
        if (!this.messageIds) {
            this.messageIds = [];
        }
    }

    public async getObjects(): Promise<void> {
        this.messages = [];
        if (this.messageIds && this.messageIds.length > 0) {
            let messagesCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('messages');
            let messagesQuery = query(messagesCollection, where('id', 'in', this.messageIds));
            await getDocs(messagesQuery).then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    let message: Message = new Message(doc.data());
                    message.getObjects();
                    this.messages.push(message);
                });
            });
        }
        else {
            this.messages = [];
        }
    }

    public compactify(): any {
        return {
            id: this.id,
            messageIds: this.messageIds
        };
    }
}