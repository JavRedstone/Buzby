import { Timestamp } from "firebase/firestore";

export class Poll {
    public id: string;

    public question: string;

    public options: string[];

    public votes: number[];

    public createdAt: Date;
    public createdAtTemp: any;

    constructor(data: any) {
        this.id = data.id;
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

        if (data.createdAt) {
            this.createdAt = data.createdAt.toDate();
            if (!this.createdAt) {
                this.createdAt = new Date();
            }
        }

        this.createdAtTemp = data.createdAtTemp;
    }

    public compactify(): any {
        return {
            id: this.id,
            question: this.question,
            options: this.options,
            votes: this.votes,
            createdAt: this.createdAtTemp ? this.createdAtTemp : Timestamp.fromDate(this.createdAt)
        };
    }
}