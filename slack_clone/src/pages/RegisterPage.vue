<template>
  <q-page class="flex flex-center column">
    <div class="q-pa-xl q-ma-md custom-border" style="min-width: 320px; max-width: 500px;">
      <div class="q-pb-md">
        <p class="text-center text-h4 text-weight-bold q-ma-none">Create Account</p>
        <p class="text-center text-grey-7 q-mt-sm q-mb-none">Join us today</p>
      </div>

      <q-form class="q-mt-lg" ref="formRef">
        <div class="row q-col-gutter-sm q-mb-sm">
          <div class="col-12 col-sm">
            <q-input outlined v-model="form.name" label="Firstname" :rules="nameRules">
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm">
            <q-input outlined v-model="form.surname" label="Lastname" :rules="nameRules" />
          </div>
        </div>

        <q-input outlined v-model="form.nickname" label="Nickname" class="q-mb-sm" :rules="nameRules">
          <template v-slot:prepend>
            <q-icon name="alternate_email" />
          </template>
        </q-input>
        <q-input outlined v-model="form.email" label="Email" class="q-mb-sm" type="email" autocomplete="email"
          :rules="emailRules">
          <template v-slot:prepend>
            <q-icon name="email" />
          </template>
        </q-input>

        <q-input outlined v-model="form.password" label="Password" :type="isPwd ? 'password' : 'text'"
          autocomplete="new-password" :rules="passwordRules">
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
          <template v-slot:append>

            <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
          </template>
        </q-input>

        <q-btn label="Register" @click="register" color="primary" class="full-width q-mt-lg" />

        <q-separator class="q-my-lg" />

        <div class="row items-center q-mt-md justify-center q-col-gutter-x-md">
          <p class="q-mb-none">Already have an account?</p>
          <router-link :to="{ name: 'login' } " class="text-primary text-bold text-decoration-none">
            Log in
          </router-link>
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script lang="ts">
// import type { QForm } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
// import type { ProfileAtr } from 'src/components/models'
import type { RouteLocationRaw } from 'vue-router';

export default {
  name: 'RegisterPage',

  data() {
    return {
      form: {
        name: '',
        surname: '',
        nickname: '',
        email: '',
        password: ''
      },
      isPwd: true,
      userStore: useAuthStore(),

      nameRules: [
        (val: string) => !!val || 'This field is required'
      ],
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
  computed: {
      redirectTo (): RouteLocationRaw {
        return { name: 'login' }
      },
      loading (): boolean {
        return this.userStore.authStatus === 'pending'
      }
    },
  methods: {
    // async register() {
    //   const form = this.$refs.formRef as QForm
    //   if (!form) {
    //     this.$q.notify({ type: 'negative', message: 'Form reference not found!' })
    //     return
    //   }

    //   const isValid = await form.validate()
    //   if (!isValid) {
    //     this.$q.notify({ type: 'negative', message: 'Please fill in all fields correctly' })
    //     return
    //   }

    //   this.userStore.login({
    //     id: 1,
    //     name: this.form.firstname,
    //     surname: this.form.lastname,
    //     nickname: this.form.username,
    //     email: this.form.email,
    //     description: '',
    //     status: 'online',
    //     token: 'sometoken',
    //     isAuthenticated: true
    //   } as ProfileAtr)

    //   this.$q.notify({ type: 'positive', message: 'Registration successful!' })
    //   void this.$router.push('/')
    // }
    
    register() {
      this.userStore.register(this.form).then(() => this.$router.push(this.redirectTo))
    }
  }
}
</script>
