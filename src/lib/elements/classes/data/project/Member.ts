import { Ping } from "../chat/Ping";
import { MemberConstants } from "./MemberConstants";

export class Member {
    public id: string;
    
    public displayName: string;
    public email: string;

    public online: boolean = false;
    public avatarHead: number = 0;
    public avatarEyes: number = 0;
    public avatarNeck: number = 0;

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

        this.online = data.online;
        if (this.online == null || this.online == undefined) {
            this.online = false;
        }
        this.avatarHead = data.avatarHead;
        if (this.avatarHead == null || this.avatarHead == undefined) {
            this.avatarHead = MemberConstants.AVATAR_HEADS.DEFAULT;
        }
        this.avatarEyes = data.avatarEyes;
        if (this.avatarEyes == null || this.avatarEyes == undefined) {
            this.avatarEyes = MemberConstants.AVATAR_EYES.DEFAULT;
        }
        this.avatarNeck = data.avatarNeck;
        if (this.avatarNeck == null || this.avatarNeck == undefined) {
            this.avatarNeck = MemberConstants.AVATAR_NECKS.DEFAULT;
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
            online: this.online,
            avatarHead: this.avatarHead,
            avatarEyes: this.avatarEyes,
            avatarNeck: this.avatarNeck,
            projectIds: this.projectIds,
            requestedProjectIds: this.requestedProjectIds,
            pings: this.pings ? this.pings.map(ping => ping.stringify()) : [],
            createdAt: this.createdAt.getTime()
        };
    }
}