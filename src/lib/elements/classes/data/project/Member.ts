import { CollectionReference, getDocs, query, Timestamp, where, type DocumentData } from "firebase/firestore";
import { Ping } from "../chat/Ping";
import { MemberConstants } from "./MemberConstants";
import { getFirestoreCollection } from "$lib/elements/firebase/firebase";

export class Member {
    public id: string;
    
    public displayName: string;
    public email: string;

    public avatarBase: number = MemberConstants.AVATAR_BASES.ONLINE;
    public avatarHead: number = MemberConstants.AVATAR_HEADS.DEFAULT;
    public avatarEyes: number = MemberConstants.AVATAR_EYES.DEFAULT;
    public avatarNeck: number = MemberConstants.AVATAR_NECKS.DEFAULT;

    public avatarChoice: number = 0;

    public projectIds: string[];
    public requestedProjectIds: string[];
    
    public pingIds: string[];
    public pings: Ping[] = [];

    public createdAt: Date;
    public createdAtTemp: any;

    public constructor(data: any) {
        this.id = data.id;
        if (!this.id) {
            this.id = "";
        }
        
        this.displayName = data.displayName;
        if (!this.displayName) {
            this.displayName = "Anonymous";
        }
        this.email = data.email;
        if (!this.email) {
            this.email = "";
        }

        this.avatarBase = data.avatarBase;
        if (this.avatarBase == null || this.avatarBase == undefined) {
            this.avatarBase = MemberConstants.AVATAR_BASES.ONLINE;
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

        this.avatarChoice = data.avatarChoice;
        if (this.avatarChoice == null || this.avatarChoice == undefined) {
            this.avatarChoice = 0;
        }

        this.projectIds = data.projectIds;
        if (!this.projectIds) {
            this.projectIds = [];
        }
        this.requestedProjectIds = data.requestedProjectIds;
        if (!this.requestedProjectIds) {
            this.requestedProjectIds = [];
        }

        this.pingIds = data.pingIds;
        if (!this.pingIds) {
            this.pingIds = [];
        }

        if (data.createdAt) {
            this.createdAt = data.createdAt.toDate();
            if (!this.createdAt) {
                this.createdAt = new Date();
            }
        }
        else {
            this.createdAt = new Date();
        }

        this.createdAtTemp = data.createdAtTemp;
    }

    public async setObjects(): Promise<void> {
        this.pings = [];
        if (this.pingIds && this.pingIds.length > 0) {
            let pingsCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('pings');
            let pingsQuery = query(pingsCollection, where('id', 'in', this.pingIds));
            await getDocs(pingsQuery).then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    this.pings.push(new Ping(doc.data()));
                });
            });
        }
        else {
            this.pings = [];
        }
    }

    public compactify(): any {
        return {
            id: this.id,
            displayName: this.displayName,
            email: this.email,
            avatarBase: this.avatarBase,
            avatarHead: this.avatarHead,
            avatarEyes: this.avatarEyes,
            avatarNeck: this.avatarNeck,
            avatarChoice: this.avatarChoice,
            projectIds: this.projectIds,
            requestedProjectIds: this.requestedProjectIds,
            pingIds: this.pingIds,
            createdAt: this.createdAtTemp ? this.createdAtTemp : Timestamp.fromDate(this.createdAt)
        };
    }
}