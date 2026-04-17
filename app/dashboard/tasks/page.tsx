"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Task = {
  id: string
  title: string
  completed: boolean
  status: string
  priority: string
}

type ColumnProps = {
  title: string
  status: string
  tasks: Task[]
  onUpdateStatus: (task: Task, status: string) => Promise<void>
  onDeleteTask: (id: string) => Promise<void>
  getPriorityColor: (p: string) => string
}

const Column = ({ title, status, tasks, onUpdateStatus, onDeleteTask, getPriorityColor }: ColumnProps) => (
  <div className="flex-1 bg-gray-900 rounded-xl p-4 border border-gray-700">
    <h2 className="text-lg font-bold mb-3">{title}</h2>
``
    {tasks.filter((t) => t.status === status).length === 0 ? (
      <p className="text-gray-500 text-sm">No tasks</p>
    ) : (
      tasks
        .filter((t) => t.status === status)
        .map((task) => (
          <div
            key={task.id}
            className="bg-gray-800 rounded-lg p-3 mb-3 shadow hover:shadow-lg transition"
          >
            <div className="flex justify-between items-center">
              <p className="font-medium">{task.title}</p>
              <span className={getPriorityColor(task.priority)}>
                {task.priority}
              </span>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 mt-3 text-sm">
              {status !== "todo" && (
                <button
                  onClick={() => onUpdateStatus(task, "todo")}
                  className="text-blue-400 hover:underline"
                >
                  Back
                </button>
              )}

              {status === "todo" && (
                <button
                  onClick={() => onUpdateStatus(task, "in-progress")}
                  className="text-blue-400 hover:underline"
                >
                  Progress
                </button>
              )}

              {status !== "done" && (
                <button
                  onClick={() => onUpdateStatus(task, "done")}
                  className="text-green-400 hover:underline"
                >
                  Done
                </button>
              )}

              <button
                onClick={() => onDeleteTask(task.id)}
                className="text-red-400 hover:underline ml-auto"
              >
                Delete
              </button>
            </div>
          </div>
        ))
    )}
  </div>
)

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [priority, setPriority] = useState("medium")



  // ✅ LOAD TASKS
  const loadTasks = async () => {
    const { data, error } = await supabase.from("tasks").select("*")

    if (error) {
      console.error(error)
    } else {
      setTasks(data || [])
    }
  }

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase.from("tasks").select("*")
      if (error) {
        console.error(error)
      } else {
        setTasks(data || [])
      }
    }
    fetchTasks()
  }, [])

  // ✅ ADD TASK
  const addTask = async () => {
    if (!newTask) return

    const { error } = await supabase.from("tasks").insert([
      {
        title: newTask,
        completed: false,
        status: "todo",
        priority: priority,
      },
    ])

    if (!error) {
      setNewTask("")
      loadTasks()
    }
  }

  // ✅ UPDATE STATUS
  const updateStatus = async (task: Task, status: string) => {
    await supabase.from("tasks").update({ status }).eq("id", task.id)
    loadTasks()
  }

  // ✅ DELETE
  const deleteTask = async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id)
    loadTasks()
  }

  // 🎨 PRIORITY COLORS
  const getPriorityColor = (p: string) => {
    if (p === "high") return "text-red-400"
    if (p === "medium") return "text-yellow-400"
    return "text-green-400"
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Tasks</h1>

      {/* ADD TASK */}
      <div className="flex gap-2 mb-6">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Task title..."
          className="flex-1 p-2 rounded bg-gray-800 border border-gray-600"
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="bg-gray-800 border border-gray-600 px-2 rounded"
          aria-label="Task priority"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button
          onClick={addTask}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Task
        </button>
      </div>

      {/* COLUMNS */}
      <div className="flex gap-4">
        <Column title="Todo" status="todo" tasks={tasks} onUpdateStatus={updateStatus} onDeleteTask={deleteTask} getPriorityColor={getPriorityColor} />
        <Column title="In Progress" status="in-progress" tasks={tasks} onUpdateStatus={updateStatus} onDeleteTask={deleteTask} getPriorityColor={getPriorityColor} />
        <Column title="Done" status="done" tasks={tasks} onUpdateStatus={updateStatus} onDeleteTask={deleteTask} getPriorityColor={getPriorityColor} />
      </div>
    </div>
  )
}
