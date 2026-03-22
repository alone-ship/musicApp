<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useUserStore } from '@renderer/plugins/pinia'
import { toRefs } from 'vue'

const route = useRoute()
const userStore = useUserStore()
const { userPlaylist } = toRefs(userStore)
</script>

<template>
  <div class="menu">
    <div class="title">
      <span>秋秋音乐</span>
    </div>
    <div class="content">
      <el-menu
        :router="true"
        :default-active="route.path === '/playlistInfo' ? '/' : route.path"
        style="height: 100%"
      >
        <el-menu-item index="/">歌单</el-menu-item>
        <el-menu-item index="/rank">排行榜</el-menu-item>
        <el-menu-item index="/recent">最近播放</el-menu-item>
        <el-menu-item index="/ctMusic">收藏音乐</el-menu-item>
        <el-sub-menu index="/playlistInfo">
          <template #title>
            <span>我的歌单</span>
          </template>
          <el-menu-item
            v-for="value in userPlaylist"
            :key="value['tid']"
            :index="`/playlistInfo/${value['tid']}`"
            >{{ value['diss_name'] }}</el-menu-item
          >
        </el-sub-menu>
      </el-menu>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.menu {
  display: flex;
  flex-direction: column;
  height: 100%;

  .title {
    height: 60px;
    display: flex;
    align-items: center;
    border-right: 1px solid var(--el-menu-border-color);
    padding: 0 20px;
    font-weight: bold;
    -webkit-app-region: drag;
    font-size: 20px;

    span {
      color: var(--el-menu-text-color);
    }
  }

  .content {
    flex: 1;
  }
}
</style>
