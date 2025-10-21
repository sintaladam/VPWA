<template>
  <q-page class="flex flex-center column">
    <div class="q-pa-xl q-ma-md custom-border">
      <q-form ref="formRef">
        <div class="row justify-between q-gutter-y-md">
          <div class="col-xs-12 col-md-5">
            <q-input outlined v-model="form.firstname" label="Firstname" :rules="nameRules" />
          </div>
          <div class="col-xs-12 col-md-5">
            <q-input outlined v-model="form.lastname" label="Lastname" :rules="nameRules" />
          </div>
        </div>

        <q-input outlined v-model="form.username" label="Nickname" class="q-mt-md" :rules="nameRules" />
        <q-input outlined v-model="form.email" label="Email" type="email" autocomplete="email" class="q-mt-md" :rules="emailRules" />

        <q-input
          outlined
          v-model="form.password"
          label="Password"
          :type="isPwd ? 'password' : 'text'"
          autocomplete="new-password"
          class="q-mt-md"
          :rules="passwordRules"
        >
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd=!isPwd"
            />
          </template>
        </q-input>

        <div class="row items-center q-mt-md justify-start q-col-gutter-md">
          <div class="col-12 col-sm-auto">
            <q-btn label="Register" @click="register" color="primary" />
          </div>

          <div class="col-12 col-sm-auto row items-center q-gutter-x-sm">
            <p class="q-mb-none">Already have an account?</p>
            <router-link to="/login" class="text-primary text-bold text-decoration-none">
              Log in
            </router-link>
          </div>
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script lang="ts">
import type { QForm } from 'quasar'
import { useUserStore } from 'src/stores/userUserStore'
import type { ProfileAtr } from 'src/components/models'

export default {
  name: 'RegisterPage',

  data() {
    return {
      form: {
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        password: ''
      },
      isPwd: true,
      userStore: useUserStore(),

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

  methods: {
    async register() {
      const form = this.$refs.formRef as QForm
      if (!form) {
        this.$q.notify({ type: 'negative', message: 'Form reference not found!' })
        return
      }

      const isValid = await form.validate()
      if (!isValid) {
        this.$q.notify({ type: 'negative', message: 'Please fill in all fields correctly' })
        return
      }

      this.userStore.login({
        id: 1,
        name: this.form.firstname,
        surname: this.form.lastname,
        nickname: this.form.username,
        email: this.form.email,
        description: '',
        status: 'online',
        token: 'sometoken'
      } as ProfileAtr)

      this.$q.notify({ type: 'positive', message: 'Registration successful!' })
      void this.$router.push('/')
    }
  }
}
</script>
