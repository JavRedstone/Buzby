export class ChatConstants {
    public static readonly MESSAGE_MAX_LENGTH = 2000;
    public static readonly MESSAGE_GROUP_TIME = 300000;
    public static readonly MESSAGE_TIMEOUT = 5000;
    public static readonly MESSAGE_MAX_COUNT = 90;
    public static readonly MESSAGE_HIGHLIGHT_DURATION = 2000;

    public static readonly URL_MAX_LENGTH = 3000;
    public static readonly URL_NAME_MAX_LENGTH = 200;

    public static readonly POLL_QUESTION_MAX_LENGTH = 200;
    public static readonly POLL_OPTION_MAX_LENGTH = 100;
    public static readonly POLL_MAX_OPTIONS = 10;
    public static readonly POLL_DURATIONS: string[] = [
        '1 minute',
        '5 minutes',
        '15 minutes',
        '30 minutes',
        '1 hour',
        '6 hours',
        '12 hours',
        '1 day',
        '3 days',
        '1 week',
    ];
    public static readonly POLL_DURATIONS_MS: number[] = [
        6 * 60 * 60 * 1000,
        12 * 60 * 60 * 1000,
        24 * 60 * 60 * 1000,
        7 * 24 * 60 * 60 * 1000,
    ];
    public static readonly POLL_DEFAULT_DURATION = '1 day';
    
}