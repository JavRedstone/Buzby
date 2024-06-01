export class Ping {
    public id: string;
    
    public type: number;
    public title: string;
    public message: string;

    public createdAt: Date;

    public constructor(data: any) {
        this.id = data.id;

        this.type = data.type;

        this.title = data.title;
        if (!this.title) {
            this.title = "";
        }
        this.message = data.message;
        if (!this.message) {
            this.message = "";
        }

        this.createdAt = new Date(data.createdAt);
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }

    public stringify(): any {
        return JSON.stringify({
            id: this.id,
            type: this.type,
            title: this.title,
            message: this.message,
            createdAt: this.createdAt.getTime()
        });
    }
}