<template>
  <q-page class="flex flex-center column">
    <div class="q-pa-xl custom-border" style="min-width: 350px; max-width: 400px; width: 100%;">
      <div class="q-pb-md">
        <p class="text-center text-h4 text-weight-bold q-ma-none">Welcome Back</p>
        <p class="text-center text-grey-7 q-mt-sm q-mb-none">Log in to your account</p>
      </div>
      <q-form class="q-mt-lg" ref="formRef">
        <q-input outlined v-model="email" label="Email" class="q-mb-sm" autocomplete="email"
          :rules="emailRules">
          <template v-slot:prepend>
            <q-icon name="email" />
          </template>
        </q-input>
        <q-input outlined v-model="password" label="Password" :type="isPwd ? 'password' : 'text'"
          autocomplete="current-password" :rules="passwordRules">
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
          <template v-slot:append>
            <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
          </template>
        </q-input>

        <q-btn label="Log in" @click="login" color="primary" class="q-mt-lg full-width" />

        <q-separator class="q-my-lg" />

        <div class="col-12 col-sm-auto row items-center justify-center q-gutter-x-sm">
          <p class="q-mb-none">Don't have an account yet?</p>
          <router-link to="/register" class="text-primary text-bold text-decoration-none">
            Register here
          </router-link>
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script lang="ts">
import type { QForm } from 'quasar'
//import { useCookies } from 'vue3-cookies';

// import CryptoJS from 'crypto-js'

export default {
  name: 'LoginPage',
  data() {
    return {
      email: '' as string,
      password: '' as string,
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
      ]
    }
  },
  methods: {
    async login() {
      //const { cookies } = useCookies();

      const form = this.$refs.formRef as QForm

      const isValid = await form.validate()
      if (!isValid) {
        this.$q.notify({ type: 'negative', message: 'Please fill in all fields correctly' })
        return
      }

      //const hashedPassword = CryptoJS.SHA256(this.password).toString()

      // Replace with real backend check
      // Create JWT token here 
      const loginSuccess = false;
      //const userToken = ''

      if (loginSuccess) {
        this.$q.notify({ type: 'positive', message: 'Login successful!' })
        //cookies.set('token', userToken, '1h', '/', '', true, 'Strict');
        void this.$router.push('/')
      } else {
        this.$q.notify({ type: 'negative', message: 'Invalid email or password' })
      }
    }
  }
}
</script>
