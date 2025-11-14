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
                    <q-item v-for="(user, index) in users" :key="index">
                        <q-item-section avatar>
                            <!-- <q-avatar
                                :color="user.status === 'online' ? 'positive' : user.status === 'dnd' ? 'orange' : 'negative'"
                                text-color="white" class="q-mr-sm">
                                {{ user.nickname?.[0]?.toUpperCase() }}
                            </q-avatar> -->
                            <q-avatar
                                text-color="primary" class="q-mr-sm">
                                {{ user.nickname?.[0]?.toUpperCase() }}
                            </q-avatar>
                        </q-item-section>

                        <q-item-section>
                            <q-item-label>{{ user.nickname }}</q-item-label>
                            <q-item-label caption class="text-grey">Member</q-item-label>
                        </q-item-section>
                        <q-item-section side v-show="creatorId===userStore.user!.id && user.id!==userStore.user!.id">
                            <q-btn round flat color="negative" icon="cancel" size="sm" @click.stop="kickMember(user.id)"/>
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
import type { Member } from 'src/contracts';
import { useAuthStore } from 'src/stores/authStore';
import { HomeService } from 'src/services';

export default {
    props: {
        users: {
            type: Array as PropType<Member[]>,
            required: true
        },
        creatorId: {
            type: Number,
            required:true
        },
        channelId: {
            type: Number,
            required:true
        },
    },
    data() {
        return {
            userStore: useAuthStore(),
        }
    },
    methods: {
        async kickMember(userId: number) {
            const res = await HomeService.kickMember(this.channelId, userId);
            if (res?.ok) {
                this.$emit('kickMemberEvent');
                this.$q.notify({ type: 'positive', message: `user ${userId} was removed` });
            }
            else {
                this.$q.notify({ type: 'negative', message: `remove user ${userId} failed` })
            }
        }
    },
    emits: ['kickMemberEvent'],

}
</script>
