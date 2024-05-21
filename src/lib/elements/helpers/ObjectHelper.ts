export class ObjectHelper {
    public static pickRandom(arr: any[]): any {
        return arr[Math.floor(Math.random() * arr.length)];
    }
}