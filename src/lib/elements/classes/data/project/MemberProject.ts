import { Timestamp } from "firebase/firestore";

export class MemberProject {
    public id: string;
    public memberId: string;
    public projectId: string;
    public isOwner: boolean;
    public hasJoined: boolean;
    public createdAt: Date;
    public createdAtTemp: any;

    public constructor(data: any) {
        this.id = data.id;
        
        this.memberId = data.memberId;

        this.projectId = data.projectId;
        
        this.isOwner = data.isOwner;
        if (this.isOwner == null || this.isOwner == undefined) {
            this.isOwner = false;
        }
            
        this.hasJoined = data.hasJoined;
        if (this.hasJoined == null || this.hasJoined == undefined) {
            this.hasJoined = false;
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
            isOwner: this.isOwner,
            hasJoined: this.hasJoined,
            createdAt: this.createdAtTemp ? this.createdAtTemp : Timestamp.fromDate(this.createdAt)
        };
    }
}