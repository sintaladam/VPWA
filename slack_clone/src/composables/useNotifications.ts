import { AppVisibility } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import type { Message, User } from 'src/contracts'

export function useNotifications() {
  const auth = useAuthStore()
  async function requestPermission(): Promise<boolean> {
    if (typeof Notification === 'undefined') return false
    if (Notification.permission === 'granted') return true
    const res = await Notification.requestPermission()
    return res === 'granted'
  }

  async function notifyForMessage(message: Message, channel: string) {
    const user = auth.user
    if (!user) return

    if (user.status === 'DND') return
    
    // check if user wants notifications only when mentioned
    if ((user as User).mentionsOnly === true && !message.content.includes(`@${user.nickname}`)) return

    if (message.sender?.id === user.id) return

    const ok = await requestPermission()
    if (!ok) return

    if (AppVisibility.appVisible) return // Boolean

    const title = (message.sender?.nickname ?? 'New message') + ' in ' + channel
    const body = (message.content ?? '').slice(0, 120)

    try {
      new Notification(title, { body })
    } catch (err) {
      console.warn('notification error', err)
    }
  }

  return { notifyForMessage, requestPermission }
}