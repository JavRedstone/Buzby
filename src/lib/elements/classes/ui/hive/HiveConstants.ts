export class HiveConstants {
    public static readonly HONEYCOMB_HEIGHT = 75;
    public static readonly HONEYCOMB_WIDTH = HiveConstants.HONEYCOMB_HEIGHT * 2 / Math.sqrt(3);
    public static readonly HONEYCOMB_RADIUS = HiveConstants.HONEYCOMB_HEIGHT / 2;
    public static readonly HONEYCOMB_FILL_INCREMENT = 10;
    public static readonly HONEYCOMB_MAX_ZOOM = 5;
    public static readonly HONEYCOMB_MIN_ZOOM = 0.05;
    public static readonly HONEYCOMB_ZOOM_SPEED = 1/1000;

    public static readonly HONEYCOMB_HIGHLIGHT_DURATION = 500;

    public static readonly HONEYCOMB_PLACEHOLDER_ID = 'PLACEHOLDER';
}