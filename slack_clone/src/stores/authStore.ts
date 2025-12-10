import { defineStore } from 'pinia'
import { AuthService, AuthManager } from 'src/services'
import type { User, LoginCredentials, RegisterData } from 'src/contracts'
import type { ProfileAtr, StatusType } from 'src/components/models'

export type AuthStatus = 'pending' | 'success' | 'error'

export interface AuthStateInterface {
  user: User | null
  authStatus: AuthStatus
  status: StatusType
  errors: { message: string; field?: string }[]
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthStateInterface => ({
    user: null,
    authStatus: 'pending',
    status: 'online',
    errors: [],
  }),

  getters: {
    isAuthenticated: (state) => state.user !== null,

    getProfileDetails: (state) => () => {
      return {
        ...state.user,
        status: state.status,
      };
    }
  },

  actions: {
    _start() {
      this.authStatus = 'pending';
      this.errors = [];
    },
    _success(user: User | null) {
      this.authStatus = 'success';
      this.user = user;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _error(errors: any) {
      this.authStatus = 'error';
      // normalize as you wish
      this.errors = Array.isArray(errors) ? errors : [{ message: String(errors?.message ?? errors) }];
    },

    async check() {
      try {
        this._start();
        const user = await AuthService.me();
        this._success(user);
        return user !== null;
      } catch (err) {
        this._error(err);
        throw err;
      }
    },

    async register(form: RegisterData) {
      try {
        this._start();
        const res = await AuthService.register(form);
        this._success(null);
        if (res?.ok) {
          return true;
        }
        return false;
      } catch (err) {
        this._error(err);
        throw err;
      }
    },

    async login(credentials: LoginCredentials) {
      try {
        this._start();
        const apiToken = await AuthService.login(credentials);
        this._success(null);
        // persist token & notify listeners
        AuthManager.setToken(apiToken.token);
        return apiToken;
      } catch (err) {
        this._error(err);
        throw err;
      }
    },

    async logout() {
      try {
        this._start();
        await AuthService.logout();
        this._success(null);
        AuthManager.removeToken();
      } catch (err) {
        this._error(err);
        throw err;
      }
    },

    changeStatus(status: StatusType) {
      this.user!.status = status;
    },
    async updateProfile(profile:ProfileAtr) {
      const res = await AuthService.update(profile);
      if (res?.ok) {
        this.user = await AuthService.me();
        return true;
      }
      return false;
}
  },

  persist: true,
});