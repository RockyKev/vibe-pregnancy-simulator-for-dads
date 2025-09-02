<template>
	<div class="min-h-screen bg-background flex items-center justify-center">
		<div class="max-w-md w-full mx-4">
			<!-- Game Title -->
			<div class="text-center mb-12">
				<h1 class="text-4xl font-bold text-foreground mb-4">Alter Life</h1>
				<p class="text-lg text-muted-foreground">
					A narrative-driven game about supporting your partner during pregnancy and early parenthood.
				</p>
			</div>

			<!-- Main Actions -->
			<div class="space-y-4 mb-8">
				<!-- New Game / Load Game Button -->
				<button @click="handleMainAction"
					class="w-full p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-lg font-medium">
					{{ hasSave ? 'Continue Game' : 'New Game' }}
				</button>

				<!-- Options Button -->
				<button @click="showOptions = !showOptions"
					class="w-full p-4 border border-border bg-background text-foreground rounded-lg hover:bg-accent transition-colors">
					Options
				</button>
			</div>

			<!-- Options Panel -->
			<div v-if="showOptions" class="space-y-6 p-6 border border-border rounded-lg bg-card">
				<h3 class="text-lg font-semibold text-foreground">Audio Settings</h3>

				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<span class="text-foreground">Master Volume</span>
						<input type="range" min="0" max="100" v-model="audioSettings.masterVolume" class="w-24" />
						<span class="text-sm text-muted-foreground w-8">{{ audioSettings.masterVolume }}%</span>
					</div>

					<div class="flex items-center justify-between">
						<span class="text-foreground">Music Volume</span>
						<input type="range" min="0" max="100" v-model="audioSettings.musicVolume" class="w-24" />
						<span class="text-sm text-muted-foreground w-8">{{ audioSettings.musicVolume }}%</span>
					</div>

					<div class="flex items-center justify-between">
						<span class="text-foreground">Sound Effects</span>
						<input type="range" min="0" max="100" v-model="audioSettings.sfxVolume" class="w-24" />
						<span class="text-sm text-muted-foreground w-8">{{ audioSettings.sfxVolume }}%</span>
					</div>
				</div>

				<h3 class="text-lg font-semibold text-foreground">Display Settings</h3>

				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<span class="text-foreground">Dark Mode</span>
						<input type="checkbox" v-model="displaySettings.darkMode" class="w-4 h-4" />
					</div>

					<div class="flex items-center justify-between">
						<span class="text-foreground">Text Size</span>
						<select v-model="displaySettings.textSize"
							class="px-2 py-1 border border-border rounded bg-background text-foreground">
							<option value="small">Small</option>
							<option value="medium">Medium</option>
							<option value="large">Large</option>
						</select>
					</div>

					<div class="flex items-center justify-between">
						<span class="text-foreground">Reduce Motion</span>
						<input type="checkbox" v-model="displaySettings.reduceMotion" class="w-4 h-4" />
					</div>
				</div>
			</div>

			<!-- Game Info -->
			<div class="text-center mt-8 text-sm text-muted-foreground">
				<p>Version 1.0.0 | First Trimester Vertical Slice</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useGameState } from '@/composables/useGameState'

const emit = defineEmits<{
	startGame: []
}>()

const { hasSave, loadSave, startNewGame } = useGameState()

const showOptions = ref(false)

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

function handleMainAction() {
	if (hasSave.value) {
		loadSave()
	} else {
		startNewGame()
	}
	emit('startGame')
}
</script>
