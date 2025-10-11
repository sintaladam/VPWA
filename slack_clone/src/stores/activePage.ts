import { defineStore } from 'pinia';

export const useActivePage = defineStore('channelPage', {
  state: () => ({
    activePage: '', // current active page or channel name
  }),
  actions: {
    setActivePage(pageName: string) {
      this.activePage = pageName
    }
  }
})
