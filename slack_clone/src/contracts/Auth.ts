export interface ApiToken {
  type: 'bearer'
  token: string
  expires_at?: string
  expires_in?: number
}

export interface RegisterData {
  nickname: string
  name: string
  surname: string
  email: string
  password: string
  description?: string
  //passwordConfirmation?: string
}

export interface LoginCredentials {
  email: string
  password: string
  //remember?: boolean
}

export interface User {
  id: number
  nickname: string
  name: string
  surname: string
  description?: string
  email: string
  createdAt: string
  updatedAt?: string
}

export interface Message {
  id: number
  sender: User
  content: string
  createdAt: string
  updatedAt?: string
  perPage?: number
}