import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
// import { useUserStore } from 'src/stores/userUserStore'; 

export default defineRouter(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Router.beforeEach((to, from, next) => {
  //   const userStore = useUserStore();
  //   const isAuthenticated = userStore.isAuthenticated;
    
  //   if (to.path.startsWith('/channel')) {
  //     if (!isAuthenticated) {
  //       return next('/login');
  //     }
  //   }

  //   if (to.path.startsWith('/login') && isAuthenticated) {
  //     return next('/channel/0');
  //   }

  //   next();
  // });

  return Router;
});
