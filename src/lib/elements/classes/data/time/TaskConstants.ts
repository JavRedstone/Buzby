export class TaskConstants {
    public static readonly TASK_CENTER_ID = 'task-center';
    public static readonly TASK_NAME_MAX_LENGTH = 50;
    public static readonly TASK_DESCRIPTION_MAX_LENGTH = 200;

    public static readonly TASK_DEFAULT_DURATION = 60 * 60 * 1000;

    public static readonly TASK_URGENT_SMALL_THRESHOLD = 20;
    public static readonly TASK_URGENT_BIG_THRESHOLD = 80;
    public static readonly TASK_URGENT_NORMAL_PROGRESS_TIME = 25 * 60 * 1000;
    public static readonly TASK_URGENT_SMALL_PROGRESS_TIME = 45 * 60 * 1000;
    public static readonly TASK_URGENT_BIG_PROGRESS_TIME = 15 * 60 * 1000;
}