import { CollectionReference, DocumentReference, getDoc, getDocs, query, where, type DocumentData } from "firebase/firestore";
import { Member } from "../project/Member";
import { getFirestoreCollection, getFirestoreDoc } from "$lib/elements/firebase/firebase";
import { DataConstants } from "../general/DataConstants";

export class Message {
    public id: string;

    public text: string;

    public senderId: string;
    public sender: Member = new Member({});

    public replyId: string;
    public reply: Message;

    public createdAt: Date;

    constructor(data: any) {
        this.id = data.id;
        this.text = data.text;
        if (!this.text) {
            this.text = "";
        }

        this.senderId = data.senderId;
        if (!this.senderId) {
            this.senderId = "";
        }

        this.replyId = data.replyId;

        this.createdAt = new Date(data.createdAt);
    }

    public async getSender(): Promise<void> {
        if (this.senderId) {
            let membersDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('members', this.senderId);
            await getDoc(membersDoc).then((doc) => {
                if (doc.exists()) {
                    this.sender = new Member(doc.data());
                }
            });
        }
        else {
            this.sender = new Member({});
        }
    }

    public compactify(): any {
        return {
            id: this.id,
            text: this.text,
            senderId: this.senderId,
            replyId: this.replyId,
            createdAt: this.createdAt.getTime()
        };
    }
}