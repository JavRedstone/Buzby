export class CalendarEvent {
    public name: string;
    public description: string;

    public startTime: Date;
    public endTime: Date;

    public createdAt: Date;
    public updatedAt: Date;

    constructor(data: any) {
        this.name = data.name;
        this.description = data.description;
        this.startTime = data.startTime;
        this.endTime = data.endTime;

        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}