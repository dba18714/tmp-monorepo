import { useState, useEffect } from 'react'
import type { Todo } from '@demo/shared'

// 生产环境通过 VITE_API_URL 指向 Zeabur 上的 API 服务地址
// 本地开发时留空，由 vite.config.ts 的 proxy 转发
const API_URL = import.meta.env.VITE_API_URL || ''

async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(`${API_URL}/api/todos`)
  const { data } = await res.json()
  return data
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTodos()
      .then(setTodos)
      .catch(() => setError('无法连接到 API 服务'))
      .finally(() => setLoading(false))
  }, [])

  const addTodo = async () => {
    const text = input.trim()
    if (!text) return
    try {
      const res = await fetch(`${API_URL}/api/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const { data } = await res.json()
      setTodos(prev => [...prev, data])
      setInput('')
    } catch {
      setError('添加失败')
    }
  }

  const toggleTodo = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/todos/${id}`, { method: 'PATCH' })
      const { data } = await res.json()
      setTodos(prev => prev.map(t => (t.id === id ? data : t)))
    } catch {
      setError('更新失败')
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/todos/${id}`, { method: 'DELETE' })
      setTodos(prev => prev.filter(t => t.id !== id))
    } catch {
      setError('删除失败')
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📦 pnpm Workspace Demo</h1>
      <p style={styles.subtitle}>
        前端 <code>@demo/web</code> · 后端 <code>@demo/api</code> · 共享类型 <code>@demo/shared</code>
      </p>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={input}
          placeholder="输入待办事项，回车添加..."
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
        />
        <button style={styles.addBtn} onClick={addTodo}>添加</button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {loading ? (
        <p style={styles.hint}>加载中...</p>
      ) : (
        <ul style={styles.list}>
          {todos.length === 0 && <p style={styles.hint}>暂无待办，快添加一个吧！</p>}
          {todos.map(todo => (
            <li key={todo.id} style={styles.item}>
              <span
                style={{ ...styles.text, textDecoration: todo.done ? 'line-through' : 'none', color: todo.done ? '#aaa' : '#222' }}
                onClick={() => toggleTodo(todo.id)}
              >
                {todo.done ? '✅' : '⬜'} {todo.text}
              </span>
              <button style={styles.delBtn} onClick={() => deleteTodo(todo.id)}>删除</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 560, margin: '60px auto', padding: '0 16px', fontFamily: 'system-ui, sans-serif' },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 4 },
  subtitle: { color: '#666', fontSize: 13, marginBottom: 24 },
  inputRow: { display: 'flex', gap: 8, marginBottom: 16 },
  input: { flex: 1, padding: '8px 12px', fontSize: 14, border: '1px solid #ddd', borderRadius: 6, outline: 'none' },
  addBtn: { padding: '8px 18px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' },
  text: { cursor: 'pointer', flex: 1, fontSize: 15 },
  delBtn: { background: 'none', border: 'none', color: '#f00', cursor: 'pointer', fontSize: 14, padding: '0 4px' },
  hint: { color: '#999', textAlign: 'center', fontSize: 14 },
  error: { color: 'red', fontSize: 13 },
}
