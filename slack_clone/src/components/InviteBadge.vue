<template>
    <transition @before-leave="beforeLeave" @leave="leave">
        <q-card v-if="visible && channel" flat bordered
            class="q-mb-sm full-width invite-card"
            :style="{ transform: `translateX(${offset}px)`, transition: animating ? 'transform 0.3s ease-out' : 'none' }">
            <q-expansion-item dense :label="channel.name" header-class="q-py-sm q-px-md">
                <template v-slot:header>
                    <q-item-section>
                        <div class="text-weight-medium">{{ channel.name }}</div>
                        <div class="text-caption text-orange-10 q-mt-xs row items-center q-gutter-xs">
                            <q-icon name="schedule" size="14px" />
                            <span>Pending invitation</span>
                        </div>
                    </q-item-section>

                    <q-item-section side>
                        <div class="row q-gutter-sm">
                            <q-btn round flat color="negative" icon="close" size="sm" @click.stop="handleReject" />
                            <q-btn round flat color="positive" icon="check" size="sm" @click.stop="handleAccept" />
                        </div>
                    </q-item-section>
                </template>

                <q-card-section class="q-pt-none">
                    <q-list dense>
                        <q-item>
                            <q-item-section>
                                <q-item-label caption>Type</q-item-label>
                                <q-item-label>{{ channel.type }}</q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-item>
                            <q-item-section>
                                <q-item-label caption>Description</q-item-label>
                                <q-item-label>{{ channel.description || 'No description' }}</q-item-label>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-card-section>
            </q-expansion-item>
        </q-card>
    </transition>
</template>

<script lang="ts">
import type { Invite, Channel } from 'src/contracts';
//import type { InviteType } from '../components/models';
import { useActivePage } from 'src/stores/threadStore';
import { notify } from 'src/utils/helperFunctions';

export default {
    data() {
        return {
            activeStore: useActivePage(),
            visible: true,
            offset: 0,
            animating: false,
            channel: null as Channel | null | undefined
        }
    },
    props: {
        invite: {
            type: Object as () => Invite,
            required: true
        }
    },
    created() {
        this.channel= this.invite.channel
    },
    methods: {
        async handleAccept() {
            const res = await this.activeStore.handleInvite(this.invite.id, 'accept');
            if (res) {
                this.animating = true;
                this.offset = -400;
                setTimeout(() => {
                    this.visible = false;
                }, 300);
                notify(`${this.channel?.name} was added to your channels`, 'positive');
            }
            else {
                notify(`accept invitation to ${this.channel?.name} failed`, 'negative');
            }
        },
        async handleReject() {
            const res = await this.activeStore.handleInvite(this.invite.id, 'reject');
            if (res) {
                this.animating = true;
                this.offset = 400;
                setTimeout(() => {
                    this.visible = false;
                }, 300);
                notify(`invitation to ${this.channel?.name} was rejected`, 'positive');
            }
            else {
                notify(`reject invitation to ${this.channel?.name} failed`, 'negative');
            }

        },
        beforeLeave(el: Element) {
            (el as HTMLElement).style.height = (el as HTMLElement).offsetHeight + 'px';
        },
        leave(el: Element, done: () => void) {
            setTimeout(() => {
                (el as HTMLElement).style.height = '0';
                (el as HTMLElement).style.marginBottom = '0';
                (el as HTMLElement).style.overflow = 'hidden';
                (el as HTMLElement).style.transition = 'all 0.3s ease-out';
            }, 10);
            setTimeout(done, 300);
        },
    }
}
</script>