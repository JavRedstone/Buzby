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

    public static getDateFromStartofMinute(date: Date): Date {
        let newDate: Date = new Date(date);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);
        return newDate;
    }

    public static addMsToDate(date: Date, ms: number): Date {
        return new Date(date.getTime() + ms);
    }
}