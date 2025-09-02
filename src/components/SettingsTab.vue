<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-6">Settings</h1>

    <div class="space-y-6">
      <!-- Game Controls -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold">Game Controls</h2>

        <div class="space-y-3">
          <button @click="startNewGame"
            class="w-full p-3 border border-destructive text-destructive bg-background rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors">
            Start New Game
          </button>

          <button @click="exportSave"
            class="w-full p-3 border border-border bg-background text-foreground rounded-md hover:bg-accent transition-colors">
            Export Save
          </button>

          <button @click="importSave"
            class="w-full p-3 border border-border bg-background text-foreground rounded-md hover:bg-accent transition-colors">
            Import Save
          </button>
        </div>
      </div>

      <!-- Audio Settings -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold">Audio</h2>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span>Master Volume</span>
            <input type="range" min="0" max="100" v-model="audioSettings.masterVolume" class="w-24" />
          </div>

          <div class="flex items-center justify-between">
            <span>Music Volume</span>
            <input type="range" min="0" max="100" v-model="audioSettings.musicVolume" class="w-24" />
          </div>

          <div class="flex items-center justify-between">
            <span>Sound Effects</span>
            <input type="range" min="0" max="100" v-model="audioSettings.sfxVolume" class="w-24" />
          </div>
        </div>
      </div>

      <!-- Display Settings -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold">Display</h2>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span>Dark Mode</span>
            <input type="checkbox" v-model="displaySettings.darkMode" class="w-4 h-4" />
          </div>

          <div class="flex items-center justify-between">
            <span>Text Size</span>
            <select v-model="displaySettings.textSize" class="px-2 py-1 border rounded">
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div class="flex items-center justify-between">
            <span>Reduce Motion</span>
            <input type="checkbox" v-model="displaySettings.reduceMotion" class="w-4 h-4" />
          </div>
        </div>
      </div>

      <!-- Game Info -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold">Game Info</h2>

        <div class="p-4 border rounded-lg bg-muted">
          <p class="text-sm text-muted-foreground">
            <strong>Alter Life</strong> - A narrative-driven game about supporting your partner during pregnancy and
            early parenthood.
          </p>
          <p class="text-sm text-muted-foreground mt-2">
            Version 1.0.0 | First Trimester Vertical Slice
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useGameState } from '@/composables/useGameState'

const { startNewGame } = useGameState()

const audioSettings = reactive({
  masterVolume: 100,
  musicVolume: 80,
  sfxVolume: 100
})

const displaySettings = reactive({
  darkMode: false,
  textSize: 'medium' as 'small' | 'medium' | 'large',
  reduceMotion: false
})

// Load settings from localStorage on mount
onMounted(() => {
  const savedAudio = localStorage.getItem('alter-life-audio-settings')
  const savedDisplay = localStorage.getItem('alter-life-display-settings')

  if (savedAudio) {
    try {
      Object.assign(audioSettings, JSON.parse(savedAudio))
    } catch (error) {
      console.error('Failed to load audio settings:', error)
    }
  }

  if (savedDisplay) {
    try {
      Object.assign(displaySettings, JSON.parse(savedDisplay))
    } catch (error) {
      console.error('Failed to load display settings:', error)
    }
  }
})

// Save settings to localStorage when they change
watch(audioSettings, (newSettings) => {
  localStorage.setItem('alter-life-audio-settings', JSON.stringify(newSettings))
}, { deep: true })

watch(displaySettings, (newSettings) => {
  localStorage.setItem('alter-life-display-settings', JSON.stringify(newSettings))
}, { deep: true })

// Watch for dark mode changes and apply to document
watch(() => displaySettings.darkMode, (isDark) => {
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}, { immediate: true })

function exportSave() {
  const saveData = localStorage.getItem('alter-life-save')
  if (saveData) {
    const blob = new Blob([saveData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'alter-life-save.json'
    a.click()
    URL.revokeObjectURL(url)
  }
}

function importSave() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const saveData = e.target?.result as string
          localStorage.setItem('alter-life-save', saveData)
          // Reload the page to apply the new save
          window.location.reload()
        } catch (error) {
          console.error('Failed to import save:', error)
          alert('Failed to import save file. Please check the file format.')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}
</script>
