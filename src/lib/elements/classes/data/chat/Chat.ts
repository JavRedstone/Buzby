import { getDoc, type DocumentData, type DocumentReference } from "firebase/firestore";
import { Message } from "./Message";
import { getFirestoreDoc } from "$lib/elements/firebase/firebase";

export class Chat {
    public id: string;
    
    public messageIds: string[];
    public messages: Message[] = [];
    
    public createdAt: Date;
    public updatedAt: Date;
    
    constructor(data: any) {
        this.id = data.id;

        this.messageIds = data.messageIds;
        
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;

        this.getObjects();
    }

    public getObjects(): void {
        this.messages = [];
        if (this.messageIds) {
            for (let messageId of this.messageIds) {
                let messageDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('messages', messageId);
                getDoc(messageDoc).then((doc) => {
                    if (doc.exists()) {
                        this.messages.push(new Message(doc.data()));
                    }
                });
            }
        }
    }
}