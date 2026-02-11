# VoidNote - 极简 Markdown 知识库

> 基于 Electron + React + TipTap 构建的极简风格 Markdown 知识库应用

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-40.2-blue.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://react.dev/)

## ✨ 特性

- 📝 **富文本编辑** - 基于 TipTap 的强大编辑器
- 🎨 **极简 UI 设计** - 专注于内容，界面简洁
- 🌓 **深色模式** - 支持浅色/深色主题切换
- 🌳 **文档树管理** - 支持嵌套文件夹结构
- 📑 **目录导航** - 自动生成文档目录，点击快速跳转
- ⌨️ **快捷键支持** - 高效的键盘操作
- 💾 **自动保存** - 停止输入后自动保存文档
- 🖼️ **图片支持** - 支持 URL 和本地图片插入
- 🔍 **全局搜索** - 快速查找文档内容
- 📊 **字数统计** - 实时显示字数和阅读时间

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Electron** | 34.3.1 | 桌面应用框架 |
| **React** | 19.1.0 | 前端框架 |
| **Vite** | 6.2.3 | 构建工具 |
| **TypeScript** | 5.8.3 | 类型安全 |
| **TipTap** | 3.19.0 | 富文本编辑器 |
| **Tailwind CSS** | 3.4.17 | 样式框架 |
| **Zustand** | 5.0.11 | 状态管理 |
| **lowlight** | 3.3.0 | 代码语法高亮 |

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 启动 Web 开发服务器
npm run dev

# 启动 Electron 桌面应用
npm run electron
```

### 构建

```bash
# 打包桌面应用
npm run build

