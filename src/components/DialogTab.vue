<template>
  <div class="p-4">
    <div v-if="!currentScene" class="text-center py-12">
      <h2 class="text-xl font-semibold mb-4">No Active Scene</h2>
      <p class="text-muted-foreground">
        Select a story node from the Story tab to begin.
      </p>
    </div>

    <div v-else class="max-w-2xl mx-auto">
      <!-- Scene Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold">{{ currentScene.title }}</h1>
      </div>

      <!-- Current Step -->
      <div v-if="currentStep" class="space-y-6">
        <!-- Prose -->
        <div class="prose prose-lg max-w-none">
          <p class="text-foreground leading-relaxed">{{ currentStep.prose }}</p>
        </div>

        <!-- Option Groups -->
        <div v-for="group in currentStep.groups" :key="group.id" class="space-y-4">
          <h3 class="font-semibold text-lg">{{ group.prompt }}</h3>
          
          <div class="space-y-3">
            <label
              v-for="option in group.options"
              :key="option.id"
              class="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
              :class="selectedChoices[group.id] === option.id ? 'border-primary bg-accent' : 'border-border'"
            >
              <input
                type="radio"
                :name="group.id"
                :value="option.id"
                v-model="selectedChoices[group.id]"
                class="mt-1"
              />
              <span class="flex-1">{{ option.label }}</span>
            </label>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex justify-between pt-6">
          <button
            v-if="canGoBack"
            @click="goBack"
            class="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
          >
            ← Back
          </button>
          
          <button
            v-if="canContinue"
            @click="continueStep"
            :disabled="!canContinue"
            class="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      </div>

      <!-- Scene Complete -->
      <div v-else class="text-center py-12">
        <h2 class="text-xl font-semibold mb-4">Scene Complete!</h2>
        <p class="text-muted-foreground mb-6">
          You've completed this story node.
        </p>
        <button
          @click="completeScene"
          class="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Return to Story
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useGameState } from '@/composables/useGameState'
import type { Scene, Step, ActData } from '@/types/game'

const { gameState, applyEffect, completeNode, updateUnlockedNodes } = useGameState()

const actData = ref<ActData | null>(null)
const currentStep = ref<Step | null>(null)
const stepHistory = ref<string[]>([])
const selectedChoices = ref<Record<string, string>>({})

const currentScene = computed(() => {
  if (!actData.value || !gameState.progress.currentNode) return null
  
  const node = actData.value.nodes.find(n => n.id === gameState.progress.currentNode)
  if (!node) return null
  
  return actData.value.scenes.find(s => s.id === node.sceneId) || null
})

const canGoBack = computed(() => stepHistory.value.length > 0)
const canContinue = computed(() => {
  if (!currentStep.value) return false
  
  // Check if all required option groups have selections
  return currentStep.value.groups.every(group => 
    selectedChoices.value[group.id] !== undefined
  )
})

onMounted(async () => {
  // Load the first trimester content
  try {
    const response = await fetch('/content/first-trimester.json')
    actData.value = await response.json()
  } catch (error) {
    console.error('Failed to load act data:', error)
  }
})

watch(() => gameState.progress.currentNode, (newNodeId) => {
  if (newNodeId && actData.value) {
    startScene(newNodeId)
  }
}, { immediate: true })

function startScene(nodeId: string) {
  if (!actData.value) return
  
  const node = actData.value.nodes.find(n => n.id === nodeId)
  if (!node) return
  
  const scene = actData.value.scenes.find(s => s.id === node.sceneId)
  if (!scene || !scene.steps.length) return
  
  // Start with the first step
  currentStep.value = scene.steps[0]
  stepHistory.value = [scene.steps[0].id]
  selectedChoices.value = {}
}

function continueStep() {
  if (!currentStep.value || !currentScene.value) return
  
  // Apply effects from selected choices
  currentStep.value.groups.forEach(group => {
    const selectedOptionId = selectedChoices.value[group.id]
    if (selectedOptionId) {
      const option = group.options.find(o => o.id === selectedOptionId)
      if (option?.effects) {
        option.effects.forEach(effect => applyEffect(effect))
      }
    }
  })
  
  // Move to next step
  if (currentStep.value.next) {
    const nextStep = currentScene.value.steps.find(s => s.id === currentStep.value!.next)
    if (nextStep) {
      currentStep.value = nextStep
      stepHistory.value.push(nextStep.id)
      selectedChoices.value = {}
    } else {
      // No next step, scene is complete
      currentStep.value = null
    }
  } else {
    // No next step, scene is complete
    currentStep.value = null
  }
}

function goBack() {
  if (stepHistory.value.length <= 1) return
  
  stepHistory.value.pop()
  const previousStepId = stepHistory.value[stepHistory.value.length - 1]
  
  if (currentScene.value) {
    const previousStep = currentScene.value.steps.find(s => s.id === previousStepId)
    if (previousStep) {
      currentStep.value = previousStep
      selectedChoices.value = {}
    }
  }
}

function completeScene() {
  if (!gameState.progress.currentNode || !currentScene.value) return
  
  // Apply onResolve effects
  if (currentScene.value.onResolve) {
    currentScene.value.onResolve.forEach(effect => applyEffect(effect))
  }
  
  // Complete the node
  completeNode(gameState.progress.currentNode)
  
  // Update unlocked nodes
  if (actData.value) {
    updateUnlockedNodes(actData.value.nodes)
  }
  
  // Clear current scene
  currentStep.value = null
  stepHistory.value = []
  selectedChoices.value = {}
}
</script>
