export type ID = string

export type Priority = 'low' | 'medium' | 'high'
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type Level = 'beginner' | 'intermediate'

export interface Task {
  id: ID
  title: string
  description?: string
  subject?: string
  dueDate: string // "YYYY-MM-DD"
  estimatedMinutes?: number
  priority: Priority
  status: TaskStatus
  groupId?: ID // có → việc nhóm, không có → việc cá nhân
  assigneeId?: ID
  roadmapStepId?: ID // việc được tạo từ một bước trong lộ trình
  createdAt: string
  completedAt?: string
}

export interface Group {
  id: ID
  name: string
  subject?: string
  deadline?: string
  createdAt: string
}

export interface Member {
  id: ID
  groupId: ID
  name: string
  isMe?: boolean
}

export interface Resource {
  title: string
  url: string
}

export interface RoadmapStep {
  id: ID
  title: string
  description: string
  week: number // tuần bắt đầu (tính từ 1)
  endWeek: number // tuần kết thúc, bước dài có thể kéo qua nhiều tuần
  estimatedHours: number
  resources: Resource[]
  done: boolean
}

export interface RoadmapPlan {
  id: ID
  templateId: string
  topic: string
  level: Level
  hoursPerWeek: number
  startDate: string
  totalWeeks: number
  steps: RoadmapStep[]
  createdAt: string
}

export interface AppData {
  version: 1
  tasks: Task[]
  groups: Group[]
  members: Member[]
  roadmaps: RoadmapPlan[]
}
