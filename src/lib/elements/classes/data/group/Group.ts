import { Hive } from "../hive/Hive";
import type { Member } from "../member/Member";

export class Group {
    public id: string;
    public name: string;
    public description: string;
    
    public hiveId: string;
    public hive: Hive = new Hive({});
    public officeId: string;
    public calendarId: string;
    public ganttId: string;
    public chatId: string;

    public memberIds: string[];
    public members: Member[] = [];

    public createdAt: Date;
    public updatedAt: Date;
    
    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        
        this.hiveId = data.hiveId;
        this.officeId = data.officeId;
        this.calendarId = data.calendarId;
        this.ganttId = data.ganttId;
        this.chatId = data.chatId;

        this.memberIds = data.memberIds;

        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}