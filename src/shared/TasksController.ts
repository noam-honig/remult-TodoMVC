import { BackendMethod, Remult } from "remult";
import { Task } from "./Task";

export class TasksController {

    @BackendMethod({ allowed: true })
    static async setAll(completed: boolean, remult?: Remult) {
        const taskRepo = remult!.repo(Task);

        for (const task of await taskRepo.find()) {
            await taskRepo.save({ ...task, completed });
        }
    }
    @BackendMethod({ allowed: true })
    static async clearCompleted(remult?: Remult) {
        const taskRepo = remult!.repo(Task);

        for (const task of await taskRepo.find({
            where: { completed: true }
        })) {
            await taskRepo.delete(task);
        }
    }
    @BackendMethod({ allowed: true })
    static async getStats(remult?: Remult) {
        const taskRepo = remult!.repo(Task);
        const [count, left] = await Promise.all(
            [taskRepo.count(),
            taskRepo.count({ completed: false })]);
        return { count, left }
    }
}

export interface TasksStats {
    count: number;
    left: number;
}