import { TimeTick } from "../classes/ui/gantt/TimeTick";

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

    public static getNearestDate(date: Date, type: string): Date {
        if (type == TimeTick.MONTH) {
            return new Date(date.getFullYear(), date.getMonth());
        }
        if (type == TimeTick.WEEK) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
        }
        if (type == TimeTick.DAY) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        }
        if (type == TimeTick.HOUR) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours());
        }
        if (type == TimeTick.MINUTE) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
        }
        if (type == TimeTick.SECOND) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
        }
    }

    public static getFloorDate(date: Date, type: string): Date {
        if (type == TimeTick.MONTH) {
            return new Date(date.getFullYear(), date.getMonth());
        }
        if (type == TimeTick.WEEK) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
        }
        if (type == TimeTick.DAY) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        }
        if (type == TimeTick.HOUR) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours());
        }
        if (type == TimeTick.MINUTE) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
        }
        if (type == TimeTick.SECOND) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
        }
    }

    public static getCeilDate(date: Date, type: string): Date {
        if (type == TimeTick.MONTH) {
            return new Date(date.getFullYear(), date.getMonth() + 1);
        }
        if (type == TimeTick.WEEK) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 7);
        }
        if (type == TimeTick.DAY) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        if (type == TimeTick.HOUR) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() + 1);
        }
        if (type == TimeTick.MINUTE) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes() + 1);
        }
        if (type == TimeTick.SECOND) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds() + 1);
        }
    }

    public static isDateType(date: Date, type: string): boolean {
        if (type == TimeTick.MONTH) {
            return date.getDate() === 1 && date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0;
        }
        if (type == TimeTick.WEEK) {
            return date.getDay() === 0 && date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0;
        }
        if (type == TimeTick.DAY) {
            return date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0;
        }
        if (type == TimeTick.HOUR) {
            return date.getMinutes() === 0 && date.getSeconds() === 0;
        }
        if (type == TimeTick.MINUTE) {
            return date.getSeconds() === 0;
        }
        if (type == TimeTick.SECOND) {
            return true;
        }
        return false;
    }

    public static addDateType(date: Date, type: string, amount: number): Date {
        if (type == TimeTick.MONTH) {
            return new Date(date.getFullYear(), date.getMonth() + amount);
        }
        if (type == TimeTick.WEEK) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount * 7);
        }
        if (type == TimeTick.DAY) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
        }
        if (type == TimeTick.HOUR) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() + amount);
        }
        if (type == TimeTick.MINUTE) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes() + amount);
        }
        if (type == TimeTick.SECOND) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds() + amount);
        }
    }
}