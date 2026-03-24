<script setup lang="ts">
import { ref, onMounted, toRefs } from 'vue'
import { useRouter } from 'vue-router'
import { usePlaylistStore, usePlaylistInfoStore } from '../plugins/pinia'

const router = useRouter()
const showDrawer = ref(false)
const playlistStore = usePlaylistStore()
const playlistInfoStore = usePlaylistInfoStore()
const { current } = toRefs(playlistInfoStore)
const { categories, currentCategory, playlist, pageSize, pageNo, total } = toRefs(playlistStore)

const getPlaylist = async (newPage?: number): Promise<void> => {
  if (newPage) pageNo.value = newPage
  const query = {
    category: currentCategory.value?.id || '',
    pageSize: pageSize.value,
    pageNo: pageNo.value,
    sort: 5
  }
  const playlistRes = await window.electron.ipcRenderer.invoke('/songlist/list', query)
  total.value = playlistRes['total']
  playlist.value = playlistRes['list']
}

const getPlaylistCategory = async (): Promise<void> => {
  const categoriesRes = await window.electron.ipcRenderer.invoke('/songlist/category')
  categories.value = categoriesRes
  currentCategory.value = categoriesRes[0]['list'][0]
}

const goPlaylistInfo = (playlist: { id: number }): void => {
  current.value = playlist['dissid']
  router.push({ name: 'PlaylistInfo' })
}

const changeCategory = (category: { id: number; name: string }): void => {
  currentCategory.value = category
  getPlaylist(1)
  showDrawer.value = false
}

/**
 * 初始化函数
 * 加载歌单分类以及默认歌单
 */
onMounted(async () => {
  if (categories.value.length === 0) await getPlaylistCategory()
  if (currentCategory.value) getPlaylist()
})
</script>

<template>
  <div class="playlist">
    <div class="playlist-content">
      <el-scrollbar style="height: 100%">
        <div class="playlist-grid-container">
          <el-card
            v-for="item in playlist"
            :key="item['id']"
            body-style="padding: 10px;"
            class="playlist-grid-item"
            style="cursor: pointer"
            @click="goPlaylistInfo(item)"
          >
            <img :src="item['imgurl']" style="width: 100%" alt="" />
            <template #footer>
              {{ item['dissname'] }}
            </template>
          </el-card>
        </div>
      </el-scrollbar>
    </div>
    <div class="playlist-footer">
      <div class="playlist-currentCategory">
        <span style="font-size: 14px">当前类型：</span>
        <el-button @click="showDrawer = true">
          {{ currentCategory?.name }}
        </el-button>
      </div>
      <el-pagination
        background
        layout="total, prev, pager, next, jumper"
        :page-size="pageSize"
        :current-page="pageNo"
        :total="total"
        @current-change="getPlaylist"
      />
      <div style="width: 130px"></div>
    </div>
    <el-drawer v-model="showDrawer" direction="rtl" title="歌单分类">
      <el-scrollbar style="margin-right: -10px; padding-right: 10px">
        <div v-for="item in categories" :key="item['type']" class="songlist-category">
          <span class="type">{{ item['type'] }}</span>
          <div class="items">
            <el-tag
              v-for="subItem in item['list']"
              :key="subItem['id']"
              class="tag"
              type="primary"
              size="large"
              @click="changeCategory(subItem)"
            >
              {{ (subItem['name'] as string).replace('#38;', '') }}
            </el-tag>
          </div>
        </div>
      </el-scrollbar>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.playlist {
  display: flex;
  flex-direction: column;
  height: 100%;

  .playlist-content {
    height: calc(100% - 50px);

    .playlist-grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
      padding: 0 20px;
    }
  }

  .playlist-footer {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    margin-top: 10px;
  }

  .songlist-category {
    display: flex;
    flex-direction: column;

    .type {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 5px;
      margin-bottom: 10px;
    }

    .items {
      display: flex;
      flex-wrap: wrap;
      margin-left: 10px;
      margin-bottom: 10px;
      gap: 10px;

      .tag {
        cursor: pointer;
      }
    }
  }
}
</style>
