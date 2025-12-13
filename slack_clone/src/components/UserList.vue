<template>
    <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
        <q-card style="min-width: 300px; max-width: 400px;">
            <!-- Header -->
            <q-card-section class="row items-center q-pb-none q-gutter-sm">
                <div class="text-h6">Users in this channel</div>
                <q-space />
                <q-btn icon="close" flat round dense @click="$emit('update:modelValue', false)" />
            </q-card-section>

            <q-separator />

            <!-- User List -->
            <q-card-section class="q-pt-sm" style="max-height: 300px; overflow-y: auto;">
                <q-list bordered padding class="rounded-borders bg-grey-1">
                    <q-item v-for="(user, index) in users" :key="index">
                        <q-item-section avatar>
                            <q-avatar 
                                rounded
                                :text-color="getStatusColor(user)" 
                                class="q-mr-sm flex items-center justify-center"
                                :class="`border-${getStatusColor(user)}`"
                            >
                                {{ user.nickname?.[0]?.toUpperCase() }}
                            </q-avatar>
                        </q-item-section>

                        <q-item-section>
                            <q-item-label>{{ user.nickname }}</q-item-label>
                            <q-item-label caption class="text-grey">
                                {{ user.id === creatorId ? "Creator" : "Member" }}
                            </q-item-label>
                        </q-item-section>

                        <!-- Activity Bubble -->

                        <q-item-section side v-if="userStore.user!.id === creatorId && user.id !== creatorId">
                            <q-btn round flat color="negative" icon="cancel" size="sm"
                                @click.stop="kickMember(user.nickname)" />
                        </q-item-section>
                                                <q-item-section side>
                            <div 
                                class="activity-bubble q-mr-sm"
                                :style="{ backgroundColor: getStatusColor(user) }"
                            >
                                <q-tooltip>
                                    {{ ((user.status || 'offline') as string).charAt(0).toUpperCase() + ((user.status || 'offline') as string).slice(1) }}
                                </q-tooltip>
                            </div>
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
// import { HomeService } from 'src/services';
import { useActivePage } from '../stores/threadStore';
import type { Channel } from '../contracts/Home';
import SocketService from 'src/services/SocketService';

export default {
    props: {
        modelValue: {
            type: Boolean,
            required: true
        },
        channelId: {
            type: Number,
            required: false
        }
    },
    data() {
        return {
            userStore: useAuthStore(),
            activePage: useActivePage(),
            details: null as Channel | null,
        }
    },
    computed: {
        getStatusColor() {
            return (user: Member): string => {
                const status = (user.status || 'offline').toLowerCase();
                switch (status) {
                    case 'online':
                        return 'green';
                    case 'offline':
                        return 'grey';
                    case 'dnd':
                        return 'orange';
                    default:
                        return 'grey';
                }
            }
        },
        resolvedChannelId(): number {
            if (this.$props.channelId !== undefined) {
                return this.$props.channelId as number;
            }
            return (this.details?.id ?? this.activePage.activePageId ?? 0) as number;
        },
        creatorId(): number | null {
            return this.details?.creatorId || null;
        },
        users(): Member[] {
            return this.activePage.members || [];
        },        
    },
    
    async mounted() {
        const id = this.resolvedChannelId || this.activePage.activePageId;
        if (id) {
            await this.activePage.getMembers(id);
            this.details = this.activePage.getThreadDetails(id);
        } else {
            console.error('Channel ID is undefined');
        }
    },
    watch: {
        async modelValue(newVal: boolean) {
            if (newVal) {
                const id = this.resolvedChannelId || this.activePage.activePageId;
                if (id) {
                    await this.activePage.getMembers(id);
                    this.details = this.activePage.getThreadDetails(id);
                }
            }
        }
    },
    methods: {
        kickMember(userName: string) {
            const channelId = this.resolvedChannelId || this.activePage.activePageId;
            const currentUserId = this.userStore.user!.id;
            console.log(`Kicking user ${userName} from channel ${channelId} by admin ${currentUserId}`);
            SocketService.kickUser(channelId, userName, this.activePage.isAdmin(channelId, currentUserId) );
        }
    },
    emits: ['kickMemberEvent', 'update:modelValue', 'subscribe '],
}
</script>

<style scoped>
.activity-bubble {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: inline-block;
    position: relative;
}
</style>