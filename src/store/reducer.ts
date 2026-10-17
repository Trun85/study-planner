import type { AppData, Group, ID, Member, RoadmapPlan, Task } from '../types'

export type Action =
  | { type: 'task/add'; task: Task }
  | { type: 'task/update'; id: ID; patch: Partial<Omit<Task, 'id'>> }
  | { type: 'task/delete'; id: ID }
  | { type: 'group/add'; group: Group }
  | { type: 'group/update'; id: ID; patch: Partial<Omit<Group, 'id'>> }
  | { type: 'group/delete'; id: ID }
  | { type: 'member/add'; member: Member }
  | { type: 'member/delete'; id: ID }
  | { type: 'roadmap/add'; plan: RoadmapPlan }
  | { type: 'roadmap/delete'; id: ID }
  | { type: 'roadmap/toggleStep'; planId: ID; stepId: ID }
  | { type: 'data/replace'; data: AppData }

function setStepDone(roadmaps: RoadmapPlan[], stepId: ID, done: boolean): RoadmapPlan[] {
  return roadmaps.map((plan) =>
    plan.steps.some((s) => s.id === stepId)
      ? { ...plan, steps: plan.steps.map((s) => (s.id === stepId ? { ...s, done } : s)) }
      : plan,
  )
}

function withStatus(task: Task, status: Task['status']): Task {
  if (task.status === status) return task
  return { ...task, status, completedAt: status === 'done' ? new Date().toISOString() : undefined }
}

export function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'task/add':
      return { ...state, tasks: [...state.tasks, action.task] }

    case 'task/update': {
      const current = state.tasks.find((t) => t.id === action.id)
      if (!current) return state
      const { status, ...rest } = action.patch
      let next: Task = { ...current, ...rest }
      if (status) next = withStatus(next, status)
      // Việc tạo từ lộ trình: hoàn thành việc thì bước tương ứng cũng hoàn thành
      const roadmaps =
        next.roadmapStepId && next.status !== current.status
          ? setStepDone(state.roadmaps, next.roadmapStepId, next.status === 'done')
          : state.roadmaps
      return { ...state, tasks: state.tasks.map((t) => (t.id === next.id ? next : t)), roadmaps }
    }

    case 'task/delete':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) }

    case 'group/add':
      return { ...state, groups: [...state.groups, action.group] }

    case 'group/update':
      return {
        ...state,
        groups: state.groups.map((g) => (g.id === action.id ? { ...g, ...action.patch } : g)),
      }

    case 'group/delete':
      // Xoá nhóm thì xoá luôn thành viên và việc của nhóm
      return {
        ...state,
        groups: state.groups.filter((g) => g.id !== action.id),
        members: state.members.filter((m) => m.groupId !== action.id),
        tasks: state.tasks.filter((t) => t.groupId !== action.id),
      }

    case 'member/add':
      return { ...state, members: [...state.members, action.member] }

    case 'member/delete':
      // Xoá thành viên thì việc của họ chuyển về "chưa giao"
      return {
        ...state,
        members: state.members.filter((m) => m.id !== action.id),
        tasks: state.tasks.map((t) =>
          t.assigneeId === action.id ? { ...t, assigneeId: undefined } : t,
        ),
      }

    case 'roadmap/add':
      return { ...state, roadmaps: [...state.roadmaps, action.plan] }

    case 'roadmap/delete': {
      const plan = state.roadmaps.find((p) => p.id === action.id)
      if (!plan) return state
      const stepIds = new Set(plan.steps.map((s) => s.id))
      // Giữ lại các việc đã đưa sang tab Việc học, chỉ bỏ liên kết với lộ trình
      return {
        ...state,
        roadmaps: state.roadmaps.filter((p) => p.id !== action.id),
        tasks: state.tasks.map((t) =>
          t.roadmapStepId && stepIds.has(t.roadmapStepId) ? { ...t, roadmapStepId: undefined } : t,
        ),
      }
    }

    case 'roadmap/toggleStep': {
      const step = state.roadmaps
        .find((p) => p.id === action.planId)
        ?.steps.find((s) => s.id === action.stepId)
      if (!step) return state
      const done = !step.done
      return {
        ...state,
        roadmaps: setStepDone(state.roadmaps, step.id, done),
        tasks: state.tasks.map((t) => {
          if (t.roadmapStepId !== step.id) return t
          if (done) return withStatus(t, 'done')
          return t.status === 'done' ? withStatus(t, 'todo') : t
        }),
      }
    }

    case 'data/replace':
      return action.data
  }
}
