import type { Resource } from '../types'

export interface TemplateStep {
  title: string
  description: string
  hours: number
  beginnerOnly?: boolean // người đã có nền tảng sẽ bỏ qua bước này
  resources: Resource[]
}

export interface RoadmapTemplate {
  id: string
  topic: string
  summary: string
  steps: TemplateStep[]
}

export const ROADMAP_TEMPLATES: RoadmapTemplate[] = [
  {
    id: 'react-frontend',
    topic: 'Frontend với React',
    summary: 'Từ HTML/CSS/JS đến xây và deploy một ứng dụng React + TypeScript.',
    steps: [
      {
        title: 'HTML & CSS căn bản',
        description: 'Cấu trúc trang, semantic HTML, box model, Flexbox, Grid.',
        hours: 8,
        beginnerOnly: true,
        resources: [{ title: 'MDN – Learn web development', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development' }],
      },
      {
        title: 'JavaScript hiện đại (ES6+)',
        description: 'Biến, hàm, mảng/object, destructuring, module, Promise, async/await.',
        hours: 10,
        beginnerOnly: true,
        resources: [{ title: 'The Modern JavaScript Tutorial', url: 'https://javascript.info/' }],
      },
      {
        title: 'Môi trường: Node, npm, Vite',
        description: 'Cài Node, dùng npm, tạo dự án bằng Vite và hiểu cấu trúc thư mục.',
        hours: 2,
        resources: [{ title: 'Vite – Getting Started', url: 'https://vite.dev/guide/' }],
      },
      {
        title: 'Component, JSX và props',
        description: 'Chia giao diện thành component, truyền dữ liệu bằng props, render danh sách.',
        hours: 5,
        resources: [{ title: 'React – Describing the UI', url: 'https://react.dev/learn/describing-the-ui' }],
      },
      {
        title: 'State và xử lý sự kiện',
        description: 'useState, sự kiện onClick/onChange, form có kiểm soát.',
        hours: 5,
        resources: [{ title: 'React – Adding Interactivity', url: 'https://react.dev/learn/adding-interactivity' }],
      },
      {
        title: 'Quản lý state',
        description: 'Lifting state up, useReducer, Context.',
        hours: 6,
        resources: [{ title: 'React – Managing State', url: 'https://react.dev/learn/managing-state' }],
      },
      {
        title: 'Effect và gọi API',
        description: 'useEffect, fetch dữ liệu, trạng thái loading/error.',
        hours: 5,
        resources: [{ title: 'React – Synchronizing with Effects', url: 'https://react.dev/learn/synchronizing-with-effects' }],
      },
      {
        title: 'TypeScript cho React',
        description: 'Kiểu cho props, state, sự kiện; đọc lỗi kiểu.',
        hours: 4,
        resources: [{ title: 'React – Using TypeScript', url: 'https://react.dev/learn/typescript' }],
      },
      {
        title: 'Styling với Tailwind CSS',
        description: 'Utility class, responsive, dark mode.',
        hours: 3,
        resources: [{ title: 'Tailwind CSS – Styling with utility classes', url: 'https://tailwindcss.com/docs/styling-with-utility-classes' }],
      },
      {
        title: 'Dự án cuối và deploy',
        description: 'Tự làm một app nhỏ (ví dụ app thời tiết) rồi deploy lên mạng.',
        hours: 8,
        resources: [{ title: 'Vite – Deploying a Static Site', url: 'https://vite.dev/guide/static-deploy' }],
      },
    ],
  },
  {
    id: 'python-data',
    topic: 'Python cho phân tích dữ liệu',
    summary: 'Python cơ bản, NumPy, pandas, vẽ biểu đồ và một dự án phân tích thật.',
    steps: [
      {
        title: 'Cú pháp Python cơ bản',
        description: 'Biến, kiểu dữ liệu, if/for/while, hàm.',
        hours: 8,
        beginnerOnly: true,
        resources: [{ title: 'The Python Tutorial', url: 'https://docs.python.org/3/tutorial/' }],
      },
      {
        title: 'Cấu trúc dữ liệu',
        description: 'list, tuple, dict, set, list comprehension.',
        hours: 6,
        beginnerOnly: true,
        resources: [{ title: 'Python – Data Structures', url: 'https://docs.python.org/3/tutorial/datastructures.html' }],
      },
      {
        title: 'Jupyter Notebook',
        description: 'Cài đặt môi trường, chạy cell, ghi chú bằng Markdown.',
        hours: 2,
        resources: [{ title: 'Jupyter Documentation', url: 'https://docs.jupyter.org/en/latest/' }],
      },
      {
        title: 'NumPy',
        description: 'Mảng nhiều chiều, phép toán vector hoá, indexing.',
        hours: 5,
        resources: [{ title: 'NumPy: the absolute basics', url: 'https://numpy.org/doc/stable/user/absolute_beginners.html' }],
      },
      {
        title: 'pandas: đọc và làm sạch dữ liệu',
        description: 'DataFrame, đọc CSV, lọc, groupby, xử lý giá trị thiếu.',
        hours: 8,
        resources: [{ title: 'pandas – Getting started tutorials', url: 'https://pandas.pydata.org/docs/getting_started/intro_tutorials/index.html' }],
      },
      {
        title: 'Trực quan hoá với Matplotlib',
        description: 'Biểu đồ đường, cột, histogram; đặt nhãn và chú thích.',
        hours: 4,
        resources: [{ title: 'Matplotlib Tutorials', url: 'https://matplotlib.org/stable/tutorials/index.html' }],
      },
      {
        title: 'Thống kê mô tả',
        description: 'Trung bình, trung vị, độ lệch chuẩn, tương quan.',
        hours: 4,
        resources: [{ title: 'Khan Academy – Statistics', url: 'https://www.khanacademy.org/math/statistics-probability' }],
      },
      {
        title: 'Dự án: phân tích một bộ dữ liệu thật',
        description: 'Chọn dataset, đặt câu hỏi, làm sạch, phân tích và trình bày kết quả.',
        hours: 8,
        resources: [{ title: 'Kaggle Datasets', url: 'https://www.kaggle.com/datasets' }],
      },
    ],
  },
  {
    id: 'git-github',
    topic: 'Git & GitHub',
    summary: 'Quản lý phiên bản và làm việc nhóm với GitHub, rất hữu ích cho đồ án nhóm.',
    steps: [
      {
        title: 'Dòng lệnh cơ bản',
        description: 'cd, ls, mkdir; cài Git và cấu hình tên/email.',
        hours: 2,
        beginnerOnly: true,
        resources: [{ title: 'Pro Git – The Command Line', url: 'https://git-scm.com/book/en/v2/Getting-Started-The-Command-Line' }],
      },
      {
        title: 'Commit, status, log',
        description: 'Khái niệm repository, staging area, commit; xem lịch sử.',
        hours: 3,
        resources: [{ title: 'Pro Git – Git Basics', url: 'https://git-scm.com/book/en/v2/Git-Basics-Getting-a-Git-Repository' }],
      },
      {
        title: 'Branch và merge',
        description: 'Tạo nhánh, chuyển nhánh, gộp nhánh.',
        hours: 3,
        resources: [{ title: 'Pro Git – Branches in a Nutshell', url: 'https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell' }],
      },
      {
        title: 'GitHub: remote, push, pull',
        description: 'Tạo repo trên GitHub, đẩy code lên, kéo code về.',
        hours: 2,
        resources: [{ title: 'GitHub – Hello World', url: 'https://docs.github.com/en/get-started/using-github/hello-world' }],
      },
      {
        title: 'Pull request và code review',
        description: 'Mở PR, nhận xét code, cập nhật PR theo góp ý.',
        hours: 2,
        resources: [{ title: 'GitHub – Pull requests', url: 'https://docs.github.com/en/pull-requests/reference/pull-requests' }],
      },
      {
        title: 'Xử lý conflict',
        description: 'Vì sao có conflict, cách đọc và giải quyết bằng tay.',
        hours: 2,
        resources: [{ title: 'GitHub – Resolving a merge conflict', url: 'https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/resolving-a-merge-conflict-using-the-command-line' }],
      },
      {
        title: 'Quy trình nhóm: GitHub Flow',
        description: 'Áp dụng cho đồ án: mỗi người một nhánh, review trước khi merge.',
        hours: 2,
        resources: [{ title: 'GitHub flow', url: 'https://docs.github.com/en/get-started/using-github/github-flow' }],
      },
    ],
  },
]
