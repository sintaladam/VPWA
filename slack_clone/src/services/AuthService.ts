import type { AxiosError, AxiosRequestConfig } from 'axios'
import type { ApiToken, LoginCredentials, RegisterData, User } from 'src/contracts'
import { api } from 'src/boot/axios'
import type { ProfileAtr } from 'src/components/models';

class AuthService {
  async me (dontTriggerLogout = false): Promise<User | null> {
    return api.get(
      'auth/me',
      { dontTriggerLogout } as AxiosRequestConfig
    )
      .then((response) => response.data)
      .catch((error: AxiosError) => {
        if (error.response?.status === 401) {
          return null
        }

        return Promise.reject(error)
      })
  }

  async register (data: RegisterData): Promise<{ ok: boolean; } | null> {
    try {
      const response = await api.post('auth/register', data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      console.error('Action failed:', error.response?.data);

      return null;
    }
  }

  async login (credentials: LoginCredentials): Promise<ApiToken> {
    const response = await api.post<ApiToken>('auth/login', credentials)
    return response.data
  }

  async logout (): Promise<void> {
    await api.post('auth/logout')
  }

  async update (profile:ProfileAtr):Promise<{ ok: boolean; } | null> {
    try {
      const response = await api.post('auth/update',profile);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      console.error('Action failed:', error.response?.data);

      return null;
    }
  }
}

export default new AuthService()