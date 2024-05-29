import { CollectionReference, getDocs, query, where, type DocumentData } from "firebase/firestore";
import { Message } from "./Message";
import { getFirestoreCollection } from "$lib/elements/firebase/firebase";
import { DataConstants } from "../general/DataConstants";

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

    public async setObjects(): Promise<void> {
        this.messages = [];
        if (this.messageIds && this.messageIds.length > 0) {
            let messagesCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('messages');
            let clonedMessageIds: string[] = JSON.parse(JSON.stringify(this.messageIds));
            while (clonedMessageIds.length > 0) {
                let batchMessageIds = clonedMessageIds.splice(0, DataConstants.MAX_BATCH_SIZE);
                let messagesQuery = query(messagesCollection, where('id', 'in', batchMessageIds));
                await getDocs(messagesQuery).then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        let message: Message = new Message(doc.data());
                        this.messages.push(message);
                    });

                    this.messages.sort((a, b) => {
                        return a.createdAt.getTime() - b.createdAt.getTime();
                    });
                });
            }
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