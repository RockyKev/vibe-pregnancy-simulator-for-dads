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

        <!-- Choices -->
        <div v-if="currentStep.choices" class="space-y-4">
          <div class="space-y-3">
            <label v-for="choice in currentStep.choices" :key="choice.id"
              class="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
              :class="selectedChoice === choice.id ? 'border-primary bg-accent' : 'border-border'">
              <input type="radio" name="choice" :value="choice.id" v-model="selectedChoice" class="mt-1" />
              <span class="flex-1">{{ choice.label }}</span>
            </label>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex justify-between pt-6">
          <button v-if="canGoBack" @click="goBack"
            class="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors">
            ← Back
          </button>

          <button v-if="canContinue" @click="continueStep" :disabled="!canContinue"
            class="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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
        <button @click="returnToStory"
          class="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
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

const emit = defineEmits<{
  returnToStory: []
}>()

const { gameState, applyEffect, completeNode, updateUnlockedNodes } = useGameState()

const actData = ref<ActData | null>(null)
const currentStep = ref<Step | null>(null)
const stepHistory = ref<string[]>([])
const selectedChoice = ref<string>('')

const currentScene = computed(() => {
  if (!actData.value || !gameState.progress.currentNode) return null

  const node = actData.value.nodes.find(n => n.id === gameState.progress.currentNode)
  if (!node) return null

  return actData.value.scenes.find(s => s.id === node.sceneId) || null
})

const canGoBack = computed(() => stepHistory.value.length > 0)
const canContinue = computed(() => {
  if (!currentStep.value) {
    console.log('No current step, cannot continue')
    return false
  }

  // Check if a choice is selected (if choices exist)
  if (currentStep.value.choices) {
    const canContinue = selectedChoice.value !== ''
    console.log('Has choices, can continue:', canContinue, 'Selected:', selectedChoice.value)
    return canContinue
  }

  // If no choices, can always continue
  console.log('No choices, can continue')
  return true
})

onMounted(async () => {
  // Load the first trimester content
  try {
    const response = await fetch('/first-trimester.json')
    actData.value = await response.json()
    console.log('Act data loaded:', actData.value)

    // If there's a current node, start the scene now that data is loaded
    if (gameState.progress.currentNode) {
      console.log('Starting scene for current node:', gameState.progress.currentNode)
      startScene(gameState.progress.currentNode)
    }
  } catch (error) {
    console.error('Failed to load act data:', error)
  }
})

watch(() => gameState.progress.currentNode, (newNodeId) => {
  console.log('Current node changed to:', newNodeId, 'Act data loaded:', !!actData.value)
  if (newNodeId && actData.value) {
    startScene(newNodeId)
  } else if (newNodeId && !actData.value) {
    console.log('Node changed but act data not loaded yet, will start scene when data loads')
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
  selectedChoice.value = ''

  console.log('Started scene:', scene.title, 'First step:', currentStep.value)
}

function continueStep() {
  if (!currentStep.value || !currentScene.value) return

  console.log('Continuing step:', currentStep.value.id, 'Selected choice:', selectedChoice.value)

  // Apply effects from selected choice
  if (currentStep.value.choices && selectedChoice.value) {
    const choice = currentStep.value.choices.find(c => c.id === selectedChoice.value)
    if (choice?.effects) {
      choice.effects.forEach(effect => applyEffect(effect))
    }
  }

  // Move to next step
  let nextStepId = currentStep.value.next

  // Handle choice-based next steps
  if (typeof nextStepId === 'object' && selectedChoice.value) {
    nextStepId = nextStepId[selectedChoice.value] || nextStepId.default
  }

  console.log('Next step ID:', nextStepId)

  if (nextStepId) {
    const nextStep = currentScene.value.steps.find(s => s.id === nextStepId)
    if (nextStep) {
      console.log('Found next step:', nextStep)
      currentStep.value = nextStep
      stepHistory.value.push(nextStep.id)
      selectedChoice.value = ''
    } else {
      console.log('Next step not found, completing scene')
      // No next step, scene is complete
      currentStep.value = null
    }
  } else {
    console.log('No next step ID, completing scene')
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
      selectedChoice.value = ''
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
  selectedChoice.value = ''
}

function returnToStory() {
  completeScene()
  emit('returnToStory')
}
</script>
