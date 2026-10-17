import { describe, expect, it } from 'vitest'
import { createSeedData } from '../data/seed'
import { reducer } from './reducer'

const today = '2026-10-18'

describe('reducer', () => {
  it('xoá nhóm thì xoá cả thành viên và việc của nhóm', () => {
    const state = createSeedData(today)
    const groupId = state.groups[0].id
    const next = reducer(state, { type: 'group/delete', id: groupId })
    expect(next.groups).toHaveLength(0)
    expect(next.members.some((m) => m.groupId === groupId)).toBe(false)
    expect(next.tasks.some((t) => t.groupId === groupId)).toBe(false)
    expect(next.tasks.length).toBeGreaterThan(0) // việc cá nhân vẫn còn
  })

  it('xoá thành viên thì việc của họ thành "chưa giao"', () => {
    const state = createSeedData(today)
    const assigned = state.tasks.find((t) => t.assigneeId)!
    const next = reducer(state, { type: 'member/delete', id: assigned.assigneeId! })
    expect(next.tasks.find((t) => t.id === assigned.id)?.assigneeId).toBeUndefined()
  })

  it('đổi trạng thái sang done thì ghi completedAt, đổi lại thì xoá', () => {
    const state = createSeedData(today)
    const task = state.tasks.find((t) => t.status === 'todo')!
    const done = reducer(state, { type: 'task/update', id: task.id, patch: { status: 'done' } })
    expect(done.tasks.find((t) => t.id === task.id)?.completedAt).toBeDefined()
    const undone = reducer(done, { type: 'task/update', id: task.id, patch: { status: 'todo' } })
    expect(undone.tasks.find((t) => t.id === task.id)?.completedAt).toBeUndefined()
  })

  it('việc tạo từ lộ trình đồng bộ trạng thái với bước', () => {
    let state = createSeedData(today)
    const plan = state.roadmaps[0]
    const step = plan.steps[1]
    state = reducer(state, {
      type: 'task/add',
      task: { id: 't1', title: step.title, dueDate: today, priority: 'medium', status: 'todo', roadmapStepId: step.id, createdAt: '' },
    })

    // Hoàn thành việc → bước được tick
    state = reducer(state, { type: 'task/update', id: 't1', patch: { status: 'done' } })
    expect(state.roadmaps[0].steps[1].done).toBe(true)

    // Bỏ tick bước → việc quay về todo
    state = reducer(state, { type: 'roadmap/toggleStep', planId: plan.id, stepId: step.id })
    expect(state.tasks.find((t) => t.id === 't1')?.status).toBe('todo')

    // Xoá lộ trình → việc vẫn còn nhưng mất liên kết
    state = reducer(state, { type: 'roadmap/delete', id: plan.id })
    expect(state.tasks.find((t) => t.id === 't1')?.roadmapStepId).toBeUndefined()
  })
})
