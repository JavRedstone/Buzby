import avatarOne from '$lib/elements/assets/avatar/1.jpg';
import avatarTwo from '$lib/elements/assets/avatar/2.jpg';
import avatarThree from '$lib/elements/assets/avatar/3.jpg';
import avatarFour from '$lib/elements/assets/avatar/4.jpg';
import avatarFive from '$lib/elements/assets/avatar/5.jpg';

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

    public static readonly AVATAR_BASES: any = {
        OFFLINE: -1,
        ONLINE: 0,
        DND: 1,
    };

    public static readonly AVATAR_HEADS: any = {
        DEFAULT: -1,
        BOWTIE: 0,
        CROWN: 1,
        FEDORA: 2,
    };

    public static readonly AVATAR_EYES: any = {
        DEFAULT: -1,
        GLASSES: 0,
        MLG: 1,
    };

    public static readonly AVATAR_NECKS: any = {
        DEFAULT: -1,
        BOWTIE: 0,
        TIE: 1,
    };

    public static readonly AVATAR_CHOICES: string[] = [
        avatarOne,
        avatarTwo,
        avatarThree,
        avatarFour,
        avatarFive,
    ];
}