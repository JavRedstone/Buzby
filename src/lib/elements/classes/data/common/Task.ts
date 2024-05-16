export class Task {
    public id: string;
    public name: string;
    public description: string;
    
    public start: Date;
    public end: Date;
    
    public createdAt: Date;
    public updatedAt: Date;
    
    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        
        this.start = data.start;
        this.end = data.end;
        
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}