<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-6">Stats Hub</h1>
    
    <!-- Inner Tab Navigation -->
    <div class="flex border-b border-border mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeInnerTab = tab.id"
        class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
        :class="activeInnerTab === tab.id 
          ? 'border-primary text-primary' 
          : 'border-transparent text-muted-foreground hover:text-foreground'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Stats Tab -->
    <div v-if="activeInnerTab === 'stats'" class="space-y-4">
      <div
        v-for="(value, stat) in gameState.stats"
        :key="stat"
        class="p-4 border rounded-lg"
      >
        <div class="flex justify-between items-center mb-2">
          <span class="font-medium capitalize">{{ formatStatName(stat) }}</span>
          <span class="text-sm text-muted-foreground">{{ value }}/100</span>
        </div>
        <div class="w-full bg-muted rounded-full h-2">
          <div
            class="bg-primary h-2 rounded-full transition-all duration-300"
            :style="{ width: `${value}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Inventory Tab -->
    <div v-if="activeInnerTab === 'inventory'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-semibold">Items</h3>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="itemId in gameState.inventory"
            :key="itemId"
            class="p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
            :class="selectedItem === itemId ? 'border-primary bg-accent' : 'border-border'"
            @click="selectedItem = itemId"
          >
            <div class="text-2xl text-center mb-2">{{ getItemIcon(itemId) }}</div>
            <div class="text-sm font-medium text-center">{{ getItemName(itemId) }}</div>
          </div>
        </div>
      </div>
      
      <div class="space-y-4">
        <h3 class="font-semibold">Details</h3>
        <div v-if="selectedItem" class="p-4 border rounded-lg">
          <div class="text-3xl mb-3">{{ getItemIcon(selectedItem) }}</div>
          <h4 class="font-semibold text-lg mb-2">{{ getItemName(selectedItem) }}</h4>
          <p class="text-muted-foreground">{{ getItemDescription(selectedItem) }}</p>
        </div>
        <div v-else class="p-4 border rounded-lg text-center text-muted-foreground">
          Select an item to view details
        </div>
      </div>
    </div>

    <!-- Achievements Tab -->
    <div v-if="activeInnerTab === 'achievements'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-semibold">Achievements</h3>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="achievementId in allAchievements"
            :key="achievementId"
            class="p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
            :class="[
              selectedAchievement === achievementId ? 'border-primary bg-accent' : 'border-border',
              gameState.achievements.includes(achievementId) ? 'opacity-100' : 'opacity-50'
            ]"
            @click="selectedAchievement = achievementId"
          >
            <div class="text-2xl text-center mb-2">
              {{ gameState.achievements.includes(achievementId) ? getAchievementIcon(achievementId) : '❓' }}
            </div>
            <div class="text-sm font-medium text-center">
              {{ gameState.achievements.includes(achievementId) ? getAchievementName(achievementId) : '???' }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="space-y-4">
        <h3 class="font-semibold">Details</h3>
        <div v-if="selectedAchievement" class="p-4 border rounded-lg">
          <div class="text-3xl mb-3">
            {{ gameState.achievements.includes(selectedAchievement) ? getAchievementIcon(selectedAchievement) : '❓' }}
          </div>
          <h4 class="font-semibold text-lg mb-2">
            {{ gameState.achievements.includes(selectedAchievement) ? getAchievementName(selectedAchievement) : 'Hidden Achievement' }}
          </h4>
          <p class="text-muted-foreground">
            {{ gameState.achievements.includes(selectedAchievement) ? getAchievementDescription(selectedAchievement) : 'Complete the game to unlock this achievement.' }}
          </p>
        </div>
        <div v-else class="p-4 border rounded-lg text-center text-muted-foreground">
          Select an achievement to view details
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameState } from '@/composables/useGameState'

const { gameState } = useGameState()

const activeInnerTab = ref<'stats' | 'inventory' | 'achievements'>('stats')
const selectedItem = ref<string | null>(null)
const selectedAchievement = ref<string | null>(null)

const tabs = [
  { id: 'stats', label: 'Stats' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'achievements', label: 'Achievements' }
]

// All possible achievements (for display purposes)
const allAchievements = computed(() => {
  const knownAchievements = ['started-game', 'pain-managed']
  return knownAchievements
})

function formatStatName(stat: string): string {
  return stat.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}

function getItemIcon(itemId: string): string {
  const icons: Record<string, string> = {
    'birth-plan-card': '📋',
    'ultrasound-photo': '📸'
  }
  return icons[itemId] || '📦'
}

function getItemName(itemId: string): string {
  const names: Record<string, string> = {
    'birth-plan-card': 'Birth Plan Card',
    'ultrasound-photo': 'Ultrasound Photo'
  }
  return names[itemId] || 'Unknown Item'
}

function getItemDescription(itemId: string): string {
  const descriptions: Record<string, string> = {
    'birth-plan-card': 'A card with your partner\'s birthing plan. It says: Birth center.',
    'ultrasound-photo': 'A photo from your first ultrasound appointment. A precious memory of your growing family.'
  }
  return descriptions[itemId] || 'An item you collected during your journey.'
}

function getAchievementIcon(achievementId: string): string {
  const icons: Record<string, string> = {
    'started-game': '🎮',
    'pain-managed': '💪'
  }
  return icons[achievementId] || '🏆'
}

function getAchievementName(achievementId: string): string {
  const names: Record<string, string> = {
    'started-game': 'Started the Game',
    'pain-managed': 'Pain Managed'
  }
  return names[achievementId] || 'Unknown Achievement'
}

function getAchievementDescription(achievementId: string): string {
  const descriptions: Record<string, string> = {
    'started-game': 'You\'ve begun your journey as a supportive partner during pregnancy.',
    'pain-managed': 'You successfully helped your partner through a difficult moment.'
  }
  return descriptions[achievementId] || 'An achievement you\'ve unlocked during your journey.'
}
</script>
