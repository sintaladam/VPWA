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
  router.post('update', '#controllers/auth_controller.update')
    .use(middleware.auth({ guards: ['api'] }));
})
.prefix('/auth');

router.group(() => {
  router.get('channels', '#controllers/channel_controller.getChannels');
  router.get('channels/public', '#controllers/channel_controller.getAllPublicChannels');
  router.post('channels/create', '#controllers/channel_controller.createChannel');
  router.post('channels/update', '#controllers/channel_controller.updateChannel');
  router.delete('channels/delete', '#controllers/channel_controller.deleteChannel');
  router.post('channels/join', '#controllers/channel_controller.joinChannel');
  router.post('channels/members', '#controllers/channel_controller.getMembers');
  router.post('channels/kick', '#controllers/channel_controller.kickMember');
  router.post('channels/search', '#controllers/channel_controller.searchChannels');

  router.get('invites', '#controllers/invite_controller.getInvites');
  router.post('invites/handle', '#controllers/invite_controller.handleInvite');
  router.post('invites/create', '#controllers/invite_controller.createInvite');
})
.use(middleware.auth({ guards: ['api'] }))
.prefix('/home');