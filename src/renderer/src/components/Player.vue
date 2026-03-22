<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { usePlayerStore, useUserStore } from '@renderer/plugins/pinia'
import { ElMessage } from 'element-plus'
import { toRefs, watch, ref } from 'vue'

const playerStore = usePlayerStore()
const userStore = useUserStore()
const { playing, currentSong, volume, isMuted, songIndex, playinglist, playType, palyTypeAppand } =
  toRefs(playerStore)
const { recentPlay } = toRefs(userStore)
const currentImg = ref<string>(
  'https://qpic.y.qq.com/music_cover/LQ4zic8aEyNEreHko5rQ2a6S0JjhXjvoxzTWXvqiaZDDvJWlibGcCWa4g/300?n=1'
)
const songUrl = ref<string | null>(null)
const audioPlayer = ref<HTMLAudioElement | null>(null)
const playProgress = ref<number>(0)
const playProgressmax = ref<number>(0)
const audioCanUpdateProgress = ref<boolean>(true)
const songMid = ref<string | null>(null)

watch(
  () => currentSong.value,
  async (newValue: any) => {
    let imgMid = null
    if (newValue?.album?.mid) {
      imgMid = newValue?.album?.mid
    }
    if (newValue?.albummid) {
      imgMid = newValue?.albummid
    }
    if (newValue.mid) {
      songMid.value = newValue.mid
    } else if (newValue.songmid) {
      songMid.value = newValue.songmid
    }
    if (imgMid)
      currentImg.value = `https://y.qq.com/music/photo_new/T002R300x300M000${imgMid}_1.jpg?max_age=2592000`
    getSongUrl(currentSong.value)
    recentPlay.value = recentPlay.value.filter(
      (s: any) => (s.mid && s.mid !== songMid.value) || (s.songmid && s.songmid !== songMid.value)
    )
    ;(recentPlay.value as any[]).unshift(currentSong.value)
    await window.electron.ipcRenderer.invoke(
      '/user/update/recentplay',
      JSON.stringify(currentSong.value)
    )
  }
)

const getSongUrl = async (current: any): Promise<void> => {
  let type = '128'
  if (current?.file) {
    current = current.file
    if (current?.size_128mp3 && current?.size_128mp3 !== 0) type = '128'
    if (current?.size_320mp3 && current?.size_320mp3 !== 0) type = '320'
    if (current?.size_flac && current?.size_flac !== 0) type = 'flac'
  } else {
    if (current?.size128 && current?.size128 !== 0) type = '128'
    if (current?.size320 && current?.size320 !== 0) type = '320'
    if (current?.sizeflac && current?.sizeflac !== 0) type = 'flac'
  }
  console.log(current, type)

  if (songMid.value !== null) {
    songUrl.value = await window.electron.ipcRenderer.invoke('/song/url', {
      id: songMid.value,
      type
    })
  }
}

const joinSingerName = (song: any): string => {
  if (song?.singer) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return song.singer.map((singer: any) => singer.name).join('、')
  }
  return '未知歌手'
}

const playCurrentSong = (): void => {
  audioPlayer.value?.play()
  playProgressmax.value = audioPlayer.value?.duration || 0
}

const updatePlayProgress = (): void => {
  if (audioCanUpdateProgress.value && audioPlayer.value) {
    playProgress.value = audioPlayer.value?.currentTime || 0
  }
}

const handlePlayProgressChange = (): void => {
  if (audioPlayer.value) {
    audioPlayer.value.currentTime = playProgress.value
  }
}

const handleVolumeChange = (): void => {
  if (audioPlayer.value) {
    audioPlayer.value.volume = volume.value / 100
  }
}

const togglePlaying = (): void => {
  if (audioPlayer.value) {
    playing.value = !playing.value
    if (playing.value) {
      audioPlayer.value.play()
    } else {
      audioPlayer.value.pause()
    }
  }
}

const changeCurrentSong = (index: number): void => {
  if (currentSong.value && songIndex.value !== -1) {
    switch (playType.value) {
      case 1:
        {
          songIndex.value = songIndex.value + index
          let maxIndex = playinglist.value.length - 1
          if (songIndex.value < 0) {
            songIndex.value = 0
            ElMessage({
              type: 'warning',
              message: '已经是第一首了'
            })
          }
          if (songIndex.value > maxIndex) {
            songIndex.value = maxIndex
            ElMessage({
              type: 'warning',
              message: '播放完毕'
            })
          }
          currentSong.value = playinglist.value[songIndex.value]
        }
        break
      case 2:
        {
          songIndex.value = songIndex.value + index
          let maxIndex = playinglist.value.length - 1
          if (songIndex.value < 0) {
            songIndex.value = maxIndex
          }
          if (songIndex.value > maxIndex) {
            songIndex.value = 0
          }
          currentSong.value = playinglist.value[songIndex.value]
        }
        break
      case 3:
        {
          let randomIndex = Math.floor(Math.random() * (playinglist.value.length - 1))
          while (randomIndex === songIndex.value) {
            randomIndex = Math.floor(Math.random() * (playinglist.value.length - 1))
          }
          songIndex.value = randomIndex
          currentSong.value = playinglist.value[randomIndex]
        }
        break
      default: {
        if (audioPlayer.value) {
          audioPlayer.value.currentTime = 0
          audioPlayer.value.play()
        }
      }
    }
  }
}

