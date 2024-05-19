import { CollectionReference, getDocs, query, where, type DocumentData } from "firebase/firestore";
import { Ping } from "../chat/Ping";
import { getFirestoreCollection } from "$lib/elements/firebase/firebase";

export class Member {
    public id: string;
    public displayName: string;
    public email: string;

    public avatarHat: number;
    public avatarGlasses: number;

    public projectIds: string[];
    
    public pingIds: string[];
    public pings: Ping[] = [];

    public createdAt: Date;

    public constructor(data: any) {
        this.id = data.id;
        this.displayName = data.displayName;
        this.email = data.email;

        this.avatarHat = data.avatarHat;
        this.avatarGlasses = data.avatarGlasses;

        this.projectIds = data.groupsIds;

        this.createdAt = data.createdAt;

        this.getObjects();
    }

    public getObjects(): void {
        this.pings = [];
        if (this.pingIds && this.pingIds.length > 0) {
            let pingsCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('pings');
            let pingsQuery = query(pingsCollection, where('id', 'in', this.pingIds));
            getDocs(pingsQuery).then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    this.pings.push(new Ping(doc.data()));
                });
            });
        }
    }
}