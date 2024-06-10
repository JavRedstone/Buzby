import { getDoc, Timestamp, type DocumentData, type DocumentReference } from "firebase/firestore";
import { Member } from "../project/Member";
import { getFirestoreDoc } from "$lib/elements/firebase/firebase";

export class Task {
    public id: string;

    public name: string;
    public description: string;
    public percentage: number;
    
    public assignedIds: string[] = [];
    public assigned: Member[] = [];

    public hivePosX: number;
    public hivePosY: number;

    public startDate: Date;
    public endDate: Date;

    constructor(data: any) {
        this.id = data.id;
        if (!this.id) {
            this.id = "";
        }

        this.name = data.name;
        if (!this.name) {
            this.name = "";
        }

        this.description = data.description;
        if (!this.description) {
            this.description = "";
        }

        this.percentage = data.percentage;
        if (this.percentage == null || this.percentage == undefined) {
            this.percentage = 0;
        }

        this.assignedIds = data.assignedIds;
        if (!this.assignedIds) {
            this.assignedIds = [];
        }

        this.hivePosX = data.hivePosX;
        if (this.hivePosX == null || this.hivePosX == undefined) {
            this.hivePosX = 0;
        }

        this.hivePosY = data.hivePosY;
        if (this.hivePosY == null || this.hivePosY == undefined) {
            this.hivePosY = 0;
        }
        
        if (data.startDate) {
            if (data.startDate instanceof Timestamp) {
                this.startDate = data.startDate.toDate();
                if (!this.startDate) {
                    this.startDate = new Date();
                }
            }
            else if (data.startDate instanceof Date) {
                this.startDate = data.startDate;
            }
        }
        else {
            this.startDate = new Date();
        }

        if (data.endDate) {
            if (data.endDate instanceof Timestamp) {
                this.endDate = data.endDate.toDate();
                if (!this.endDate) {
                    this.endDate = new Date();
                }
            }
            else if (data.endDate instanceof Date) {
                this.endDate = data.endDate;
            }
        }
        else {
            this.endDate = new Date();
        }
    }

    public async getAssigned(assignedId: string): Promise<Member> {
        if (assignedId) {
            let membersDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('members', assignedId);
            await getDoc(membersDoc).then((doc) => {
                if (doc.exists()) {
                    return new Member(doc.data());
                }
            });
        }
        else {
            return new Member({});
        }
    }

    public compactify(): any {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            percentage: this.percentage,
            assignedIds: this.assignedIds,
            hivePosX: this.hivePosX,
            hivePosY: this.hivePosY,
            startDate: this.startDate,
            endDate: this.endDate
        };
    }
}