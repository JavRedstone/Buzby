export class Task {
    public id: string;
    public name: string;
    public description: string;
    
    public startDate: Date;
    public endDate: Date;

    public parentTaskId: string;
    
    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        
        this.startDate = data.start;
        this.endDate = data.end;

        this.parentTaskId = data.parentTaskId;
    }
}