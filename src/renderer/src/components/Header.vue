<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const searchText = ref('')
const router = useRouter()

const goSearch = (): void => {
  if (searchText.value) {
    router.push({ name: 'Search', params: { keyword: searchText.value } })
  }
}

const windowControls = (type: string): void => {
  if (type === 'min') {
    window.electron.ipcRenderer.invoke('winMinimize')
  } else if (type === 'max') {
    const winWidth = document.documentElement.clientWidth
    let type: string | null = null
    if (winWidth > 1220) type = 'restore'
    else type = 'maximize'
    if (type) window.electron.ipcRenderer.invoke('winMaximize', type)
  } else {
    window.electron.ipcRenderer.invoke('winClose')
  }
}
</script>

<template>
  <div class="header">
    <div class="container">
      <div class="arrow">
        <div class="arrowBtn" @click="$router.go(-1)">
          <el-icon size="20"><i-ep-ArrowLeft /></el-icon>
        </div>
        <div class="arrowBtn" @click="$router.go(1)">
          <el-icon size="20"><i-ep-ArrowRight /></el-icon>
        </div>
      </div>
      <div class="searchInput">
        <el-input
          v-model="searchText"
          placeholder="请输入搜索内容"
          clearable
          @keyup.enter="goSearch"
        >
          <template #append>
            <el-button class="searchBtn" @click="goSearch">
              <el-icon><i-ep-Search /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>
    </div>
    <div class="windowControls">
      <div class="windowControlBtn" @click="windowControls('min')">
        <el-icon size="20"><i-ep-Minus /></el-icon>
      </div>
      <div class="windowControlBtn" @click="windowControls('close')">
        <el-icon size="22"><i-ep-Close /></el-icon>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.header {
  width: 100%;
  height: 45px;
  display: flex;
  align-items: flex-end;
  -webkit-app-region: drag;

  .container {
    display: flex;
    -webkit-app-region: no-drag;

    .arrow {
      display: flex;
      align-items: center;
      margin-left: 10px;

      .arrowBtn {
        width: 40px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        &:hover {
          color: var(--el-color-primary);
        }
      }
    }

    .searchInput {
      margin-left: 10px;
    }
  }

  .windowControls {
    display: flex;
    margin-left: auto;
    -webkit-app-region: no-drag;

    .windowControlBtn {
      width: 40px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      .maximize {
        display: block;
        width: 12px;
        height: 12px;
        border: 1.5px solid var(--el-menu-text-color);
      }
    }
  }
}
</style>
