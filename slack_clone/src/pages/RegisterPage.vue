<template>
  <q-page class="flex flex-center column">
    <div class="q-pa-xl q-ma-md custom-border">
      <div class="row justify-between q-gutter-y-md">
        <div class="col-xs-12 col-md-5">
          <q-input outlined v-model="form.firstname" label="Firstname" />
        </div>
        <div class="col-xs-12 col-md-5">
          <q-input outlined v-model="form.lastname" label="Lastname" />
        </div>
      </div>
      <q-input outlined v-model="form.username" label="Nickname" class="q-mt-md" />
      <q-input outlined v-model="form.email" label="Email" type="email" autocomplete="email" class="q-mt-md" />
      <q-input outlined v-model="form.password" label="Password" :type="isPwd ? 'password' : 'text'"
        autocomplete="new-password" class="q-mt-md">
        <template v-slot:append>
          <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
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
    </div>
  </q-page>
</template>

<script lang="ts" setup>

import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import CryptoJS from 'crypto-js';

const router = useRouter()

const form = reactive({
  firstname: '',
  lastname: '',
  username: '',
  email: '',
  password: ''
})

const isPwd = ref(true)


async function register() {
  //POSSIBLE TO MOVE THIS CODE TO UTILLS
  const HashedPassword = CryptoJS.SHA256(form.password).toString();
  //PERFORM VALIDATION OF USER IF EVERYTHING IS SUCCESSFUL REGISTER USER 
  if (form.username && HashedPassword) {
    //log user in
    await router.push('/')
  }
}

defineExpose({ register })

</script>
