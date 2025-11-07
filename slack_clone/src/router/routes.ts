import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
    path: '/',
    // try redirect to home route
    redirect: () => ({ name: 'home' })
  },
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: 'register', name: 'register', meta: { guestOnly: true }, component: () => import('pages/RegisterPage.vue') },
      { path: 'login', name: 'login', meta: { guestOnly: true }, component: () => import('pages/LoginPage.vue') }
    ]
  },
  {
    path: '/channel',
    // channel requires auth
    meta: { requiresAuth: true },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // { path: '', name: 'home', component: () => import('src/pages/MainPage.vue') },
      { path: ':id?', name: 'home', component: () => import('src/pages/MainPage.vue') }
    ]
  },

  // {
  //   path: '/',
  //   component: () => import('layouts/MainLayout.vue'),
  //   children: [
  //     { path: '', redirect: '/channel/0' },
  //     { path: '/channel', redirect: '/channel/0' },
  //     { path: '/channel/:id', name: 'channel', component: () => import('pages/MainPage.vue') },
  //   ],
  // },
  // {
  //   path: '/login',
  //   component: () => import('layouts/AuthLayout.vue'),
  //   children: [
  //     { path: '', component: () => import('pages/LoginPage.vue') },
  //     { path: '/register', component: () => import('pages/RegisterPage.vue') }

  //   ],
  // },

  // {
  //   path: '/:catchAll(.*)*',
  //   component: () => import('pages/ErrorNotFound.vue'),
  // },
];

export default routes;
