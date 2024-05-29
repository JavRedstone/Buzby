export class StringHelper {
    public static generateID(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    public static getEmailName(email: string): string {
        return email.split('@')[0];
    }

    public static getFormattedDate(date: Date): string {
        // if it is yesterday or today, return "Yesterday" or "Today" + hh:mm AM/PM
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
}