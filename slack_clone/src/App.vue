<template>
  <router-view />
</template>

<script lang="ts">
import { useUserStore } from './stores/userUserStore';

export default {
  computed: {
    userStore() {
      return useUserStore();
    }
  },
  methods: {
    logUser() {
      this.userStore.login({
        id: 1,
        email: 'random@email.com',
        nickname: 'nick',
        name: 'First',
        surname: 'Last',
        description: 'A user',
        status: 'online',
        token: 'sometoken',
        isAuthenticated: true
      });
      console.log('User logged in:', this.userStore);
    }
  },
  mounted() {
    this.logUser();
  }
}
</script>