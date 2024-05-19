import { DocumentReference, getDoc, type DocumentData } from "firebase/firestore";
import { Member } from "../project/Member";
import { getFirestoreDoc } from "$lib/elements/firebase/firebase";

export class Message {
    public id: string;
    public text: string;

    public read: boolean;

    public memberId: string;
    public member: Member = new Member({});

    public sentAt: Date;

    constructor(data: any) {
        this.id = data.id;
        this.text = data.text;

        this.read = data.read;

        this.memberId = data.memberId;

        this.sentAt = data.sentAt;

        this.getObjects();
    }

    public getObjects(): void {
        if (this.memberId) {
            let membersDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('members', this.memberId);
            getDoc(membersDoc).then((doc) => {
                if (doc.exists()) {
                    this.member = new Member(doc.data());
                }
            });
        }
    }
}