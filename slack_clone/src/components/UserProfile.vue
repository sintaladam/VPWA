<template>
  <div class="column">
    <div class="flex flex-center column q-pa-md q-pt-lg">
      <q-avatar>
        <img src="https://cdn.quasar.dev/img/avatar.png">
      </q-avatar>
      <p class="q-mt-md q-mb-none text-h6">{{ profile.nickname }}</p>
      <div class="q-mt-md q-gutter-y-xs column flex-center">
        <p class="text-subtitle2 q-mb-none text-grey">{{ profile.name }} {{ profile.surname }}</p>
        <p class="text-subtitle2 q-mb-none text-grey">{{ profile.email }}</p>
        <p class="text-subtitle2 q-mb-none q-mt-md text-grey">{{ profile.description }}</p>

      </div>
      

    </div>
  </div>
</template>

<script lang="ts">

import type { PropType } from 'vue'
import type { ProfileAtr } from 'src/components/models'   // make sure models.ts exports it


export default {
  name: 'UserProfile',
  data() {
    return {}
  },
    props: {
      profile: {
        type: Object as PropType<ProfileAtr>,
        required: true
      },
    }
  }
</script>