import { Timestamp } from "firebase/firestore";

export class Ping {
    public id: string;
    public memberId: string;
    public projectId: string;
    public messageId: string;
    public type: number;
    public title: string;
    public message: string;
    public read: boolean;
    public createdAt: Date;
    public createdAtTemp: any;

    public constructor(data: any) {
        this.set(data);
    }

    public set(data: any) {
        this.id = data.id;

        this.type = data.type;
        if (this.type == null || this.type == undefined) {
            this.type = 0;
        }

        this.title = data.title;
        if (!this.title) {
            this.title = "";
        }

        this.message = data.message;
        if (!this.message) {
            this.message = "";
        }

        this.read = data.read;
        if (this.read == null || this.read == undefined) {
            this.read = false;
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
            memberId: this.memberId,
            projectId: this.projectId,
            type: this.type,
            title: this.title,
            message: this.message,
            read: this.read,
            createdAt: this.createdAtTemp ? this.createdAtTemp : Timestamp.fromDate(this.createdAt)
        };
    }
}