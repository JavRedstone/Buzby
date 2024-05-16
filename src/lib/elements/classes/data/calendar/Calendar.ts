import { CalendarEvent } from "./CalendarEvent";

export class Calendar {
    public id: string;
    public events: CalendarEvent[];
    
    public createdAt: Date;
    public updatedAt: Date;

    constructor(data: any) {
        this.id = data.id;
        this.events = data.events.map((event: any) => new CalendarEvent(event));

        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}