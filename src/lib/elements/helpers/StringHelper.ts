export class StringHelper {
    public static generateID(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    public static getEmailName(email: string): string {
        return email.split('@')[0];
    }

    public static getFormattedDate(date: Date): string {
        let today: Date = new Date();
        let yesterday: Date = new Date();
        yesterday.setDate(today.getDate() - 1);
        let dateStr: string = date.toDateString();
        let todayStr: string = today.toDateString();
        let yesterdayStr: string = yesterday.toDateString();
        if (dateStr === todayStr) {
            return 'Today at ' + StringHelper.getFormattedTime(date);
        } else if (dateStr === yesterdayStr) {
            return 'Yesterday at ' + StringHelper.getFormattedTime(date);
        } else {
            let month: number = date.getMonth() + 1;
            let day: number = date.getDate();
            let year: number = date.getFullYear();
            let hours: number = date.getHours();
            let minutes: number = date.getMinutes();
            let ampm: string = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            let minutesStr: string = minutes < 10 ? '0' + minutes : minutes.toString();
            return `${month}/${day}/${year} at ${hours}:${minutesStr} ${ampm}`;
        }
    }

    public static getFormattedTime(date: Date): string {
        let hours: number = date.getHours();
        let minutes: number = date.getMinutes();
        let ampm: string = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        let minutesStr: string = minutes < 10 ? '0' + minutes : minutes.toString();
        return `${hours}:${minutesStr} ${ampm}`;
    }

    public static getFormattedTimeLeft(date: Date): string {
        let now: Date = new Date();
        let diff: number = date.getTime() - now.getTime();
        let seconds: number = Math.floor(diff / 1000);
        let minutes: number = Math.floor(seconds / 60);
        let hours: number = Math.floor(minutes / 60);
        let days: number = Math.floor(hours / 24);
        if (days > 0) {
            return days + 'd';
        } else if (hours > 0) {
            return hours + 'h';
        } else if (minutes > 0) {
            return minutes + 'm';
        } else {
            return seconds + 's';
        }
    }

    public static getFormattedInputDateTimeLocal(date: Date): string {
        let month: number = date.getMonth() + 1;
        let day: number = date.getDate();
        let year: number = date.getFullYear();
        let hours: number = date.getHours();
        let minutes: number = date.getMinutes();
        let monthStr: string = month < 10 ? '0' + month : month.toString();
        let dayStr: string = day < 10 ? '0' + day : day.toString();
        let hoursStr: string = hours < 10 ? '0' + hours : hours.toString();
        let minutesStr: string = minutes < 10 ? '0' + minutes : minutes.toString();
        return `${year}-${monthStr}-${dayStr}T${hoursStr}:${minutesStr}`;
    }

    public static getShortMonth(date: Date): string {
        let month: number = date.getMonth() + 1;
        let year: number = date.getFullYear();
        return `${month}/${year}`;
    }
    
    public static getShortWeek(date: Date): string {
        let month: number = date.getMonth() + 1;
        let day: number = date.getDate();
        let year: number = date.getFullYear();
        return `${month}/${day}/${year}`;
    }

    public static getShortDay(date: Date): string {
        let month: number = date.getMonth() + 1;
        let day: number = date.getDate();
        let year: number = date.getFullYear();
        return `${month}/${day}`;
    }
}