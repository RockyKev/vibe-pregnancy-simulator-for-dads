export type Node = {
  id: string
  title: string
  requires: string[]
  sceneId: string
}

export type Scene = {
  id: string
  title: string
  steps: Step[]
  onResolve?: Effect[]
}

export type Step = {
  id: string
  prose: string | { md: string }
  groups: OptionGroup[]
  next?: string
}

export type OptionGroup = {
  id: string
  prompt: string
  options: Option[]
}

export type Option = {
  id: string
  label: string
  effects?: Effect[]
}

export type Effect =
  | { statDelta: { stat: string; delta: number } }
  | { grantItem: string }
  | { grantAchievement: string }
  | { setFlag: string }

export type Item = {
  id: string
  icon: string
  name: string
  blurb: string
}

export type Achievement = {
  id: string
  icon: string
  name: string
  description: string
  hidden?: boolean
}

export type Save = {
  version: number
  completed: string[]
  stats: Record<string, number>
  items: string[]
  achievements: string[]
}

export type GameState = {
  progress: {
    completed: Set<string>
    unlocked: Set<string>
    currentNode?: string
  }
  stats: Record<string, number>
  inventory: string[]
  achievements: string[]
}

export type ActData = {
  actId: string
  nodes: Node[]
  scenes: Scene[]
}

export type NodeState = 'locked' | 'unlocked' | 'completed'
