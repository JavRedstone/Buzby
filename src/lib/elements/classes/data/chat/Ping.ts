import { Timestamp } from "firebase/firestore";

export class Ping {
    public id: string;
    
    public type: number;
    public title: string;
    public message: string;

    public createdAt: Date;
    public createdAtTemp: any;

    public constructor(data: any) {
        this.id = data.id;

        this.type = data.type;

        this.title = data.title;
        if (!this.title) {
            this.title = "";
        }
        this.message = data.message;
        if (!this.message) {
            this.message = "";
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
            type: this.type,
            title: this.title,
            message: this.message,
            createdAt: this.createdAtTemp ? this.createdAtTemp : Timestamp.fromDate(this.createdAt)
        };
    }
}