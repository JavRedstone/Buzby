export class ObjectHelper {
    public static pickRandom(arr: any[]): any {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    public static pickRandomKey(obj: any): string {
        return ObjectHelper.pickRandom(Object.keys(obj));
    }

    public static pickRandomValue(obj: any): any {
        return obj[ObjectHelper.pickRandomKey(obj)];
    }
}