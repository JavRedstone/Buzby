import type { Member } from "../project/Member";

export class Event {
    public id: string;
    public name: string;
    public description: string;

    public assignedIds: string[];
    public assigned: Member[];
    
    public startTime: Date;
    public endTime: Date;

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

        this.assignedIds = data.assignedIds;

        this.startTime = data.startTime;
        if (!this.startTime) {
            this.startTime = new Date();
        }

        this.endTime = data.endTime;
        if (!this.endTime) {
            this.endTime = new Date();
        }
    }

    public compactify(): any {
        return {
            name: this.name,
            description: this.description,
            assignedIds: this.assignedIds,
            startTime: this.startTime,
            endTime: this.endTime
        };
    }
}