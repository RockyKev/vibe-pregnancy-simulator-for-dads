import { reactive, computed } from 'vue'
import type { GameState, Node, Save, NodeState } from '@/types/game'

const STORAGE_KEY = 'alter-life-save'
const SAVE_VERSION = 1

// Initialize default stats
const DEFAULT_STATS = {
  support: 0,
  knowledge: 0,
  communication: 0,
  preparation: 0,
  presence: 0,
  empathy: 0,
  energy: 0,
  finances: 0,
  relationship: 0,
  patience: 0,
  organization: 0,
  resilience: 0,
  attentiveness: 0,
  problemSolving: 0,
  health: 0
}

const gameState = reactive<GameState>({
  progress: {
    completed: new Set(),
    unlocked: new Set(),
    currentNode: undefined
  },
  stats: { ...DEFAULT_STATS },
  inventory: [],
  achievements: []
})

export function useGameState() {
  const hasSave = computed(() => {
    return localStorage.getItem(STORAGE_KEY) !== null
  })

  function loadSave() {
    const saveData = localStorage.getItem(STORAGE_KEY)
    if (saveData) {
      try {
        const save: Save = JSON.parse(saveData)
        
        // Migrate save if needed
        if (save.version !== SAVE_VERSION) {
          console.warn('Save version mismatch, using defaults')
          return
        }

        gameState.progress.completed = new Set(save.completed)
        gameState.stats = { ...DEFAULT_STATS, ...save.stats }
        gameState.inventory = [...save.items]
        gameState.achievements = [...save.achievements]
        
        // Recalculate unlocked nodes
        updateUnlockedNodes()
      } catch (error) {
        console.error('Failed to load save:', error)
      }
    }
  }

  function saveGame() {
    const save: Save = {
      version: SAVE_VERSION,
      completed: Array.from(gameState.progress.completed),
      stats: { ...gameState.stats },
      items: [...gameState.inventory],
      achievements: [...gameState.achievements]
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save))
  }

  function startNewGame() {
    gameState.progress.completed.clear()
    gameState.progress.unlocked.clear()
    gameState.progress.currentNode = undefined
    gameState.stats = { ...DEFAULT_STATS }
    gameState.inventory = []
    gameState.achievements = []
    
    // Unlock initial nodes (nodes with no requirements)
    updateUnlockedNodes()
    saveGame()
  }

  function updateUnlockedNodes(nodes?: Node[]) {
    if (!nodes) return
    
    gameState.progress.unlocked.clear()
    
    nodes.forEach(node => {
      if (gameState.progress.completed.has(node.id)) return
      
      const isUnlocked = node.requires.every(id => 
        gameState.progress.completed.has(id)
      )
      
      if (isUnlocked) {
        gameState.progress.unlocked.add(node.id)
      }
    })
  }

  function getNodeState(node: Node): NodeState {
    if (gameState.progress.completed.has(node.id)) return 'completed'
    if (gameState.progress.unlocked.has(node.id)) return 'unlocked'
    return 'locked'
  }

  function completeNode(nodeId: string) {
    gameState.progress.completed.add(nodeId)
    gameState.progress.unlocked.delete(nodeId)
    gameState.progress.currentNode = undefined
    saveGame()
  }

  function startNode(nodeId: string) {
    gameState.progress.currentNode = nodeId
  }

  function applyEffect(effect: any) {
    if (effect.statDelta) {
      const { stat, delta } = effect.statDelta
      gameState.stats[stat] = Math.max(0, Math.min(100, gameState.stats[stat] + delta))
    } else if (effect.grantItem) {
      if (!gameState.inventory.includes(effect.grantItem)) {
        gameState.inventory.push(effect.grantItem)
      }
    } else if (effect.grantAchievement) {
      if (!gameState.achievements.includes(effect.grantAchievement)) {
        gameState.achievements.push(effect.grantAchievement)
      }
    }
  }

  return {
    gameState,
    hasSave,
    loadSave,
    saveGame,
    startNewGame,
    updateUnlockedNodes,
    getNodeState,
    completeNode,
    startNode,
    applyEffect
  }
}
