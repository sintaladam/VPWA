import { defineStore } from 'pinia'
import type { ProfileAtr } from '../components/models'

export const useUserStore = defineStore('user', {
  state: (): ProfileAtr => ({
    id: 0 ,
    name: '', 
    surname: '',
    nickname: '',
    email: '',
    description: '',
    status: 'offline',
    token: '',
    isAuthenticated: true
  }),

  actions: {
    login(userData: ProfileAtr) {
        this.id = userData.id
        this.name = userData.name
        this.surname = userData.surname
        this.nickname = userData.nickname
        this.email = userData.email
        this.description = userData.description
        this.status = userData.status
        this.token = userData.token
        this.isAuthenticated = true
    },
    logout() {
      this.id = null
      this.name = ''
      this.token = ''
      this.isAuthenticated = false
    }
  },

  //persist: true // Enable this line to persist the store across sessions
})
