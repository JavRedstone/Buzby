import { DocumentReference, getDoc, type DocumentData } from "firebase/firestore";
import { Member } from "../project/Member";
import { getFirestoreDoc } from "$lib/elements/firebase/firebase";

export class Message {
    public id: string;

    public text: string;
    public read: boolean;

    public memberId: string;
    public member: Member = new Member({});

    public createdAt: Date;

    constructor(data: any) {
        this.id = data.id;
        this.text = data.text;
        if (!this.text) {
            this.text = "";
        }

        this.read = data.read;
        if (this.read == null || this.read == undefined) {
            this.read = false;
        }

        this.memberId = data.memberId;
        if (!this.memberId) {
            this.memberId = "";
        }

        this.createdAt = new Date(data.createdAt);
    }

    public async getObjects(): Promise<void> {
        if (this.memberId) {
            let membersDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('members', this.memberId);
            await getDoc(membersDoc).then((doc) => {
                if (doc.exists()) {
                    this.member = new Member(doc.data());
                }
            });
        }
        else {
            this.member = new Member({});
        }
    }

    public compactify(): any {
        return {
            id: this.id,
            text: this.text,
            read: this.read,
            memberId: this.memberId,
            createdAt: this.createdAt.getTime()
        };
    }
}