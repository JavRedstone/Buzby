import { RouteItem } from "./RouteItem";

export class RouteConstants {
    public static readonly HOME: string = "/";

    public static readonly OFFICE: string = "/office";
    public static readonly HIVE: string = "/hive";
    public static readonly GANTT: string = "/gantt";
    public static readonly CALENDAR: string = "/calendar";
    public static readonly CHAT: string = "/chat";

    public static readonly LOGIN: string = "/login";
    public static readonly LOGOUT: string = "/logout";
    public static readonly PROFILE: string = "/profile";

    public static readonly ALL_ROUTES: RouteItem[] = [
        new RouteItem(RouteConstants.HOME, "home", "Home"),

        new RouteItem(RouteConstants.HIVE, "hexagon", "Hive"),
        new RouteItem(RouteConstants.OFFICE, "group_work", "Office"),
        new RouteItem(RouteConstants.GANTT, "view_timeline", "Gantt"),
        new RouteItem(RouteConstants.CALENDAR, "event", "Calendar"),
        new RouteItem(RouteConstants.CHAT, "forum", "Chat"),

        new RouteItem(RouteConstants.LOGIN, "login", "Login"),
        new RouteItem(RouteConstants.LOGOUT, "logout", "Logout"),
        new RouteItem(RouteConstants.PROFILE, "account_circle", "Profile"),
    ];

    public static readonly IMPORTANT_ROUTES: RouteItem[] = [
        new RouteItem(RouteConstants.HIVE, "hive", "Hive"),
        new RouteItem(RouteConstants.OFFICE, "group_work", "Office"),
        new RouteItem(RouteConstants.GANTT, "view_timeline", "Gantt"),
        new RouteItem(RouteConstants.CALENDAR, "event", "Calendar"),
        new RouteItem(RouteConstants.CHAT, "business_messages", "Chat"),
    ];
}