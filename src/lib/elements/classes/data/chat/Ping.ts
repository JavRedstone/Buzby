export class Ping {
    public type: number;

    public title: string;
    public message: string;

    public read: boolean;

    public createdAt: Date;

    public constructor(data: any) {
        this.type = data.type;

        this.title = data.title;
        if (!this.title) {
            this.title = "";
        }
        this.message = data.message;
        if (!this.message) {
            this.message = "";
        }

        this.read = data.read;
        if (this.read == null || this.read == undefined) {
            this.read = false;
        }

        this.createdAt = new Date(data.createdAt);
    }

    public stringify(): any {
        return JSON.stringify({
            type: this.type,
            title: this.title,
            message: this.message,
            read: this.read,
            createdAt: this.createdAt.getTime()
        });
    }
}