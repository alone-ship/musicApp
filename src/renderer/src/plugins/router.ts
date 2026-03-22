import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Playlist',
      component: () => import('../views/playlist.vue')
    },
    {
      path: '/playlistInfo/:id?',
      name: 'PlaylistInfo',
      component: () => import('../views/playlistInfo.vue')
    },
    {
      path: '/rank',
      name: 'Rank',
      component: () => import('../views/rank.vue')
    },
    {
      path: '/recent',
      name: 'RecentPlay',
      component: () => import('../views/recentPlay.vue')
    },
    {
      path: '/ctMusic',
      name: 'CollectMusic',
      component: () => import('../views/ctMusic.vue')
    },
    {
      path: '/search/:keyword?',
      name: 'Search',
      component: () => import('../views/search.vue')
    }
  ]
})
