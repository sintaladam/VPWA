<template>
    <q-dialog>
        <q-card style="min-width: 300px; max-width: 400px;">
            <!-- Header -->
            <q-card-section class="row items-center q-pb-none q-gutter-sm">
                <div class="text-h6">Users in this channel</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-separator />

            <!-- User List -->
            <q-card-section class="q-pt-sm" style="max-height: 300px; overflow-y: auto;">
                <q-list bordered padding class="rounded-borders bg-grey-1">
                    <q-item v-for="(user, index) in users" :key="index" clickable>
                        <q-item-section avatar>
                            <q-avatar
                                :color="user.status === 'online' ? 'positive' : user.status === 'dnd' ? 'orange' : 'negative'"
                                text-color="white" class="q-mr-sm">
                                {{ user.nickname?.[0]?.toUpperCase() }}
                            </q-avatar>
                        </q-item-section>

                        <q-item-section>
                            <q-item-label>{{ user.nickname }} {{ console.log(user.status) }}</q-item-label>
                            <q-item-label caption class="text-grey">Member</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>

                <div v-if="!users || users.length === 0" class="text-center text-grey q-pa-md">
                    No users found
                </div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import type { UserAtr } from './models';

export default {
    props: {
        users: {
            type: Array as PropType<UserAtr[]>,
            required: true
        },
    },
    data() {
        return {}
    }

}
</script>
