/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.group(() => {
  router.post('register', '#controllers/auth_controller.register');
  router.post('login', '#controllers/auth_controller.login');
  router.post('logout', '#controllers/auth_controller.logout')
    .use(middleware.auth({ guards: ['api'] }));
  router.get('me', '#controllers/auth_controller.me')
    .use(middleware.auth({ guards: ['api'] }));
})
.prefix('/auth');

router.group(() => {
  router.get('channels', '#controllers/home_controller.getChannels');
  router.get('invites', '#controllers/home_controller.getInvites');
  router.post('members', '#controllers/home_controller.getMembers');
  router.delete('channels', '#controllers/home_controller.deleteChannel')
})
.use(middleware.auth({ guards: ['api'] }))
.prefix('/home');