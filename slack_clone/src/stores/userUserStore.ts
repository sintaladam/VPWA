import { defineStore } from 'pinia';
import type { ProfileAtr, StatusType } from '../components/models';

export const useUserStore = defineStore('user', {
  state: (): ProfileAtr => ({
    id: 1,
    name: '',
    surname: '',
    nickname: '',
    email: '',
    description: '',
    status: 'offline',
    token: '',
    isAuthenticated: false
  }),
  actions: {
    login(userData: ProfileAtr) {
      this.id = userData.id;
      this.name = userData.name;
      this.surname = userData.surname;
      this.nickname = userData.nickname;
      this.email = userData.email;
      this.description = userData.description;
      this.status = userData.status;
      this.token = userData.token;
      this.isAuthenticated = true;
    },
    logout() {
      this.id = Infinity;
      this.name = '';
      this.token = '';
      this.isAuthenticated = false;
    },
    changeStatus(status: StatusType) {
      this.status = status;
    },
    updateProfile({ id, nickname, name, surname, description }: ProfileAtr) {
      console.log(id);
      this.nickname = nickname;
      this.name = name;
      this.surname = surname;
      this.description = description;
    }
  },
  getters: {
    getProfileDetails: (state) => () => {
      return {
        id: state.id,
        email: state.email,
        nickname: state.nickname,
        name: state.name,
        surname: state.surname,
        description: state.description,
        status: state.status,
        token: '',
        isAuthenticated: state.isAuthenticated
      };
    }
  },
  persist: true 

  //using cookies for this
});