# 仅构建不打包
npm run build:dir
```

---

## ✅ 已实现功能

### 📝 编辑功能

| 功能 | 状态 | 说明 |
|------|------|------|
| 富文本编辑 | ✅ | 基于 TipTap 核心编辑器 |
| Slash Command | ✅ | 输入 `/` 唤起快捷菜单 |
| 文本格式化 | ✅ | 粗体、斜体、**下划线**、~~删除线~~、`行内代码` |
| 标题 | ✅ | 一级、二级、三级标题 |
| 列表 | ✅ | 无序列表、有序列表、任务列表 |
| 引用块 | ✅ | 支持多行引用 |
| 代码块 | ✅ | 语法高亮、语言选择器、行号显示、复制按钮 |
| 分割线 | ✅ | 水平分割线 |
| 表格 | ✅ | 可调整大小的表格、行列操作 |
| 链接 | ✅ | 支持无选中文本时插入链接 |
| 图片 | ✅ | URL 和本地文件（自定义对话框） |
| 占位符 | ✅ | 空白编辑器提示 |
| 文本对齐 | ✅ | 左对齐、居中、右对齐 |
| 颜色/高亮 | ✅ | 文本颜色和背景色配置 |

### 📁 文档管理

| 功能 | 状态 | 说明 |
|------|------|------|
| 文档树 | ✅ | 支持嵌套的文档结构（parentId） |
| 创建文档 | ✅ | 新建文档功能 |
| 重命名文档 | ✅ | 内联编辑文档标题 |
| 删除文档 | ✅ | 带确认对话框的删除 |
| 文档搜索 | ✅ | 按标题搜索过滤 |
| 侧边栏折叠 | ✅ | 收起/展开侧边栏 |
| 文档展开/收起 | ✅ | 树形结构折叠 |

### 🎯 用户界面

| 功能 | 状态 | 说明 |
|------|------|------|
| 工具栏 | ✅ | 完整的格式化工具栏，分组设计，固定不滚动 |
| 侧边栏 | ✅ | 文档导航侧边栏 |
| 快捷键面板 | ✅ | 显示可用快捷键 |
| 设置模态框 | ✅ | 应用设置（自动保存、主题、工作区） |
| 上下文菜单 | ✅ | 文档操作菜单（重命名、删除） |
| 状态高亮 | ✅ | 工具栏按钮状态指示 |
| 面包屑导航 | ✅ | 显示当前文档路径 |
| 字数统计 | ✅ | 字数、字符数、阅读时间 |

### 💾 导出功能

| 功能 | 状态 | 说明 |
|------|------|------|
| 导出 Markdown | ✅ | 导出为 .md 文件 |
| 导出 HTML | ✅ | 导出为 .html 文件 |
| 导出 PDF | ✅ | 导出为 .pdf 文件 |

### ⚙️ 设置功能

| 功能 | 状态 | 说明 |
|------|------|------|
| 自动保存 | ✅ | 可配置的自动保存（停止输入 N 秒后保存） |
| 深色模式 | ✅ | 浅色/深色主题切换 |
| 工作区管理 | ✅ | 选择和更改知识库存储位置 |

### ⌨️ 快捷键

| 快捷键 | 功能 | 状态 |
|--------|------|------|
| `Ctrl+B` | 粗体 | ✅ |
| `Ctrl+I` | 斜体 | ✅ |
| `Ctrl+U` | 下划线 | ✅ |
| `Ctrl+K` | 插入链接 | ✅ |
| `Ctrl+S` | 保存文档 | ✅ |
| `Ctrl+Z` | 撤销 | ✅ |
| `Ctrl+Shift+Z` | 重做 | ✅ |
| `/` | 快捷菜单 | ✅ |
| `ArrowDown` | 退出代码块 | ✅ |
| `Backspace` | 空代码块保护 | ✅ |

---

## 🚧 待开发功能

### 🟡 中优先级

- [ ] **编辑体验**
  - [ ] 全屏模式
  - [ ] 焦点模式（隐藏侧边栏和工具栏）
  - [ ] 字体大小调整

- [ ] **文档操作**
  - [ ] 拖拽排序
  - [ ] 批量操作

---

### ⚪ 低优先级

- [ ] **高级功能**
  - [ ] 数学公式（KaTeX）
  - [ ] 自动目录生成
  - [ ] 版本历史

---

## 📂 项目结构

```
voidnote/
├── src/
│   ├── components/           # React 组件
│   │   ├── Sidebar.tsx       # 侧边栏
│   │   ├── Toolbar.tsx       # 工具栏
│   │   ├── EditorContent.tsx # 编辑器容器
│   │   ├── CodeBlockComponent.tsx  # 代码块组件
│   │   ├── SlashMenu.tsx     # Slash 菜单
│   │   ├── SlashMenuItem.tsx # 菜单项
│   │   ├── InputPrompt.tsx   # 自定义输入对话框
│   │   ├── Breadcrumb.tsx    # 面包屑导航
│   │   └── SettingsModal.tsx # 设置模态框
│   ├── stores/               # 状态管理
│   │   ├── documentStore.ts  # 文档 store
│   │   └── themeStore.ts     # 主题 store
│   ├── extensions/           # TipTap 扩展
│   │   ├── CustomCodeBlock.ts    # 自定义代码块
│   │   └── slash-command-extension.ts
│   ├── lib/                  # 工具函数
│   │   ├── utils.ts
│   │   ├── shortcuts.ts      # 快捷键 & 导出
│   │   ├── documentStorage.ts    # 文档存储
│   │   ├── markdownStorage.ts    # Markdown 存储
│   │   └── exportDocument.ts     # 文档导出
│   ├── types/                # TypeScript 类型
│   │   ├── document.ts
│   │   └── electron.d.ts
│   ├── main/                 # Electron 主进程
│   │   └── index.ts          # 主进程入口
│   ├── preload/              # 预加载脚本
│   │   └── index.ts
│   ├── App.tsx               # 主应用
│   ├── main.tsx              # 入口
│   └── index.css             # 全局样式
├── package.json
├── electron.vite.config.ts
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 🐛 已知问题

- [ ] **撤销/重做** - 部分操作未同步到文档树
- [ ] **表格编辑** - 表格操作体验需要优化

---

## 📊 功能状态

### ✅ 已实现

- ✅ 富文本编辑（粗体、斜体、下划线、删除线、代码）
- ✅ 多级标题
- ✅ 列表（无序、有序、任务）
- ✅ 代码块（语法高亮、语言选择）
- ✅ 表格
- ✅ 引用块
- ✅ 分割线
- ✅ 图片（URL + 本地）
- ✅ 链接
- ✅ 文本对齐
- ✅ Slash Command（快捷菜单）
- ✅ 文档树管理（嵌套文件夹结构）
- ✅ 全局搜索
- ✅ 面包屑导航
- ✅ 自动保存
- ✅ 深色模式
- ✅ 导出 Markdown/HTML/PDF
- ✅ 字数统计
- ✅ Markdown 存储

### 🚧 计划中

- [ ] 全屏模式
- [ ] 拖拽排序
- [ ] 数学公式
- [ ] 自动目录生成

---

## 📄 许可证

MIT License

---

## 🙏 致谢

- [TipTap](https://tiptap.dev/) - 富文本编辑器框架
- [Electron](https://www.electronjs.org/) - 桌面应用框架
- [lowlight](https://github.com/lowlightjs/lowlight) - 代码语法高亮
- [Lucide](https://lucide.dev/) - 图标库
