<script setup lang="ts">
import { useRoute } from 'vue-router'
import { usePlayerStore } from '@renderer/plugins/pinia'
import { toRefs, onMounted, ref } from 'vue'

const route = useRoute()
const keyword = ref(route.params.keyword)
const query = ref({
  key: keyword.value || '',
  pageNo: 1,
  pageSize: 20,
  t: 0 // 0：单曲，2：歌单，7：歌词，8：专辑，9：歌手，12：mv
})
const total = ref(0)
const playerStore = usePlayerStore()
const { playing, currentSong, playinglist, songIndex } = toRefs(playerStore)
const songlist = ref([])

const joinSingerName = (singer: []): string => {
  return singer.map((item) => item['name']).join('/')
}

const transformTime = (time: number): string => {
  let min = Math.floor(time / 60)
  let sec = time % 60
  return `0${min}:${sec < 10 ? '0' + sec : sec}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const playSong = (scope: any): void => {
  playing.value = true
  currentSong.value = scope.row
  songIndex.value = scope.$index
  playinglist.value = songlist.value
}

const getSongs = async (newPage?: number): Promise<void> => {
  if (newPage) query.value.pageNo = newPage
  try {
    const response = await window.electron.ipcRenderer.invoke('/search', { ...query.value })
    console.log(response)
    songlist.value = response['list'] || []
    total.value = response['total'] || 0
  } catch (error) {
    console.error('Failed to fetch playlist info:', error)
  }
}

onMounted(() => {
  getSongs()
})
</script>

<template>
  <div class="playlist-info">
    <div class="playlist-info-content">
      <el-table
        :data="songlist"
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
              <p class="songName">{{ scope.row['songname'] || scope.row['name'] }}</p>
              <p class="singerName">{{ joinSingerName(scope.row['singer']) }}</p>
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
            <div class="albumName">{{ scope.row['albumname'] }}</div>
          </template>
        </el-table-column>
        <el-table-column label="时长" width="120" align="center">
          <template #default="scope">
            {{ transformTime(scope.row['interval']) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="playlist-info-footer">
      <el-pagination
        background
        layout="total, prev, pager, next, jumper"
        :page-size="query.pageSize"
        :current-page="query.pageNo"
        :total="total"
        @current-change="getSongs"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.playlist-info {
  display: flex;
  flex-direction: column;
  height: 100%;

  .playlist-info-content {
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

  .playlist-info-footer {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 10px;
    margin-top: 10px;
  }
}
</style>
