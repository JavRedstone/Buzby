import { DocumentReference, getDoc, onSnapshot, Timestamp, type DocumentData } from "firebase/firestore";
import { Member } from "../project/Member";
import { getFirestoreDoc } from "$lib/elements/firebase/firebase";
import { currentMember } from "$lib/elements/stores/project-store";

export class PollOption {
    public id: string;
    public pollId: string;
    public memberId: string;
    public text: string;
    public createdAt: Date;
    public createdAtTemp: any;

    public member: Member;

    public constructor(data: any) {
        this.set(data);
    }

    public set(data: any): void {
        this.id = data.id;
        if (!this.id) {
            this.id = '';
        }

        this.pollId = data.pollId;
        if (!this.pollId) {
            this.pollId = '';
        }

        this.memberId = data.memberId;
        if (!this.memberId) {
            this.memberId = '';
        }

        this.text = data.text;
        if (!this.text) {
            this.text = "";
        }

        if (data.createdAt) {
            this.createdAt = data.createdAt.toDate();
            if (!this.createdAt) {
                this.createdAt = new Date();
            }
        }
        else {
            this.createdAt = new Date();
        }

        this.createdAtTemp = data.createdAtTemp;
    }

    public setObjects(): void {
        if (this.memberId) {
            let memberDoc: DocumentReference<DocumentData> = getFirestoreDoc("members", this.memberId);
            onSnapshot(memberDoc, {
                includeMetadataChanges: true
            }, (doc) => {
                if (doc.exists()) {
                    this.member = new Member(doc.data());

                    currentMember.update((value) => {
                        return value;
                    });
                }
            });
        }
    }
    
    public compactify(): any {
        return {
            id: this.id,
            pollId: this.pollId,
            memberId: this.memberId,
            text: this.text,
            createdAt: this.createdAtTemp ? this.createdAtTemp : Timestamp.fromDate(this.createdAt)
        };
    }
}