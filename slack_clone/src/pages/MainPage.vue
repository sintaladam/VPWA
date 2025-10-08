<template>
  <q-page padding>
    <!-- content -->
    <MessageBoard />
  </q-page>
</template>

<script lang="ts">
import MessageBoard from 'src/components/MessageBoard.vue';

export default {
  components: {
    MessageBoard
  },
}
</script>
