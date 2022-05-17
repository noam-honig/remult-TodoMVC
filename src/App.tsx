import { LegacyRef, useCallback, useEffect, useState } from "react";
import '../node_modules/todomvc-app-css/index.css';
import '../node_modules/todomvc-common/base.css';
import { remult } from "./common";
import { Task } from "./shared/Task";
import { TasksController, TasksStats } from "./shared/TasksController";

const taskRepo = remult.repo(Task);

function App() {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TasksStats>({ count: 0, left: 0 });
  const [editingTask, setEditingTask] = useState<string>();
  const [filterCompleted, setFilterCompleted] = useState<boolean>();
  const createNewTask = async () => {
    if (newTaskTitle) {
      setTasks([...tasks, await taskRepo.insert({ title: newTaskTitle })]);
      TasksController.getStats().then(setStats);
      setNewTaskTitle('');
    }
  }
  const clearCompleted = async () => {
    await TasksController.clearCompleted();
    loadTasks();
  }
  const setAll = async (completed: boolean) => {
    await TasksController.setAll(completed);
    loadTasks();
  }

  const loadTasks = useCallback(async () => {
    taskRepo.find({
      where: {
        completed: filterCompleted
      }
    }).then(setTasks);;
    TasksController.getStats().then(setStats);
  }, [filterCompleted]);
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return (
    <>
      <section className="todoapp">
        <header className="header">
          <h1>todos</h1>
          <input className="new-todo"
            placeholder="What needs to be done?"
            autoFocus
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)} onBlur={createNewTask}
            onKeyDown={e => { if (e.key == 'Enter') createNewTask() }} />
        </header>

        {stats.count > 0 && <>  <section className="main">
          <input id="toggle-all"
            className="toggle-all"
            type="checkbox"
            checked={stats.count !== stats.left}
            onChange={e => setAll(e.target.checked)}
          />
          <label htmlFor="toggle-all">Mark all as complete</label>
          <ul className="todo-list">
            {tasks.map(task => {
              const handleChange = (values: Partial<Task>) => {
                setTasks(tasks.map(t => t === task ? { ...task, ...values } : t));
              };
              const setCompleted = async (completed: boolean) => {
                const savedTask = await taskRepo.save({ ...task, completed });
                setTasks(tasks.map(t => t === task ? savedTask : t));
                TasksController.getStats().then(setStats);
              }

              const saveTask = async () => {
                setEditingTask(undefined);
                const savedTask = await taskRepo.save(task);
                setTasks(tasks.map(t => t === task ? savedTask : t));
              };

              const deleteTask = async () => {
                await taskRepo.delete(task);
                setTasks(tasks.filter(t => t !== task));
                TasksController.getStats().then(setStats);
              };
              const ref: LegacyRef<HTMLInputElement> = {
                current: null
              }
              return <li key={task.id} className={task.id === editingTask ? 'editing' : task.completed ? 'completed' : ''}>
                <div className="view" onDoubleClick={() => {
                  console.dir(ref.current);
                  setEditingTask(task.id);
                  const x = ref.current;
                  setTimeout(() => {
                    x!.focus()
                  }, 0);

                }}>
                  <input className="toggle" type="checkbox"
                    checked={task.completed}
                    onChange={e => setCompleted(e.target.checked)}
                  />
                  <label>{task.title}</label>
                  <button className="destroy" onClick={deleteTask}></button>
                </div>
                <input className="edit"
                  value={task.title}
                  onBlur={saveTask}
                  ref={ref}

                  onChange={e => handleChange({ title: e.target.value })} />
              </li>
            })}
          </ul>
        </section>
          <footer className="footer">
            <span className="todo-count"><strong>{stats.left}</strong> item{stats.left > 1 ? 's' : ''} left</span>
            <ul className="filters">
              {[{ val: undefined, caption: "All" },
              { val: false, caption: "Active" },
              { val: true, caption: "Completed" }].map(({ val, caption }) => (
                <li key={caption!}>
                  <a className={filterCompleted === val ? 'selected' : ''} onClick={() => setFilterCompleted(val)}>{caption}</a>
                </li>
              ))}
            </ul>
            {stats.left != stats.count && <button className="clear-completed" onClick={clearCompleted}>Clear completed</button>}
          </footer></>}
      </section>
      <footer className="info">
        <p>Double-click to edit a todo</p>
        {/* <!-- Change this out with your name and url ↓ --> */}
        <p>Created by <a href="http://www.github.com/remult/remult">remult</a></p>
        <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
      </footer>
    </>
  );
}

export default App;
