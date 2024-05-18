import { SnackbarType } from "./SnackbarType";

export class SnackbarConstants {
    public static readonly DURATION: number = 3000;
    public static readonly TYPES: SnackbarType[] = [
        new SnackbarType("success", "var(--success)"),
        new SnackbarType("error", "var(--error"),
        new SnackbarType("warning", "var(--warning)"),
        new SnackbarType("neutral", "var(--gray-800)")
    ];

    public static getTypeByName(name: string): SnackbarType {
        let found: SnackbarType | undefined = SnackbarConstants.TYPES.find((type: SnackbarType) => type.name === name);
        return found ? found : SnackbarConstants.TYPES[SnackbarConstants.TYPES.length - 1];
    }
}