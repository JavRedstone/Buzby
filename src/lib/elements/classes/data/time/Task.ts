import type { Member } from "../project/Member";

export class Task {
    public id: string = "";
    public name: string = "";
    public description: string = "";
    public percentage: number = 0;
    
    public startDate: Date;
    public endDate: Date;
    
    public assignedIds: string[] = [];
    public assigned: Member[] = [];

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

        this.assignedIds = data.assigned;
        if (!this.assignedIds) {
            this.assignedIds = [];
        }
    }

    public compactify(): any {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            percentage: this.percentage,
            start: this.startDate.getTime(),
            end: this.endDate.getTime(),
            assignedIds: this.assignedIds
        };
    }
}