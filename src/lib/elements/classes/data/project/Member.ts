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
        this.email = data.email;

        this.avatarHat = data.avatarHat;
        this.avatarGlasses = data.avatarGlasses;

        this.projectIds = data.projectIds;
        this.requestedProjectIds = data.requestedProjectIds;

        let dataPings = data.pings;
        if (dataPings) {
            dataPings.forEach(ping => {
                this.pings.push(new Ping(ping));
            });
        }

        this.createdAt = data.createdAt;
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
            createdAt: this.createdAt
        };
    }
}