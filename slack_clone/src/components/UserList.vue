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
                            <q-avatar text-color="primary" class="q-mr-sm">
                                {{ user.nickname?.[0]?.toUpperCase() }}
                            </q-avatar>
                        </q-item-section>

                        <q-item-section>
                            <q-item-label>{{ user.nickname }}</q-item-label>
                            <q-item-label caption class="text-grey">
                                {{ user.id === creatorId ? "Creator" : "Member" }}

                            </q-item-label>
                        </q-item-section>
                        <q-item-section side v-if="userStore.user!.id === creatorId && user.id !== creatorId">
                            <q-btn round flat color="negative" icon="cancel" size="sm"
                                @click.stop="kickMember(user.id)" />
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
import type { Member } from 'src/contracts';
import { useAuthStore } from 'src/stores/authStore';
import { HomeService } from 'src/services';
import { useActivePage } from '../stores/threadStore';
import type { Channel } from '../contracts/Home';

export default {
    data() {
        return {
            userStore: useAuthStore(),
            activePage: useActivePage(),
            details: null as Channel | null,
        }
    },
    computed: {
        channelId(): number {
          return this.details?.id as number;
        },
        creatorId(): number | null {
            return this.details?.creatorId || null;
        },
        users(): Member[] {
            return this.activePage.members || [];
        },        
    },
    async mounted() {
        if (this.channelId) {
        await this.activePage.getMembers(this.channelId);
        this.details = this.activePage.getThreadDetails(this.channelId);
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
