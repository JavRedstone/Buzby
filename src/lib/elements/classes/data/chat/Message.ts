import { DocumentReference, getDoc, serverTimestamp, Timestamp, type DocumentData } from "firebase/firestore";
import { Member } from "../project/Member";
import { getFirestoreDoc } from "$lib/elements/firebase/firebase";

export class Message {
    public id: string;

    public text: string;

    public senderId: string;
    public sender: Member = new Member({});

    public replyId: string;
    public reply: Message;

    public edited: boolean = false;

    public createdAt: Date;
    public createdAtTemp: any;

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

        this.edited = data.edited;
        if (this.edited == null || this.edited == undefined) {
            this.edited = false;
        }

        if (data.createdAt) {
            this.createdAt = data.createdAt.toDate();
            if (!this.createdAt) {
                this.createdAt = new Date();
            }
        }

        this.createdAtTemp = data.createdAtTemp;
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
            edited: this.edited,
            createdAt: this.createdAtTemp ? this.createdAtTemp : Timestamp.fromDate(this.createdAt)
        };
    }
}