const changePlayType = (type: number, icon: string): void => {
  playType.value = type
  palyTypeAppand.value = icon
}

const changeMuted = (): void => {
  isMuted.value = !isMuted.value
  if (audioPlayer.value) {
    audioPlayer.value.muted = isMuted.value
  }
}
</script>

<template>
  <div class="player">
    <div class="music-progress">
      <div
        class="container"
        @mouseenter="audioCanUpdateProgress = false"
        @mouseleave="audioCanUpdateProgress = true"
      >
        <input
          v-model="playProgress"
          :max="playProgressmax"
          type="range"
          class="progress"
          @input="handlePlayProgressChange"
        />
      </div>
    </div>
    <div class="song-detail">
      <div class="song-img">
        <img :src="currentImg" alt="Song Image" />
      </div>
      <div class="song-info">
        <p class="song-name">
          {{ (currentSong as any)?.title || (currentSong as any)?.songname || '歌曲名称' }}
        </p>
        <p class="singer-name">{{ joinSingerName(currentSong) }}</p>
      </div>
    </div>
    <div class="play-controls">
      <el-button type="primary" @click="changeCurrentSong(-1)">⏮</el-button>
      <el-button type="primary" style="width: 45px" @click="togglePlaying">
        <span v-if="playing">⏸</span>
        <span v-else style="margin: 0 -3px -2px 0">▶</span>
      </el-button>
      <el-button type="primary" @click="changeCurrentSong(1)">⏭</el-button>
    </div>
    <div class="song-controls">
      <div class="control-icons">
        <el-popover placement="top" trigger="click">
          <template #reference>
            <i class="iconfont" :class="`icon-${palyTypeAppand}`"></i>
          </template>
          <div class="play-type-options">
            <div @click="changePlayType(1, 'shunxubofang')">顺序播放</div>
            <div @click="changePlayType(2, 'xunhuanbofang-1')">循环播放</div>
            <div @click="changePlayType(3, 'suijibofang-01')">随机播放</div>
            <div @click="changePlayType(4, 'danquxunhuan')">单曲循环</div>
          </div>
        </el-popover>
        <el-icon size="24"><i-ep-CirclePlus /></el-icon>
        <el-icon size="24"><i-ep-Star /></el-icon>
        <el-icon size="24"><i-ep-Expand /></el-icon>
      </div>
      <div class="volume-control">
        <div class="volume" @click="changeMuted">
          <el-icon v-if="!isMuted" size="20"><i-ep-Bell /></el-icon>
          <el-icon v-else size="20"><i-ep-MuteNotification /></el-icon>
        </div>
        <input
          v-model="volume"
          class="volume-slider"
          type="range"
          max="100"
          step="1"
          @input="handleVolumeChange"
        />
      </div>
    </div>
    <audio
      ref="audioPlayer"
      :src="songUrl || undefined"
      @timeupdate="updatePlayProgress"
      @canplay="playCurrentSong"
      @ended="changeCurrentSong(1)"
    ></audio>
  </div>
</template>

<style lang="scss" scoped>
.player {
  display: flex;
  height: 100%;
  justify-content: space-between;
  padding: 0 20px;
  margin: 0 -20px;
  align-items: center;
  position: relative;

  .music-progress {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;

    .container {
      width: 100%;
      height: 100%;
      position: relative;

      .progress {
        position: absolute;
        top: 0;
        width: 100%;
        -webkit-appearance: none;
        appearance: none;
        margin: 0;
        outline: 0;
        background-color: transparent;
        cursor: pointer;

        &::-webkit-slider-container {
          overflow: hidden;
        }

        &::-webkit-slider-runnable-track {
          background-color: var(--el-border-color);
          height: 3px;
        }

        &::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 3px;
          height: 3px;
          background-color: var(--el-color-success);
          border: 1px solid transparent;
          border-image: linear-gradient(var(--el-color-success), var(--el-color-success)) 0 fill / 0
            0 0 0 / 0 0 0 99vw;
        }
      }
      &:hover {
        .progress::-webkit-slider-runnable-track {
          height: 5px;
        }
        .progress::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 5px;
        }
      }
    }
  }

  .song-detail {
    display: flex;
    align-items: center;
    justify-content: center;

    .song-img {
      width: 80px;
      height: 80px;
      margin-right: 20px;
      border-radius: 5px;
      overflow: hidden;
      background-color: var(--el-bg-color);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .song-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: 200px;

      .song-name {
        width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 14px;
        font-weight: bold;
      }

      .singer-name {
        width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 10px;
        font-size: 12px;
      }
    }
  }

  .song-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;

    .control-icons {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
    }

    .volume-control {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;

      .volume {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        cursor: pointer;
      }

      .volume-slider {
        width: 130px;
        height: 5px;
        -webkit-appearance: none;
        appearance: none;
        margin: 0;
        outline: 0;
        background-color: transparent;
        cursor: pointer;

        &::-webkit-slider-container {
          border-radius: 3px;
          overflow: hidden;
        }

        &::-webkit-slider-runnable-track {
          background-color: var(--el-border-color);
          height: 5px;
        }

        &::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 5px;
          height: 5px;
          background-color: var(--el-color-primary);
          border: 1px solid transparent;
          border-image: linear-gradient(var(--el-color-primary), var(--el-color-primary)) 0 fill / 0
            0 0 0 / 0 0 0 99vw;
        }
      }
    }
  }
}
</style>
