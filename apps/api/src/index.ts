import express from 'express'
import cors from 'cors'
import { randomUUID } from 'crypto'
import type { Todo, CreateTodoDto, ApiResponse } from '@demo/shared'

const app = express()
app.use(cors())
app.use(express.json())

// 内存存储（演示用，实际部署请替换为数据库）
const todos: Todo[] = [
  { id: randomUUID(), text: '了解 pnpm workspace', done: false },
  { id: randomUUID(), text: '配置 Zeabur 部署', done: false },
  { id: randomUUID(), text: '体验 monorepo 开发', done: false },
]

app.get('/api/todos', (_req, res) => {
  const response: ApiResponse<Todo[]> = { data: todos, success: true }
  res.json(response)
})

app.post('/api/todos', (req, res) => {
  const { text } = req.body as CreateTodoDto
  if (!text || typeof text !== 'string' || !text.trim()) {
    res.status(400).json({ success: false, data: null, message: 'text 不能为空' })
    return
  }
  const todo: Todo = { id: randomUUID(), text: text.trim(), done: false }
  todos.push(todo)
  const response: ApiResponse<Todo> = { data: todo, success: true }
  res.status(201).json(response)
})

app.patch('/api/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === req.params.id)
  if (!todo) {
    res.status(404).json({ success: false, data: null })
    return
  }
  todo.done = !todo.done
  const response: ApiResponse<Todo> = { data: todo, success: true }
  res.json(response)
})

app.delete('/api/todos/:id', (req, res) => {
  const index = todos.findIndex(t => t.id === req.params.id)
  if (index === -1) {
    res.status(404).json({ success: false, data: null })
    return
  }
  todos.splice(index, 1)
  res.status(204).send()
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`[api] 已启动，端口 ${PORT}`)
})
