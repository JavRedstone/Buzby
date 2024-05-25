export class Event {
    public id: string;
    public name: string;
    public description: string;

    public startTime: Date;
    public endTime: Date;

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

        this.startTime = new Date(data.startTime);
        if (!this.startTime) {
            this.startTime = new Date();
        }
        
        this.endTime = new Date(data.endTime);
        if (!this.endTime) {
            this.endTime = new Date();
        }
    }

    public compactify(): any {
        return {
            name: this.name,
            description: this.description,
            startTime: this.startTime.getTime(),
            endTime: this.endTime.getTime()
        };
    }
}