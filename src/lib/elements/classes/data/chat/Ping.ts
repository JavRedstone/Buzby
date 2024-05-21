export class Ping {
    public type: number;

    public title: string;
    public message: string;

    public read: boolean;

    public createdAt: Date;

    public constructor(data: any) {
        this.type = data.type;

        this.title = data.title;
        this.message = data.message;

        this.read = data.read;

        this.createdAt = data.createdAt;
    }

    public stringify(): any {
        return JSON.stringify({
            type: this.type,
            title: this.title,
            message: this.message,
            read: this.read,
            createdAt: this.createdAt
        });
    }
}