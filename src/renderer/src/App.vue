<script setup lang="ts">
import { onMounted, toRefs } from 'vue'
import { useUserStore } from './plugins/pinia'
const userStore = useUserStore()
const { recentPlay, love, userPlaylist } = toRefs(userStore)

const getUserData = async (): Promise<void> => {
  const res = await window.electron.ipcRenderer.invoke('/user/songlist')
  const loveRes = await window.electron.ipcRenderer.invoke('/songlist', {
    id: res.list[1].tid
  })
  love.value = loveRes.songlist
  userPlaylist.value = res.list.slice(3)
  const recentPlayRes = await window.electron.ipcRenderer.invoke('/user/recentplay')
  recentPlay.value = recentPlayRes
}

onMounted(async () => {
  await getUserData()
})
</script>

<template>
  <div class="common-layout">
    <el-container style="height: 100%">
      <el-aside width="200px"><Menu /></el-aside>
      <el-container>
        <el-header><Header /></el-header>
        <el-main>
          <router-view :key="$route.fullPath" />
        </el-main>
        <el-footer height="100px"><Player /></el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
.common-layout {
  width: 100vw;
  height: 100vh;
}
</style>
