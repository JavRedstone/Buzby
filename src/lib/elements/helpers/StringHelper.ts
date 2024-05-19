export class StringHelper {
    public static generateID(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    public static getEmailName(email: string): string {
        return email.split('@')[0];
    }
}