<script setup lang="ts">
import { useRankStore, usePlayerStore } from '@renderer/plugins/pinia'
import { toRefs, onMounted, ref } from 'vue'

const rankStore = useRankStore()
const playerStore = usePlayerStore()

const { currentCategory, categories, rankList, pageNo, pageSize, total, pageRankList } =
  toRefs(rankStore)
const { playinglist, currentSong, playing, songIndex } = toRefs(playerStore)
const drawerShow = ref(false)

const getRankCategories = async (): Promise<void> => {
  const categoriesRes = await window.electron.ipcRenderer.invoke('/top/category')
  categories.value = categoriesRes
  currentCategory.value = categoriesRes[0]['list'][3]
}

const getRankList = async (id: number): Promise<void> => {
  const rankListRes = await window.electron.ipcRenderer.invoke('/top', { id })
  total.value = rankListRes['list'].length
  rankList.value = rankListRes['list']
}

const getRankListByPage = (newPage: number): void => {
  pageNo.value = newPage
  let arrStart = (pageNo.value - 1) * pageSize.value
  let arrEnd = arrStart + pageSize.value
  pageRankList.value = rankList.value.slice(arrStart, arrEnd)
}

const transformTime = (time: number): string => {
  let min = Math.floor(time / 60)
  let sec = time % 60
  return `0${min}:${sec < 10 ? '0' + sec : sec}`
}

const changeCategory = async (category: { id: number; label: string }): Promise<void> => {
  currentCategory.value = category
  await getRankList(category['topId'])
  getRankListByPage(1)
  drawerShow.value = false
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const playSong = (scope: any): void => {
  playing.value = true
  currentSong.value = scope.row
  songIndex.value = (pageNo.value - 1) * pageSize.value + scope.$index
  playinglist.value = rankList.value
}

onMounted(async () => {
  if (categories.value.length === 0) await getRankCategories()
  if (currentCategory.value) {
    await getRankList(currentCategory.value['topId'])
    getRankListByPage(1)
  }
})
</script>

<template>
  <div class="ranklist">
    <div class="ranklist-songs">
      <el-table
        :data="pageRankList"
        height="100%"
        row-class-name="table-song-row"
        cell-class-name="table-song-cell"
      >
        <el-table-column label="序号" width="80" align="center">
          <template #default="scope">
            <div class="song-index">{{ scope.$index + 1 }}</div>
          </template>
        </el-table-column>
        <el-table-column label="歌名/歌手" width="200">
          <template #default="scope">
            <div class="SONGINFO">
              <p class="songName">{{ scope.row['name'] }}</p>
              <p class="singerName">{{ scope.row['singerName'] }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <div class="song-controls">
              <el-icon size="24" @click="playSong(scope)"><i-ep-CaretRight /></el-icon>
              <el-icon size="20"><i-ep-CirclePlus /></el-icon>
              <el-icon size="20"><i-ep-Star /></el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="专辑" width="200">
          <template #default="scope">
            <div class="albumName">{{ scope.row['album']['name'] }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长" width="120" align="center">
          <template #default="scope">
            {{ transformTime(scope.row['interval']) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="ranklist-songs-footer">
      <div class="playlist-currentCategory">
        <span style="font-size: 14px">当前类型：</span>
        <el-button @click="drawerShow = true">
          {{ currentCategory?.label }}
        </el-button>
      </div>
      <el-pagination
        background
        layout="total, prev, pager, next, jumper"
        :page-size="rankStore.pageSize"
        :current-page="rankStore.pageNo"
        :total="rankStore.total"
        @current-change="getRankListByPage"
      />
      <div style="width: 130px"></div>
    </div>
    <el-drawer v-model="drawerShow" title="榜单分类" direction="rtl">
      <el-scrollbar style="margin-right: -10px; padding-right: 10px">
        <div v-for="item in categories" :key="item['type']" class="songlist-category">
          <span class="type">{{ item['title'] }}</span>
          <div class="items">
            <el-tag
              v-for="subItem in item['list']"
              :key="subItem['value']"
              class="tag"
              type="primary"
              size="large"
              @click="changeCategory(subItem)"
            >
              {{ subItem['label'] }}
            </el-tag>
          </div>
        </div>
      </el-scrollbar>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.ranklist {
  display: flex;
  flex-direction: column;
  height: 100%;

  .ranklist-songs {
    height: calc(100% - 50px);
    margin: 0 -20px;

    .song-index {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .song-controls {
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        margin: 0 10px;
        cursor: pointer;
        &:hover {
          color: var(--el-color-primary);
        }
      }
    }

    .SONGINFO {
      width: 100%;
      .songName {
        max-width: 200px;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .singerName {
        max-width: 200px;
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .albumName {
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .ranklist-songs-footer {
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
