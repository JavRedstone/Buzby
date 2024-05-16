import type { ChatMessage } from "./ChatMessage";

export class Chat {
    public id: string;
    
    public messageIds: string[];
    public messages: ChatMessage[] = [];
    
    public createdAt: Date;
    public updatedAt: Date;
    
    constructor(data: any) {
        this.id = data.id;

        this.messageIds = data.messageIds;
        
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}