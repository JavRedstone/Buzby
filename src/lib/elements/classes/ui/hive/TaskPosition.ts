import type { Vector2 } from "three";
import type { Task } from "../../data/time/Task";

export class TaskPosition {
    public task: Task;
    public position: Vector2;

    constructor(task: Task, position: Vector2) {
        this.task = task;
        this.position = position;
    }

    public equals(other: TaskPosition): boolean {
        return this.task === other.task && this.position.x === other.position.x && this.position.y === other.position.y;
    }
}