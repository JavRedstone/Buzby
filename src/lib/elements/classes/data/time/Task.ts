import type { Member } from "../project/Member";

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

        this.assignedIds = data.assigned;
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
        
        this.startDate = data.startDate;
        if (!this.startDate) {
            this.startDate = new Date();
        }

        this.endDate = data.endDate;
        if (!this.endDate) {
            this.endDate = new Date();
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