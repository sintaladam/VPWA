<template>
  <q-page class="flex flex-center column">
    <div class="q-pa-xl q-ma-md custom-border">
      <q-form ref="formRef">
        <q-input outlined v-model="email" label="Email" autocomplete="email" class="q-mt-md" :rules="emailRules" />
        <q-input outlined v-model="password" label="Password" :type="isPwd ? 'password' : 'text'"
          autocomplete="current-password" class="q-mt-md" :rules="passwordRules">
          <template v-slot:append>
            <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
          </template>
        </q-input>
        <q-btn label="Log in" @click="login" color="primary" class="q-mt-lg" />

        <div class="col-12 col-sm-auto row items-center q-gutter-x-sm q-mt-sm">
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
      const form = this.$refs.formRef as QForm
      console.log(this.$q.platform)

      const isValid = await form.validate()
      if (!isValid) {
        this.$q.notify({ type: 'negative', message: 'Please fill in all fields correctly' })
        return
      }

      //const hashedPassword = CryptoJS.SHA256(this.password).toString()

      // Replace with real backend check
      const loginSuccess = true;

      if (loginSuccess) {
        this.$q.notify({ type: 'positive', message: 'Login successful!' })
        void this.$router.push('/')
      } else {
        this.$q.notify({ type: 'negative', message: 'Invalid email or password' })
      }
    }
  }
}
</script>
