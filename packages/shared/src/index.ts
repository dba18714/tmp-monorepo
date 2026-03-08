export interface Todo {
  id: string
  text: string
  done: boolean
}

export interface CreateTodoDto {
  text: string
}

export interface ApiResponse<T> {
  data: T
  success: boolean
}
