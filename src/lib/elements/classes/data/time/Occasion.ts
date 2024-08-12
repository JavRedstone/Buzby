import { CollectionReference, DocumentReference, getDoc, onSnapshot, query, Timestamp, where, type DocumentData } from "firebase/firestore";
import { Member } from "../project/Member";
import { ProjectConstants } from "../project/ProjectConstants";
import { OccasionConstants } from "./OccasionConstants";
import { getFirestoreCollection, getFirestoreDoc } from "$lib/elements/firebase/firebase";
import { MemberOccasion } from "./MemberOccasion";

export class Occasion {
    public id: string;
    public projectId: string;
    public name: string;
    public description: string;
    public color: string;    
    public startTime: Date;
    public endTime: Date;

    public memberOccasions: MemberOccasion[] = [];
    public memberIds: string[] = [];
    public members: Member[] = [];

    constructor(data: any) {
        this.set(data);
    }

    public set(data: any) {
        this.id = data.id;

        this.name = data.name;
        if (!this.name) {
            this.name = "";
        }

        this.description = data.description;
        if (!this.description) {
            this.description = "";
        }

        this.color = data.color;
        if (!this.color) {
            this.color = ProjectConstants.COLORS[OccasionConstants.OCCASION_DEFAULT_COLOR_IDX].hex;
        }

        if (data.startTime) {
            if (data.startTime instanceof Timestamp) {
                this.startTime = data.startTime.toDate();
                if (!this.startTime) {
                    this.startTime = new Date();
                }
            }
            else if (data.startTime instanceof Date) {
                this.startTime = data.startTime;
            }
        }
        else {
            this.startTime = new Date();
        }

        if (data.endTime) {
            if (data.endTime instanceof Timestamp) {
                this.endTime = data.endTime.toDate();
                if (!this.endTime) {
                    this.endTime = new Date();
                }
            }
            else if (data.endTime instanceof Date) {
                this.endTime = data.endTime;
            }
        }
        else {
            this.endTime = new Date();
        }
    }

    public setObjects(): void {
        this.setMembers();
    }

    public setMembers(): void {
        let memberOccasionsCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('members');
        let memberOccasionsQuery = query(memberOccasionsCollection, where('occasionId', '==', this.id));
        onSnapshot(memberOccasionsQuery, (snapshot) => {
            let memberOccasions: MemberOccasion[] = [];
            let memberIds: string[] = [];
            let members: Member[] = [];
            snapshot.forEach((doc) => {
                let memberOccasion: MemberOccasion = new MemberOccasion(doc.data());

                let member: Member = new Member({});

                let memberDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('members', memberOccasion.memberId);
                onSnapshot(memberDoc, (doc) => {
                    member = new Member(doc.data());
                });

                memberIds.push(member.id);
                members.push(member);
            });
            this.memberIds = memberIds;
            this.members = members;

            this.memberOccasions = memberOccasions;
        });
    }

    public compactify(): any {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            color: this.color,
            startTime: this.startTime,
            endTime: this.endTime
        };
    }
}