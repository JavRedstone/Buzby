import { Timestamp } from "firebase/firestore";

export class Poll {
    public id: string;

    public question: string;

    public options: string[];
    public votes: number[];
    public votedMemberIds: string[];

    public multiple: boolean;
    public duration: number;

    public createdAt: Date;
    public createdAtTemp: any;

    constructor(data: any) {
        this.id = data.id;
        if (!this.id) {
            this.id = "";
        }
        
        this.question = data.question;
        if (!this.question) {
            this.question = "";
        }

        this.options = data.options;
        if (!this.options) {
            this.options = [];
        }

        this.votes = data.votes;
        if (!this.votes) {
            this.votes = [];
        }

        this.votedMemberIds = data.votedMemberIds;
        if (!this.votedMemberIds) {
            this.votedMemberIds = [];
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

    public compactify(): any {
        return {
            id: this.id,
            question: this.question,
            options: this.options,
            votes: this.votes,
            votedMemberIds: this.votedMemberIds,
            multiple: this.multiple,
            duration: this.duration,
            createdAt: this.createdAtTemp ? this.createdAtTemp : Timestamp.fromDate(this.createdAt)
        };
    }
}