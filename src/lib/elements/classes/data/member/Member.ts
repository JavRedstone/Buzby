export class Member {
    public id: string;
    public displayName: string;

    public avatarHat: number;
    public avatarGlasses: number;

    public groupsIds: string[];

    public createdAt: Date;
    public updatedAt: Date;

    public constructor(data: any) {
        this.id = data.id;
        this.displayName = data.displayName;

        this.avatarHat = data.avatarHat;
        this.avatarGlasses = data.avatarGlasses;

        this.groupsIds = data.groupsIds;

        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}