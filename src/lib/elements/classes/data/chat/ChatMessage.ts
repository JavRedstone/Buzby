import { Member } from "../member/Member";

export class ChatMessage {
    public id: string;
    public text: string;

    public memberId: string;
    public member: Member = new Member({});

    public createdAt: Date;
    public updatedAt: Date;

    constructor(data: any) {
        this.id = data.id;
        this.text = data.text;

        this.memberId = data.memberId;

        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}