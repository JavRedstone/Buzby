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

        this.getObjects();
    }

    public getObjects(): void {
        this.messages = [];
        if (this.messageIds && this.messageIds.length > 0) {
            let messagesCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('messages');
            let messagesQuery = query(messagesCollection, where('id', 'in', this.messageIds));
            getDocs(messagesQuery).then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    this.messages.push(new Message(doc.data()));
                });
            });
        }
    }
}