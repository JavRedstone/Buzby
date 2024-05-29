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

    public static getLastItem(arr: any[], ret: any = null): any {
        if (arr.length === 0) {
            return ret;
        }
        return arr[arr.length - 1];
    }
}