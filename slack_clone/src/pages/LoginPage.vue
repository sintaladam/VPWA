<template>
  <q-page class="flex flex-center column">
    <div class="q-pa-xl q-ma-md custom-border">
      <q-input outlined v-model="email" label="Email" class="q-mt-md" />
      <q-input outlined v-model="password" label="Password" :type="isPwd ? 'password' : 'text'" class="q-mt-md">
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
    </div>
  </q-page>
</template>

<script lang="ts" setup>

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CryptoJS from 'crypto-js';

const email = ref('');
const password = ref('')
const router = useRouter()

const isPwd = ref(true)


async function login() {
  //API CALL TO GET USERS PASSWD AND USERNAME FROM DB
  //CHECK IF USERS CREDENTIALS MATCH THE ONES IN OUR DB
  const HashedPassword = CryptoJS.SHA256(password.value).toString();

  if (email.value && HashedPassword) {
    //log user in
    await router.push('/')
  }

}

defineExpose({ login })

</script>
