<template>
  <q-page class="flex flex-center column">
    <div class="q-pa-xl q-ma-md custom-border" style="min-width: 320px; max-width: 400px;">
      <div class="q-pb-md">
        <p class="text-center text-h4 text-weight-bold q-ma-none">Welcome Back</p>
        <p class="text-center text-grey-7 q-mt-sm q-mb-none">Log in to your account</p>
      </div>
      <q-form class="q-mt-lg" ref="formRef">
        <q-input outlined v-model="credentials.email" label="Email" class="q-mb-sm" autocomplete="email" :rules="emailRules">
          <template v-slot:prepend>
            <q-icon name="email" />
          </template>
        </q-input>
        <q-input outlined v-model="credentials.password" label="Password" :type="isPwd ? 'password' : 'text'"
          autocomplete="current-password" :rules="passwordRules">
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
          <template v-slot:append>
            <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
          </template>
        </q-input>

        <q-btn label="Log in" @click="login" color="primary" class="q-mt-lg full-width" :loading="loading"/>

        <q-separator class="q-my-lg" />

        <div class="col-12 col-sm-auto row items-center justify-center q-gutter-x-sm">
          <p class="q-mb-none">Don't have an account yet?</p>
          <router-link :to="{ name: 'register'}" class="text-primary text-bold text-decoration-none">
            Register here
          </router-link>
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script lang="ts">
import type { QForm } from 'quasar'
import { useAuthStore } from 'src/stores/authStore';
import { notify } from 'src/utils/helperFunctions';
import { type RouteLocationRaw } from 'vue-router';

export default {
  name: 'LoginPage',
  data() {
    return {

      isPwd: true as boolean,
      formRef: null as QForm | null,

      // Validation rules
      emailRules: [
        (val: string) => !!val || 'Email is required',
        (val: string) => /.+@.+\..+/.test(val) || 'Invalid email'
      ],
      passwordRules: [
        (val: string) => !!val || 'Password is required',
        (val: string) => val.length >= 6 || 'Password must be at least 6 characters'
      ],
      credentials: { email: '', password: '' },
      userStore: useAuthStore(),

    }
  },
  computed: {
    redirectTo (): RouteLocationRaw {
      return (this.$route.query.redirect as string) || { name: 'home' }
    },
    loading (): boolean {
      return this.userStore.authStatus === 'pending'
    }
  },
  methods: {
    login() {
      this.userStore.login(this.credentials)
      .then(() => this.$router.push(this.redirectTo))
      .then(() => notify(`Welcome to the app ${this.userStore.user?.nickname}`, 'positive', 'top'))
      .catch((err) => {
        void err;
        notify('Login failed', 'negative', 'top');
      })
    }
  }
}
</script>
