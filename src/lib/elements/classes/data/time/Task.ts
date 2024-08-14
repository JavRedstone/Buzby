import { CollectionReference, getDoc, onSnapshot, query, Timestamp, where, type DocumentData, type DocumentReference } from "firebase/firestore";
import { Member } from "../project/Member";
import { getFirestoreCollection, getFirestoreDoc } from "$lib/elements/firebase/firebase";
import { MemberTask } from "./MemberTask";
import { currentMember } from "$lib/elements/stores/project-store";

export class Task {
    public id: string;
    public projectId: string;
    public name: string;
    public description: string;
    public percentage: number;
    public hiveX: number;
    public hiveY: number;
    public startDate: Date;
    public endDate: Date;

    public memberTasks: MemberTask[] = [];
    public memberIds: string[] = [];
    public members: Member[] = [];

    constructor(data: any) {
        this.set(data);
    }

    public set(data: any): void {
        this.id = data.id;
        if (!this.id) {
            this.id = '';
        }

        this.projectId = data.projectId;
        if (!this.projectId) {
            this.projectId = '';
        }

        this.name = data.name;
        if (!this.name) {
            this.name = "";
        }

        this.description = data.description;
        if (!this.description) {
            this.description = "";
        }

        this.percentage = data.percentage;
        if (this.percentage == null || this.percentage == undefined) {
            this.percentage = 0;
        }

        this.hiveX = data.hiveX;
        if (this.hiveX == null || this.hiveX == undefined) {
            this.hiveX = 0;
        }

        this.hiveY = data.hiveY;
        if (this.hiveY == null || this.hiveY == undefined) {
            this.hiveY = 0;
        }
        
        if (data.startDate) {
            if (data.startDate instanceof Timestamp) {
                this.startDate = data.startDate.toDate();
                if (!this.startDate) {
                    this.startDate = new Date();
                }
            }
            else if (data.startDate instanceof Date) {
                this.startDate = data.startDate;
            }
        }
        else {
            this.startDate = new Date();
        }

        if (data.endDate) {
            if (data.endDate instanceof Timestamp) {
                this.endDate = data.endDate.toDate();
                if (!this.endDate) {
                    this.endDate = new Date();
                }
            }
            else if (data.endDate instanceof Date) {
                this.endDate = data.endDate;
            }
        }
        else {
            this.endDate = new Date();
        }
    }

    public setObjects(): void {
        this.setMembers();
    }

    public setMembers(): void {
        let memberTasksCollection: CollectionReference<DocumentData, DocumentData> = getFirestoreCollection('members');
        let memberTasksQuery = query(memberTasksCollection, where('taskId', '==', this.id));
        onSnapshot(memberTasksQuery, (snapshot) => {
            let memberTasks: MemberTask[] = [];
            let members: Member[] = [];
            snapshot.forEach((doc) => {
                let memberTask: MemberTask = new MemberTask(doc.data());

                let member: Member = new Member({});

                let memberDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('members', memberTask.memberId);
                onSnapshot(memberDoc, (doc) => {
                    member ? member.set(doc.data()) : member = new Member(doc.data());

                    currentMember.update((value) => {
                        return value;
                    });
                });

                members.push(member);
            });
            this.members = members;

            this.memberTasks = memberTasks;

            currentMember.update((value) => {
                return value;
            });
        });
    }

    public compactify(): any {
        return {
            id: this.id,
            projectId: this.projectId,
            name: this.name,
            description: this.description,
            percentage: this.percentage,
            hiveX: this.hiveX,
            hiveY: this.hiveY,
            startDate: this.startDate,
            endDate: this.endDate
        };
    }
}