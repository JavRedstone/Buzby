import { StringHelper } from "$lib/elements/helpers/StringHelper";

export class TimeTick {
    public static readonly MONTH = 'M';
    public static readonly WEEK = 'w';
    public static readonly DAY = 'd';
    public static readonly HOUR = 'h';
    public static readonly MINUTE = 'm';
    public static readonly SECOND = 's';

    public date: Date;
    public value: string;
    public type: string;

    constructor(date: Date, type: string) {
        this.date = date;
        this.setTickValue(date, type);
        this.type = type;
    }

    private setTickValue(date: Date, type: string): void {
        switch (type) {
            case TimeTick.MONTH:
                this.value = StringHelper.getShortMonth(date);
                break;
            case TimeTick.WEEK:
                this.value = StringHelper.getShortWeek(date);
                break;
            case TimeTick.DAY:
                this.value = StringHelper.getShortDay(date);
                break;
            case TimeTick.HOUR:
                this.value = date.getHours().toString();
                break;
            case TimeTick.MINUTE:
                this.value = date.getMinutes().toString();
                break;
            case TimeTick.SECOND:
                this.value = date.getSeconds().toString();
                break;
            default:
                this.value = '';
                break;
        }
    }
}