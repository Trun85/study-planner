import { addDays, todayISO } from '../lib/date'
import { newId } from '../lib/id'
import { currentWeek, generateRoadmap, stepDueDate } from '../lib/roadmapGenerator'
import type { AppData, Group, Member, RoadmapPlan, Task } from '../types'

/**
 * Dữ liệu mẫu: một sinh viên năm 3 ngành CNTT, đang ở giữa học kỳ.
 * Mọi ngày tháng tính tương đối theo hôm nay, nên lúc nào mở app cũng có
 * việc quá hạn, việc hôm nay, việc sắp tới và lịch sử việc đã xong.
 */
export function createSeedData(today: string = todayISO()): AppData {
  const d = (offset: number) => addDays(today, offset)
  // Giờ địa phương → ISO, dùng cho createdAt / completedAt
  const at = (offset: number, time: string) => new Date(`${d(offset)}T${time}`).toISOString()

  type SeedTask = Omit<Task, 'id' | 'createdAt' | 'dueDate' | 'completedAt'> & {
    due: number // hạn chót, tính bằng số ngày so với hôm nay
    doneEarly?: number // việc đã xong: xong trước hạn bao nhiêu ngày
  }
  const task = ({ due, doneEarly = 0, ...t }: SeedTask): Task => ({
    id: newId(),
    createdAt: at(Math.min(due, 0) - 6, '08:15:00'),
    dueDate: d(due),
    completedAt: t.status === 'done' ? at(Math.min(due - doneEarly, 0), '21:40:00') : undefined,
    ...t,
  })

  // ---------- Việc cá nhân ----------
  const CTDL = 'CTDL & giải thuật'
  const XSTK = 'Xác suất thống kê'
  const MANG = 'Mạng máy tính'
  const CSDL = 'Cơ sở dữ liệu'
  const ANH = 'Tiếng Anh chuyên ngành'
  const TRIET = 'Triết học Mác – Lênin'

  const personal: Task[] = [
    // Đã xong trong hai tuần qua
    task({ title: 'Lab 4 – Chia subnet và cấu hình IP', subject: MANG, due: -9, doneEarly: 1, estimatedMinutes: 120, priority: 'medium', status: 'done' }),
    task({ title: 'Bài tập tuần 5 – Biến ngẫu nhiên liên tục', subject: XSTK, due: -7, estimatedMinutes: 120, priority: 'high', status: 'done' }),
    task({ title: 'Quiz chương 3 – Cây nhị phân tìm kiếm', subject: CTDL, due: -6, doneEarly: 1, estimatedMinutes: 60, priority: 'medium', status: 'done' }),
    task({ title: 'Essay Unit 6 – Cloud computing (250 từ)', subject: ANH, due: -4, doneEarly: 2, estimatedMinutes: 60, priority: 'low', status: 'done' }),
    task({ title: 'Nộp đề cương tiểu luận giữa kỳ', subject: TRIET, due: -3, estimatedMinutes: 45, priority: 'medium', status: 'done' }),
    task({ title: 'Bài tập JOIN và truy vấn lồng', subject: CSDL, due: -2, doneEarly: 1, estimatedMinutes: 90, priority: 'medium', status: 'done' }),
    task({ title: 'Đọc slide buổi 7 – SQL nâng cao', subject: CSDL, due: -1, estimatedMinutes: 30, priority: 'low', status: 'done' }),

    // Quá hạn
    task({ title: 'Nộp Lab 5 – Định tuyến tĩnh trên Packet Tracer', subject: MANG, due: -2, estimatedMinutes: 150, priority: 'high', status: 'in_progress', description: 'Còn thiếu phần chụp màn hình bảng định tuyến R2, R3.' }),
    task({ title: 'Bài tập tuần 6 – Ước lượng khoảng (6.1 – 6.8)', subject: XSTK, due: -1, estimatedMinutes: 120, priority: 'high', status: 'todo' }),

    // Hôm nay
    task({ title: 'Ôn quiz chương 4 – Đồ thị, BFS và DFS', subject: CTDL, due: 0, estimatedMinutes: 90, priority: 'high', status: 'in_progress' }),
    task({ title: 'Đọc trước slide buổi 8 – Chuẩn hoá dữ liệu', subject: CSDL, due: 0, estimatedMinutes: 30, priority: 'low', status: 'todo' }),

    // 7 ngày tới
    task({ title: 'Essay Unit 7 – Cybersecurity (250 từ)', subject: ANH, due: 1, estimatedMinutes: 60, priority: 'medium', status: 'todo' }),
    task({ title: 'Cài đặt Dijkstra, chạy thử LeetCode 743', subject: CTDL, due: 2, estimatedMinutes: 120, priority: 'medium', status: 'todo' }),
    task({ title: 'Tiểu luận giữa kỳ – hoàn thiện bản nháp', subject: TRIET, due: 3, estimatedMinutes: 240, priority: 'medium', status: 'in_progress', description: 'Đề 3: Vai trò của thực tiễn đối với nhận thức. Tối thiểu 8 trang.' }),
    task({ title: 'Lab 6 – VLAN và trunking', subject: MANG, due: 4, estimatedMinutes: 150, priority: 'medium', status: 'todo' }),
    task({ title: 'Ôn thi giữa kỳ Xác suất thống kê (chương 1 – 5)', subject: XSTK, due: 5, estimatedMinutes: 360, priority: 'high', status: 'todo', description: 'Thi 7h30, phòng B4-203. Được mang 1 tờ A4 công thức.' }),

    // Sau đó
    task({ title: 'Đăng ký học phần học kỳ 2', due: 9, estimatedMinutes: 20, priority: 'low', status: 'todo' }),
    task({ title: 'Nộp minh chứng hoạt động ngoại khoá', due: 12, estimatedMinutes: 30, priority: 'low', status: 'todo' }),
    task({ title: 'Thuyết trình Unit 8 – chuẩn bị slide', subject: ANH, due: 16, estimatedMinutes: 90, priority: 'medium', status: 'todo' }),
    task({ title: 'Ôn thi giữa kỳ CTDL & giải thuật', subject: CTDL, due: 20, estimatedMinutes: 300, priority: 'high', status: 'todo' }),
  ]

  // ---------- Nhóm ----------
  const groups: Group[] = []
  const members: Member[] = []
  const groupTasks: Task[] = []

  function addGroup(name: string, subject: string, deadline: number, createdDaysAgo: number, names: string[]) {
    const group: Group = { id: newId(), name, subject, deadline: d(deadline), createdAt: at(-createdDaysAgo, '20:00:00') }
    const list: Member[] = [
      { id: newId(), groupId: group.id, name: 'Bạn', isMe: true },
      ...names.map((n) => ({ id: newId(), groupId: group.id, name: n })),
    ]
    groups.push(group)
    members.push(...list)
    const byName = (n: string) => list.find((m) => m.name === n)?.id
    return (t: Omit<SeedTask, 'groupId' | 'assigneeId' | 'subject'> & { who?: string }) => {
      const { who, ...rest } = t
      groupTasks.push(task({ ...rest, groupId: group.id, subject, assigneeId: who ? byName(who) : undefined }))
    }
  }

  // Đang chạy giữa chừng
  const csdl = addGroup('Đồ án CSDL – Quản lý thư viện', CSDL, 14, 24, ['Ngọc Anh', 'Minh Khoa', 'Thảo Vy'])
  csdl({ title: 'Khảo sát và phân tích yêu cầu', who: 'Ngọc Anh', due: -12, doneEarly: 1, estimatedMinutes: 240, priority: 'high', status: 'done' })
  csdl({ title: 'Thiết kế ERD', who: 'Bạn', due: -8, estimatedMinutes: 180, priority: 'high', status: 'done' })
  csdl({ title: 'Chuẩn hoá lược đồ đến 3NF', who: 'Minh Khoa', due: -4, doneEarly: 1, estimatedMinutes: 120, priority: 'high', status: 'done' })
  csdl({ title: 'Script tạo bảng và ràng buộc khoá', who: 'Minh Khoa', due: 2, estimatedMinutes: 150, priority: 'high', status: 'in_progress' })
  csdl({ title: 'Nhập 500 dòng dữ liệu mẫu', who: 'Thảo Vy', due: 4, estimatedMinutes: 120, priority: 'medium', status: 'in_progress' })
  csdl({ title: 'Viết 10 truy vấn báo cáo', who: 'Bạn', due: 7, estimatedMinutes: 240, priority: 'medium', status: 'todo' })
  csdl({ title: 'Trigger và stored procedure mượn/trả sách', who: 'Ngọc Anh', due: 9, estimatedMinutes: 180, priority: 'medium', status: 'todo' })
  csdl({ title: 'Viết báo cáo Word và làm slide', due: 12, estimatedMinutes: 240, priority: 'low', status: 'todo' })

  // Mới bắt đầu
  const web = addGroup('BTL Lập trình Web – Nhóm 7', 'Lập trình Web', 27, 12, ['Quang Huy', 'Bảo Trâm'])
  web({ title: 'Chọn đề tài, vẽ wireframe trên Figma', who: 'Bảo Trâm', due: -10, estimatedMinutes: 180, priority: 'medium', status: 'done' })
  web({ title: 'Dựng khung dự án React + router', who: 'Quang Huy', due: -5, doneEarly: 2, estimatedMinutes: 120, priority: 'high', status: 'done' })
  web({ title: 'Trang đăng nhập và kiểm tra form', who: 'Bạn', due: 6, estimatedMinutes: 240, priority: 'high', status: 'in_progress' })
  web({ title: 'Trang giỏ hàng và tính tổng tiền', who: 'Quang Huy', due: 10, estimatedMinutes: 300, priority: 'medium', status: 'todo' })
  web({ title: 'Responsive cho điện thoại', who: 'Bảo Trâm', due: 14, estimatedMinutes: 180, priority: 'medium', status: 'todo' })
  web({ title: 'Deploy và viết README', due: 24, estimatedMinutes: 90, priority: 'low', status: 'todo' })

  // Đã hoàn thành
  const mang = addGroup('Thuyết trình Mạng máy tính – Nhóm 2', MANG, -3, 20, ['Đức Long', 'Hà My'])
  mang({ title: 'Tìm hiểu giao thức OSPF', who: 'Đức Long', due: -12, estimatedMinutes: 180, priority: 'high', status: 'done' })
  mang({ title: 'Làm slide và demo trên GNS3', who: 'Bạn', due: -6, doneEarly: 1, estimatedMinutes: 240, priority: 'high', status: 'done' })
  mang({ title: 'Tập thuyết trình, chia phần nói', who: 'Hà My', due: -4, estimatedMinutes: 60, priority: 'medium', status: 'done' })

  // ---------- Lộ trình tự học ----------
  // Đánh dấu xong các bước lẽ ra phải xong trước tuần hiện tại, trừ những bước trong `skip`
  const markUpToNow = (plan: RoadmapPlan, skip: number[] = []) => {
    const week = currentWeek(plan, today)
    plan.steps.forEach((s, i) => {
      s.done = s.endWeek < week && !skip.includes(i)
    })
  }

  // Đúng tiến độ; bước đang học đã được đưa sang tab Việc học
  const react = generateRoadmap({ templateId: 'react-frontend', level: 'beginner', hoursPerWeek: 6, startDate: d(-14) })
  markUpToNow(react)
  const learning = react.steps.find((s) => !s.done)
  if (learning) {
    personal.push({
      id: newId(),
      title: learning.title,
      subject: react.topic,
      description: learning.description,
      dueDate: stepDueDate(react, learning),
      estimatedMinutes: learning.estimatedHours * 60,
      priority: 'medium',
      status: 'in_progress',
      roadmapStepId: learning.id,
      createdAt: at(-3, '22:10:00'),
    })
  }

  // Chậm 1 bước so với kế hoạch
  const git = generateRoadmap({ templateId: 'git-github', level: 'intermediate', hoursPerWeek: 4, startDate: d(-21) })
  markUpToNow(git, [3])

  // Sắp bắt đầu
  const python = generateRoadmap({ templateId: 'python-data', level: 'intermediate', hoursPerWeek: 5, startDate: d(2) })

  return {
    version: 1,
    tasks: [...personal, ...groupTasks],
    groups,
    members,
    roadmaps: [react, git, python],
  }
}
