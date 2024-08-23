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
            return new Date(date.getFullYear(), date.getMonth() + amount, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
        }
        if (type == TimeTick.WEEK) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount * 7, date.getHours(), date.getMinutes(), date.getSeconds());
        }
        if (type == TimeTick.DAY) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount, date.getHours(), date.getMinutes(), date.getSeconds());
        }
        if (type == TimeTick.HOUR) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() + amount, date.getMinutes(), date.getSeconds());
        }
        if (type == TimeTick.MINUTE) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes() + amount, date.getSeconds());
        }
        if (type == TimeTick.SECOND) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds() + amount);
        }
    }

    public static isSameDate(date1: Date, date2: Date, type: string): boolean {
        if (type == TimeTick.MONTH) {
            return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();
        }
        if (type == TimeTick.WEEK) {
            return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() - date1.getDay() === date2.getDate() - date2.getDay();
        }
        if (type == TimeTick.DAY) {
            return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
        }
        if (type == TimeTick.HOUR) {
            return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate() && date1.getHours() === date2.getHours();
        }
        if (type == TimeTick.MINUTE) {
            return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate() && date1.getHours() === date2.getHours() && date1.getMinutes() === date2.getMinutes();
        }
        if (type == TimeTick.SECOND) {
            return date1.getTime() === date2.getTime();
        }
    }

    public static getTimeDifference(date1: Date, date2: Date, type: string): number {
        if (type == TimeTick.MONTH) {
            return (date1.getFullYear() - date2.getFullYear()) * 12 + date1.getMonth() - date2.getMonth();
        }
        if (type == TimeTick.WEEK) {
            return (date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24 * 7);
        }
        if (type == TimeTick.DAY) {
            return (date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);
        }
        if (type == TimeTick.HOUR) {
            return (date1.getTime() - date2.getTime()) / (1000 * 60 * 60);
        }
        if (type == TimeTick.MINUTE) {
            return (date1.getTime() - date2.getTime()) / (1000 * 60);
        }
        if (type == TimeTick.SECOND) {
            return (date1.getTime() - date2.getTime()) / 1000;
        }
    }

    public static getTimeHours(date: Date): number {
        return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
    }

    public static getNearestTime(date: Date, intervalMins: number): Date {
        let mins: number = date.getMinutes() + date.getSeconds() / 60;
        let newMins: number = Math.round(mins / intervalMins) * intervalMins;
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), newMins);
    }

    public static getDateInputValue(date: Date): number {
        return date.getTime() - date.getTimezoneOffset() * 60000;
    }

    public static getDateFromInputValue(value: number): Date {
        return new Date(value + new Date().getTimezoneOffset() * 60000);
    }

    public static isOverlapping(startDate1, endDate1, startDate2, endDate2): boolean {
        return startDate1 < endDate2 && endDate1 > startDate2;
    }
}