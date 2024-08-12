import { DocumentReference, getDoc, onSnapshot, Timestamp, type DocumentData } from "firebase/firestore";
import { Member } from "../project/Member";
import { getFirestoreDoc } from "$lib/elements/firebase/firebase";
import { Poll } from "./Poll";

export class Message {
    public id: string;
    public memberId: string;
    public pollId: string;
    public replyId: string;
    public text: string;
    public link: string;
    public linkName: string;
    public imageUrl: string;
    public videoUrl: string;
    public edited: boolean = false;
    public createdAt: Date;
    public createdAtTemp: any;
    
    public member: Member;
    public reply: Message;
    public poll: Poll;

    constructor(data: any) {
        this.id = data.id;
        
        this.memberId = data.memberId;

        this.replyId = data.replyId;

        this.pollId = data.pollId;

        this.text = data.text;
        if (!this.text) {
            this.text = "";
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
        else {
            this.createdAt = new Date();
        }

        this.createdAtTemp = data.createdAtTemp;
    }

    public setObjects(): void {
        this.setMember();
        this.setReply();
        this.setPoll();
    }

    public setMember(): void {
        if (this.memberId) {
            let memberDoc: DocumentReference<DocumentData> = getFirestoreDoc("members", this.memberId);
            onSnapshot(memberDoc, (doc) => {
                this.member = new Member(doc.data());
            });
        }
    }

    public setReply(): void {
        if (this.replyId) {
            let replyDoc: DocumentReference<DocumentData> = getFirestoreDoc("messages", this.replyId);
            onSnapshot(replyDoc, (doc) => {
                this.reply = new Message(doc.data());
            });
        }
    }

    public setPoll(): void {
        if (this.pollId) {
            let pollDoc: DocumentReference<DocumentData> = getFirestoreDoc("polls", this.pollId);
            onSnapshot(pollDoc, (doc) => {
                this.poll = new Poll(doc.data());
                this.poll.setObjects();
            });
        }
    }

    public compactify(): any {
        return {
            id: this.id,
            memberId: this.memberId,
            replyId: this.replyId,
            pollId: this.pollId,
            text: this.text,
            link: this.link,
            linkName: this.linkName,
            imageUrl: this.imageUrl,
            videoUrl: this.videoUrl,
            edited: this.edited,
            createdAt: this.createdAtTemp ? this.createdAtTemp : Timestamp.fromDate(this.createdAt)
        };
    }
}