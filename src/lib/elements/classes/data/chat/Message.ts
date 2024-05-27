import { CollectionReference, DocumentReference, getDoc, getDocs, query, where, type DocumentData } from "firebase/firestore";
import { Member } from "../project/Member";
import { getFirestoreCollection, getFirestoreDoc } from "$lib/elements/firebase/firebase";
import { DataConstants } from "../general/DataConstants";

export class Message {
    public id: string;

    public text: string;

    public senderId: string;
    public sender: Member = new Member({});

    public readIds: string[] = [];
    public reads: Member[] = [];

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

        this.readIds = data.readIds;
        if (!this.readIds) {
            this.readIds = [];
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

    public async getReads(): Promise<void> {
        this.reads = [];
        if (this.readIds && this.readIds.length > 0) {
            let membersCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('members');
            let clonedReadIds: string[] = this.readIds.slice();
            while (clonedReadIds.length > 0) {
                let batchReadIds = clonedReadIds.splice(0, DataConstants.MAX_BATCH_SIZE);
                let membersQuery = query(membersCollection, where('id', 'in', batchReadIds));
                await getDocs(membersQuery).then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        this.reads.push(new Member(doc.data()));
                    });
                });
            }
        } else {
            this.reads = [];
        }
    }

    public compactify(): any {
        return {
            id: this.id,
            text: this.text,
            senderId: this.senderId,
            readIds: this.readIds,
            replyId: this.replyId,
            createdAt: this.createdAt.getTime()
        };
    }
}