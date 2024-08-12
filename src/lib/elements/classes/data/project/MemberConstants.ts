export class MemberConstants {
    public static readonly REFRESH_TIMEOUT = 20000;

    public static readonly HEADS: string[] = [
        "None",
        "Bowtie",
        "Crown",
        "Fedora",
    ];

    public static readonly EYES: string[] = [
        "None",
        "Glasses",
        "MLG",
    ];

    public static readonly NECKS: string[] = [
        "None",
        "Bowtie",
        "Tie",
    ];

    public static readonly STATUS_BASES: any = {
        OFFLINE: -1,
        ONLINE: 0,
        DND: 1,
    };

    public static readonly STATUS_HEADS: any = {
        DEFAULT: -1,
        BOWTIE: 0,
        CROWN: 1,
        FEDORA: 2,
    };

    public static readonly STATUS_EYES: any = {
        DEFAULT: -1,
        GLASSES: 0,
        MLG: 1,
    };

    public static readonly STATUS_NECKS: any = {
        DEFAULT: -1,
        BOWTIE: 0,
        TIE: 1,
    };

    public static readonly AVATAR_CHOICES: any = {
        DEFAULT: -1,
    };
}