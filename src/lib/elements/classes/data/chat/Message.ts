import { DocumentReference, getDoc, Timestamp, type DocumentData } from "firebase/firestore";
import { Member } from "../project/Member";
import { getFirestoreDoc } from "$lib/elements/firebase/firebase";
import { Poll } from "./Poll";

export class Message {
    public id: string;

    public text: string;

    public senderId: string;
    public sender: Member = new Member({});

    public replyId: string;
    public reply: Message;

    public edited: boolean = false;

    public link: string;
    public linkName: string;

    public imageUrl: string;

    public videoUrl: string;

    public pollId: string;
    public poll: Poll;

    public createdAt: Date;
    public createdAtTemp: any;

    constructor(data: any) {
        this.id = data.id;
        if (!this.id) {
            this.id = "";
        }

        this.text = data.text;
        if (!this.text) {
            this.text = "";
        }

        this.senderId = data.senderId;
        if (!this.senderId) {
            this.senderId = "";
        }

        this.replyId = data.replyId;
        if (!this.replyId) {
            this.replyId = "";
        }

        this.edited = data.edited;
        if (this.edited == null || this.edited == undefined) {
            this.edited = false;
        }

        this.linkName = data.linkName;
        if (!this.linkName) {
            this.linkName = "";
        }
        this.link = data.link;
        if (!this.link) {
            this.link = "";
        }
        
        this.imageUrl = data.imageUrl;
        if (!this.imageUrl) {
            this.imageUrl = "";
        }

        this.videoUrl = data.videoUrl;
        if (!this.videoUrl) {
            this.videoUrl = "";
        }

        this.pollId = data.pollId;
        if (!this.pollId) {
            this.pollId = "";
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

    public async setObjects(): Promise<void> {
        if (this.pollId) {
            let pollsDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('polls', this.pollId);
            await getDoc(pollsDoc).then((doc) => {
                if (doc.exists()) {
                    this.poll = new Poll(doc.data());
                }
            });
        }
        else {
            this.poll = new Poll({});
        }
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
            link: this.link,
            linkName: this.linkName,
            imageUrl: this.imageUrl,
            videoUrl: this.videoUrl,
            pollId: this.pollId,
            createdAt: this.createdAtTemp ? this.createdAtTemp : Timestamp.fromDate(this.createdAt)
        };
    }
}