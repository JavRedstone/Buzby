import { Vector2 } from "three";

export class MathHelper {
    public static getAnglesForPolygon(sides: number): number[] {
        const angles = [];
        for (let i = 0; i < sides; i++) {
            angles.push((2 * Math.PI / sides) * i);
        }
        return angles;
    }

    public static getOffsetForAngle(angle: number, offset: number, radius: number): Vector2 {
        return new Vector2(
            Math.cos(angle + offset) * radius,
            Math.sin(angle + offset) * radius
        );
    }

    public static areNumberAlmostEqual(a: number, b: number, epsilon: number = 0.0001): boolean {
        return Math.abs(a - b) < epsilon;
    }
}