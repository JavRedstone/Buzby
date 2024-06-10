export class HiveConstants {
    public static readonly HONEYCOMB_HEIGHT = 75;
    public static readonly HONEYCOMB_WIDTH = HiveConstants.HONEYCOMB_HEIGHT * 2 / Math.sqrt(3);
    public static readonly HONEYCOMB_RADIUS = HiveConstants.HONEYCOMB_HEIGHT / 2;
    public static readonly HONEYCOMB_FILL_INCREMENT = 10;
    public static readonly HONEYCOMB_MAX_ZOOM = 5;
    public static readonly HONEYCOMB_MIN_ZOOM = 0.05;
    public static readonly HONEYCOMB_ZOOM_SPEED = 1/1000;

    public static readonly TASK_CENTER_ID = 'task-center';
    public static readonly TASK_NAME_MAX_LENGTH = 50;
    public static readonly TASK_DESCRIPTION_MAX_LENGTH = 200;
}