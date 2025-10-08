<template>
  <q-page class="flex flex-center column">
    <q-input v-model="username" label="Username" />
    <q-input v-model="password" label="Password" type="password" />
    <q-btn label="Sign In" @click="login" color="primary" />
  </q-page>
</template>

<script lang="ts" setup>

import {ref} from 'vue'
import {useRouter} from 'vue-router'
import CryptoJS from 'crypto-js';

const username = ref('')
const password = ref('')
const router = useRouter()

async function login() {
  //API CALL TO GET USERS PASSWD AND USERNAME FROM DB
  const HashedPassword = CryptoJS.SHA256(password.value).toString();

  if (username.value && HashedPassword){
      //log user in
      await router.push('/')
  }
  
}

defineExpose({ login })

</script>
