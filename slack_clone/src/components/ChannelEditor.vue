<template>
  <q-dialog v-model="localDialogOpen" >
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Edit channel</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        cc nvm este
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">

export default {
  data() {
    return {
      
    }
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    localDialogOpen: {
      get() { return this.modelValue; },
      set(value: boolean) { this.$emit('update:modelValue', value) }
    }
  },
  emits: ['update:modelValue']
}
</script>
