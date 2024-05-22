import { Ping } from "../chat/Ping";

export class Member {
    public id: string;
    public displayName: string;
    public email: string;

    public avatarHat: number;
    public avatarGlasses: number;

    public projectIds: string[];
    public requestedProjectIds: string[] = [];
    
    public pings: Ping[] = [];

    public createdAt: Date;

    public constructor(data: any) {
        this.id = data.id;
        this.displayName = data.displayName;
        if (!this.displayName) {
            this.displayName = "Anonymous";
        }
        this.email = data.email;
        if (!this.email) {
            this.email = "";
        }

        this.avatarHat = data.avatarHat;
        if (this.avatarHat == null || this.avatarHat == undefined) {
            this.avatarHat = 0;
        }
        this.avatarGlasses = data.avatarGlasses;
        if (this.avatarGlasses == null || this.avatarGlasses == undefined) {
            this.avatarGlasses = 0;
        }

        this.projectIds = data.projectIds;
        if (!this.projectIds) {
            this.projectIds = [];
        }
        this.requestedProjectIds = data.requestedProjectIds;
        if (!this.requestedProjectIds) {
            this.requestedProjectIds = [];
        }

        let dataPings = data.pings;
        if (dataPings) {
            dataPings.forEach(ping => {
                this.pings.push(new Ping(JSON.parse(ping)));
            });
        }
        else {
            this.pings = [];
        }

        this.createdAt = new Date(data.createdAt);
    }

    public compactify(): any {
        return {
            id: this.id,
            displayName: this.displayName,
            email: this.email,
            avatarHat: this.avatarHat,
            avatarGlasses: this.avatarGlasses,
            projectIds: this.projectIds,
            requestedProjectIds: this.requestedProjectIds,
            pings: this.pings ? this.pings.map(ping => ping.stringify()) : [],
            createdAt: this.createdAt.getTime()
        };
    }
}