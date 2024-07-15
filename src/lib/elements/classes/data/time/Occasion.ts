import { Timestamp } from "firebase/firestore";
import type { Member } from "../project/Member";
import { ProjectConstants } from "../project/ProjectConstants";
import { OccasionConstants } from "./OccasionConstants";

export class Occasion {
    public id: string;
    public name: string;
    public description: string;
    public color: string;

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

        this.color = data.color;
        if (!this.color) {
            this.color = ProjectConstants.COLORS[OccasionConstants.OCCASION_DEFAULT_COLOR_IDX].hex;
        }

        this.assignedIds = data.assignedIds;

        if (data.startTime) {
            if (data.startTime instanceof Timestamp) {
                this.startTime = data.startTime.toDate();
                if (!this.startTime) {
                    this.startTime = new Date();
                }
            }
            else if (data.startTime instanceof Date) {
                this.startTime = data.startTime;
            }
        }
        else {
            this.startTime = new Date();
        }

        if (data.endTime) {
            if (data.endTime instanceof Timestamp) {
                this.endTime = data.endTime.toDate();
                if (!this.endTime) {
                    this.endTime = new Date();
                }
            }
            else if (data.endTime instanceof Date) {
                this.endTime = data.endTime;
            }
        }
        else {
            this.endTime = new Date();
        }
    }

    public compactify(): any {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            color: this.color,
            assignedIds: this.assignedIds,
            startTime: this.startTime,
            endTime: this.endTime
        };
    }
}