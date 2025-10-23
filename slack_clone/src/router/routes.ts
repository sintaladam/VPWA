import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/channel/0' },
      { path: '/channel', redirect: '/channel/0' },
      { path: '/chat', redirect: '/chat/0' },
      { path: '/channel/:id', name: 'channel', component: () => import('pages/MainPage.vue') },
      { path: '/chat/:id', name: 'chat', component: () => import('pages/MainPage.vue') }
    ],
  },
  {
    path: '/login',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: '/login', component: () => import('pages/LoginPage.vue') },
      { path: '/register', component: () => import('pages/RegisterPage.vue') }

    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
