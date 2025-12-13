<template>
  <transition @before-leave="beforeLeave" @leave="leave">
    <q-card
      v-if="visible && channel"
      flat
      bordered
      class="q-mb-sm full-width invite-card"
      :style="{ transform: `translateX(${offset}px)`, transition: animating ? 'transform 0.3s ease-out' : 'none' }"
    >
      <!-- hide default chevron with empty expand-icon and control expansion via opened -->
      <q-expansion-item dense header-class="q-py-sm q-px-md" expand-icon="">
        <template #header>
          <div class="row items-center justify-between" style="width:100%">
            <div style="min-width:0">
              <div class="text-weight-medium" style="white-space:normal; word-break:break-word; overflow-wrap:anywhere;">
                {{ channel.name }}
              </div>
              <div class="text-caption text-orange-10 q-mt-xs row items-center q-gutter-xs">
                <q-icon name="schedule" size="14px" />
                <span class="q-ml-xs">Pending invitation</span>
              </div>
            </div>

            <div class="row items-center no-wrap">
              <q-btn round flat color="negative" icon="close" size="sm" @click.stop="handleReject" class="q-mr-sm no-outline" />
              <q-btn round flat color="positive" icon="check" size="sm" @click.stop="handleAccept" class="q-mr-sm no-outline" />
            </div>
          </div>
        </template>

        <q-card-section class="q-pt-none">
          <div class="text-subtitle2">
            <strong>Type:</strong> 
            <span style="white-space:normal; word-break:break-word">
              {{ channel.type }}
            </span>
          </div>
          <div class="text-body2 q-mt-sm" style="white-space:normal; word-break:break-word">
                        <strong>Description:</strong> 

            {{ channel.description || 'No description' }}
          </div>
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
import SocketService from 'src/services/SocketService';

export default {
    data() {
        return {
            activeStore: useActivePage(),
            visible: true,
            offset: 0,
            animating: false,
        }
    },
    props: {
        invite: {
            type: Object as () => Invite,
            required: true
        }
    },
    computed: {
        channel(): Channel | null {
            return (this.invite && (this.invite as Invite).channel) ?? null;
        }
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
                SocketService.joinChannel(this.channel?.id || -1);
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

<style scoped>
/* remove focus/active/hover outline and shadow for our buttons */
.no-outline,
.no-outline:focus,
.no-outline:active,
.no-outline:hover,
.no-outline:focus-visible {
  outline: none !important;
  box-shadow: none !important;
  -webkit-tap-highlight-color: transparent;
}

/* ensure internal content doesn't show extra focus ring */
.no-outline .q-btn__content,
.no-outline .q-btn__wrapper {
  outline: none !important;
  box-shadow: none !important;
}
</style>