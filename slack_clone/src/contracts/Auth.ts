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
}

export interface LoginCredentials {
  email: string
  password: string
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
  mentionsOnly: boolean
  status: 'online' | 'offline' | 'DND'
}
