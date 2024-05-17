export class Event {
    public name: string;
    public description: string;

    public startTime: Date;
    public endTime: Date;

    constructor(data: any) {
        this.name = data.name;
        this.description = data.description;

        this.startTime = data.startTime;
        this.endTime = data.endTime;
    }
}