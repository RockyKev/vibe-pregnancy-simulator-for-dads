<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-6">Story Navigator</h1>

    <div class="space-y-4">
      <div v-for="node in actData?.nodes" :key="node.id" class="p-4 border rounded-lg transition-all"
        :class="getNodeClasses(node)" @click="handleNodeClick(node)">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold">{{ node.title }}</h3>
            <p class="text-sm text-muted-foreground">
              {{ getNodeStatusText(node) }}
            </p>
          </div>
          <div class="text-2xl">
            {{ getNodeIcon(node) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGameState } from '@/composables/useGameState'
import type { Node, ActData, NodeState } from '@/types/game'

const emit = defineEmits<{
  startNode: []
}>()

const { gameState, getNodeState, startNode, updateUnlockedNodes } = useGameState()

const actData = ref<ActData | null>(null)

onMounted(async () => {
  // Load the first trimester content
  try {
    const response = await fetch('/first-trimester.json')
    actData.value = await response.json()
    updateUnlockedNodes(actData.value?.nodes)
  } catch (error) {
    console.error('Failed to load act data:', error)
  }
})



function getNodeClasses(node: Node) {
  const state = getNodeState(node)
  const baseClasses = 'cursor-pointer hover:shadow-md'

  switch (state) {
    case 'locked':
      return `${baseClasses} bg-muted border-muted-foreground/20 opacity-50 cursor-not-allowed`
    case 'unlocked':
      return `${baseClasses} bg-card border-border hover:border-primary`
    case 'completed':
      return `${baseClasses} bg-green-50 border-green-200 text-green-800`
    default:
      return baseClasses
  }
}

function getNodeIcon(node: Node) {
  const state = getNodeState(node)
  switch (state) {
    case 'locked':
      return '🔒'
    case 'unlocked':
      return '▶️'
    case 'completed':
      return '✅'
    default:
      return '❓'
  }
}

function getNodeStatusText(node: Node) {
  const state = getNodeState(node)
  switch (state) {
    case 'locked':
      return 'Locked - Complete prerequisites first'
    case 'unlocked':
      return 'Ready to play'
    case 'completed':
      return 'Completed'
    default:
      return 'Unknown state'
  }
}

function handleNodeClick(node: Node) {
  const state = getNodeState(node)
  if (state === 'unlocked') {
    startNode(node.id)
    emit('startNode')
  }
}
</script>
