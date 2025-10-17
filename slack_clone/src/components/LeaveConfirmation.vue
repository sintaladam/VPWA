<template>
  <q-dialog v-model="localDialogOpen" >
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Are you sure?</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-btn color="white" text-color="black" label = "Close" v-close-popup/>
        <q-btn color="white" text-color="red-10" :label = "title" @click="deleteSelf()"/>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
export default {
  data() {
    return {

    };
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    title: String,
  },
  computed: {
    localDialogOpen: {
      get() { return this.modelValue; },
      set(value: boolean) { this.$emit('update:modelValue', value); }
    }
  },
  methods: {
    deleteSelf() {
      this.$emit('deleteEvent');
    }
  },
  emits: ['update:modelValue','deleteEvent']
};
</script>
