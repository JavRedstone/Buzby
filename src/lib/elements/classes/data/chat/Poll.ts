import { CollectionReference, getDoc, getDocs, onSnapshot, query, Timestamp, where, type DocumentData, type DocumentReference } from "firebase/firestore";
import { getFirestoreCollection, getFirestoreDoc } from "$lib/elements/firebase/firebase";
import { PollOption } from "./PollOption";

export class Poll {
    public id: string;
    public question: string;
    public multiple: boolean;
    public duration: number;
    public createdAt: Date;
    public createdAtTemp: any;

    public pollOptionIds: string[] = [];
    public pollOptions: PollOption[] = [];

    constructor(data: any) {
        this.set(data);
    }

    public set(data: any): void {
        this.id = data.id;
        
        this.question = data.question;
        if (!this.question) {
            this.question = "";
        }

        this.multiple = data.multiple;
        if (this.multiple == null || this.multiple == undefined) {
            this.multiple = false;
        }

        this.duration = data.duration;
        if (this.duration == null || this.duration == undefined) {
            this.duration = 0;
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
        let pollOptionsCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('pollOptions');
        let pollOptionsQuery = query(pollOptionsCollection, where('projectId', '==', this.id));
        onSnapshot(pollOptionsQuery, (snapshot) => {
            let pollOptionIds: string[] = [];
            let pollOptions: PollOption[] = [];
            snapshot.forEach((doc) => {
                let pollOption = new PollOption(doc.data());
            
                let pollOptionDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('pollOptions', pollOption.id);
                onSnapshot(pollOptionDoc, (doc) => {
                    pollOption = new PollOption(doc.data());
                    pollOption.setObjects();
                });

                pollOptionIds.push(pollOption.id);
                pollOptions.push(pollOption);
            });

            this.pollOptionIds = pollOptionIds;
            this.pollOptions = pollOptions;
        });
    }

    public compactify(): any {
        return {
            id: this.id,
            question: this.question,
            multiple: this.multiple,
            duration: this.duration,
            createdAt: this.createdAtTemp ? this.createdAtTemp : Timestamp.fromDate(this.createdAt)
        };
    }
}