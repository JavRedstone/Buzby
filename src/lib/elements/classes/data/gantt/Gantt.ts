import { Task } from "../common/Task";

export class Gantt {
    public id: string;
    
    public taskIds: string[];
    public tasks: Task[] = [];

    public createdAt: Date;
    public updatedAt: Date;

    constructor(data: any) {
        this.id = data.id;

        this.taskIds = data.taskIds;

        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}