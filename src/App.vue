<template>
  <div class="min-h-screen bg-background">
    <!-- Main Content Area -->
    <main class="pb-20">
      <StoryTab v-if="activeTab === 'story'" @start-node="handleStartNode" />
      <DialogTab v-if="activeTab === 'dialog'" @return-to-story="handleReturnToStory" />
      <StatsTab v-if="activeTab === 'stats'" />
      <SettingsTab v-if="activeTab === 'settings'" />
    </main>

    <!-- Bottom Navigation -->
    <nav class="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div class="flex h-16">
        <!-- Story Tab (30%) -->
        <button @click="setActiveTab('story')" :disabled="isDialogActive"
          class="flex-1 flex items-center justify-center text-sm font-medium transition-colors border-r border-border disabled:opacity-50 disabled:cursor-not-allowed"
          :class="activeTab === 'story' ? 'text-primary bg-accent border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent'">
          <div class="flex flex-col items-center">
            <span class="text-lg">📖</span>
            <span>Story</span>
          </div>
        </button>

        <!-- Dialog Tab (30%) -->
        <button @click="setActiveTab('dialog')" :disabled="isDialogActive"
          class="flex-1 flex items-center justify-center text-sm font-medium transition-colors border-r border-border disabled:opacity-50 disabled:cursor-not-allowed"
          :class="activeTab === 'dialog' ? 'text-primary bg-accent border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent'">
          <div class="flex flex-col items-center">
            <span class="text-lg">💬</span>
            <span>Dialog</span>
          </div>
        </button>

        <!-- Stats Tab (30%) -->
        <button @click="setActiveTab('stats')" :disabled="isDialogActive"
          class="flex-1 flex items-center justify-center text-sm font-medium transition-colors border-r border-border disabled:opacity-50 disabled:cursor-not-allowed"
          :class="activeTab === 'stats' ? 'text-primary bg-accent border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent'">
          <div class="flex flex-col items-center">
            <span class="text-lg">📊</span>
            <span>Stats</span>
          </div>
        </button>

        <!-- Settings Tab (10%) -->
        <button @click="setActiveTab('settings')" :disabled="isDialogActive"
          class="w-16 flex items-center justify-center text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :class="activeTab === 'settings' ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground hover:bg-accent'">
          <div class="flex flex-col items-center">
            <span class="text-lg">⚙️</span>
            <span class="text-xs">Gear</span>
          </div>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGameState } from '@/composables/useGameState'
import StoryTab from '@/components/StoryTab.vue'
import DialogTab from '@/components/DialogTab.vue'
import StatsTab from '@/components/StatsTab.vue'
import SettingsTab from '@/components/SettingsTab.vue'

type Tab = 'story' | 'dialog' | 'stats' | 'settings'

const { gameState, hasSave, loadSave, startNewGame } = useGameState()

const activeTab = ref<Tab>('story')
const isDialogActive = computed(() => gameState.progress.currentNode !== undefined)

function setActiveTab(tab: Tab) {
  if (isDialogActive.value && tab !== 'dialog') return
  activeTab.value = tab
}

function handleStartNode() {
  activeTab.value = 'dialog'
}

function handleReturnToStory() {
  activeTab.value = 'story'
}

onMounted(() => {
  if (hasSave.value) {
    loadSave()
  } else {
    startNewGame()
  }
})
</script>
