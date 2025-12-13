import type { AxiosError, AxiosRequestConfig } from 'axios'
import type { ApiToken, LoginCredentials, RegisterData, User } from 'src/contracts'
import { api } from 'src/boot/axios'
import type { ProfileAtr } from 'src/components/models';
import { notify } from 'src/utils/helperFunctions';

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
      if (error.response?.status === 409) {
        const errorData = error.response.data as { error: string; field: string };
        notify(errorData.error, 'negative', 'top');
        return null;
      }
      if (error.response?.status === 422) {
        const errorData = error.response.data as { errors: Array<{ message: string; field: string }> };
        const uniqueNicknameError = errorData.errors.find(err => err.field === 'nickname');
        if (uniqueNicknameError) {
          notify(uniqueNicknameError.message, 'negative', 'top');
        } else {
          notify('An error occurred during registration.', 'negative', 'top');
        }
      } else {
        notify('An error occurred during registration.', 'negative', 'top');
      }

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