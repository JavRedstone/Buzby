import { getFirestoreDoc } from "$lib/elements/firebase/firebase";
import type { DocumentData, DocumentReference } from "firebase/firestore";

export class Task {
    public id: string;
    public name: string;
    public description: string;
    public percentage: number;
    
    public startDate: Date;
    public endDate: Date;

    public parentId: string;
    public childIds: string[] = [];
    
    constructor(data: any) {
        this.id = data.id;

        this.name = data.name;
        if (!this.name) {
            this.name = "";
        }

        this.description = data.description;
        if (!this.description) {
            this.description = "";
        }

        this.percentage = data.percentage;
        if (!this.percentage) {
            this.percentage = 0;
        }
        
        this.startDate = new Date(data.start);
        if (!this.startDate) {
            this.startDate = new Date();
        }
        this.endDate = new Date(data.end);
        if (!this.endDate) {
            this.endDate = new Date();
        }

        this.parentId = data.parentTaskId;
        this.childIds = data.childTaskIds;
    }

    public compactify(): any {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            percentage: this.percentage,
            start: this.startDate.getTime(),
            end: this.endDate.getTime(),
            parentId: this.parentId,
            childIds: this.childIds
        };
    }
}