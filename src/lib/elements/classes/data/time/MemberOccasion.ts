import { Timestamp } from "firebase/firestore";

export class MemberOccasion {
    public id: string;
    public memberId: string;
    public occasionId: string;
    public createdAt: Date;
    public createdAtTemp: any;

    public constructor(data: any) {
        this.id = data.id;
        
        this.memberId = data.memberId;

        this.occasionId = data.occasionId;

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
            occasionId: this.occasionId,
            createdAt: this.createdAtTemp ? this.createdAtTemp : Timestamp.fromDate(this.createdAt)
        };
    }
}