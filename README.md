# React Router 7 + Chakra UI 模板

一个基于 React Router 7 和 Chakra UI 的现代 React 应用模板。

## 📋 特性

- ⚡️ React Router 7 + 服务端渲染 (SSR)
- 🎨 Chakra UI 3.x 组件库
- 🔒 TypeScript 支持
- 📱 响应式布局示例
- 🌙 主题系统 (next-themes)
- 🛠️ Vite + HMR 开发环境
- 📦 Biome 代码格式化

## 🛠️ 技术栈

- **框架**: React 19 + React Router 7
- **UI 库**: Chakra UI 3.x
- **语言**: TypeScript
- **构建工具**: Vite
- **包管理器**: pnpm

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 `http://localhost:5173`

### 构建

```bash
pnpm build
```

### 其他命令

```bash
pnpm start      # 启动生产服务器
pnpm typecheck  # 类型检查
pnpm format     # 代码格式化
```

## 📁 项目结构

```
├── app/
│   ├── components/         # 可复用组件
│   ├── routes/            # 路由页面
│   │   ├── layout.tsx     # 布局组件
│   │   └── home.tsx       # 首页
│   ├── root.tsx           # 根组件
│   └── routes.ts          # 路由配置
├── public/                # 静态资源
└── package.json
```

## 📝 使用说明

### 添加新页面

1. 在 `app/routes/` 创建新路由文件
2. 在 `app/routes.ts` 配置路由
3. 在 `layout.tsx` 添加导航（可选）

### 主题配置

模板已配置 Chakra UI 主题系统，支持浅色/深色模式切换。

### 组件开发

使用 Chakra UI 组件构建界面，所有组件都有完整的 TypeScript 类型支持。

---

### 💬 聊天功能
- [ ] 聊天界面设计
- [ ] 消息收发逻辑
- [ ] 实时通信集成

### 👥 联系人管理
- [ ] 联系人列表
- [ ] 添加/删除联系人
- [ ] 用户状态显示

### 🧭 探索功能
- [ ] 用户/群组搜索
- [ ] 推荐系统
- [ ] 社交功能

### ⚙️ 设置页面
- [ ] 用户个人资料
- [ ] 应用设置
- [ ] 主题切换界面

## 🏗️ 构建和部署

### 生产构建

```bash
pnpm build
```

### 部署

支持部署到：
- Vercel, Netlify 等静态托管平台
- Node.js 服务器
- Docker 容器

## 🔧 开发指南

### 开始开发

1. 选择一个功能模块（如聊天、联系人等）
2. 在对应的路由文件中实现界面
3. 添加必要的组件到 `app/components/`
4. 根据需要扩展路由配置

### 添加新页面

1. 在 `app/routes/` 创建新路由文件
2. 在 `app/routes.ts` 添加路由配置
3. 如需导航，在 `layout.tsx` 添加导航项

## 🤝 贡献

欢迎贡献代码，帮助完善这个即时通讯应用！

---

Built with ❤️ using React Router 7 and Chakra UI
