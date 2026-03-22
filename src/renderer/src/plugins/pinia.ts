import { defineStore } from 'pinia'

export const usePlaylistStore = defineStore('playlist', () => {
  const playlist = ref([])
  const categories = ref([])
  const currentCategory = ref<{ id: number; name: string } | null>(null)
  const pageSize = ref(20)
  const pageNo = ref(1)
  const total = ref(0)

  return { playlist, categories, currentCategory, pageSize, pageNo, total }
})

export const usePlaylistInfoStore = defineStore('playlistInfo', () => {
  const list = ref([])
  const pageList = ref([])
  const current = ref<number | null>(null)
  const pageSize = ref(20)
  const pageNo = ref(1)
  const total = ref(0)

  return { list, current, pageList, pageSize, pageNo, total }
})

export const useRankStore = defineStore('rank', () => {
  const rankList = ref([])
  const pageRankList = ref([])
  const categories = ref([])
  const currentCategory = ref<{ id: number; label: string } | null>(null)
  const pageSize = ref(20)
  const pageNo = ref(1)
  const total = ref(0)

  return { rankList, pageRankList, categories, currentCategory, pageSize, pageNo, total }
})

export const usePlayerStore = defineStore('player', () => {
  const playing = ref(false)
  const songIndex = ref(-1)
  const currentSong = ref(null)
  const volume = ref(100)
  const isMuted = ref(false)
  const playinglist = ref([])
  const playType = ref(1) // 1:顺序播放 2:循环播放 3:随机播放 4:单曲循环
  const palyTypeAppand = ref('shunxubofang')

  return { playing, currentSong, volume, isMuted, playinglist, songIndex, playType, palyTypeAppand }
})

export const useUserStore = defineStore('user', () => {
  const recentPlay = ref([])
  const love = ref([])
  const collect = ref([])
  const userPlaylist = ref([])

  return { recentPlay, love, collect, userPlaylist }
})
