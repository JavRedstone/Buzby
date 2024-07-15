import { DisplayColor } from "./DisplayColor";


export class ProjectConstants {
    public static readonly DEFAULT_PROJECT_NAME: string = "Overview";

    public static readonly PROJECT_NAME_MAX_LENGTH: number = 50;
    public static readonly PROJECT_DESCRIPTION_MAX_LENGTH: number = 250;

    public static readonly MAX_NUM_PROJECTS: number = 15;
    public static readonly MAX_NUM_MEMBERS: number = 12;
    public static readonly MAX_NUM_TASKS: number = 30;
    public static readonly MAX_NUM_OCCASIONS: number = 30;

    public static readonly COLORS: DisplayColor[] = [
        new DisplayColor("Pink Camellia", "#e91e63", "var(--grey-100)"),
        new DisplayColor("Cardinal Flower", "#e74c3c", "var(--grey-100)"),
        new DisplayColor("Monarch Butterfly", "#e67e22", "var(--grey-100)"),
        new DisplayColor("Yellow Warbler", "#f1c40f", "var(--grey-800)"),
        new DisplayColor("Green Tree Python", "#2ecc71", "var(--grey-800)"),
        new DisplayColor("Eurasian Teal", "#1abc9c", "var(--grey-100)"),
        new DisplayColor("Blue Jay", "#3498db", "var(--grey-100)"),
        new DisplayColor("Orchid Dottyback", "#9b59b6", "var(--grey-100)"),
        new DisplayColor("African Elephant", "#95a5a6", "var(--grey-800)"),
        new DisplayColor("Silver Fox", "#607d8b", "var(--grey-100)"),
    ];

    public static findColorByName(name: string): DisplayColor {
        return ProjectConstants.COLORS.find(color => color.displayName === name);
    }

    public static findColorByHex(hex: string): DisplayColor {
        return ProjectConstants.COLORS.find(color => color.hex === hex);
    }
}