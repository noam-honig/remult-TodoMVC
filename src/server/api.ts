import { remultExpress } from 'remult/remult-express';
import { Task } from '../shared/Task';
import { TasksController } from '../shared/TasksController';

export const api = remultExpress({
    entities: [Task],
    controllers: [TasksController],
    initApi: async remult => {
        const taskRepo = remult.repo(Task);
        if (await taskRepo.count() === 0) {
            await taskRepo.insert([
                { title: "Task a" },
                { title: "Task b", completed: true },
                { title: "Task c" },
                { title: "Task d" },
                { title: "Task e", completed: true }
            ]);
        }
    }
});