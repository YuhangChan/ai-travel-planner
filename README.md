# AI Travel Planner - AI 旅行规划师

基于 AI 的智能旅行规划 Web 应用，通过语音或文字输入旅行需求，自动生成详细的旅行路线、预算分析和实时费用管理。

## ✨ 功能特性

### 核心功能

1. **智能行程规划** 🗺️
   - 支持语音和文字输入旅行需求
   - AI 自动生成个性化旅行路线
   - 包含景点、餐饮、住宿、交通等完整安排
   - 基于用户偏好（美食、文化、购物等）定制行程

2. **费用预算管理** 💰
   - AI 智能预算分析和分配
   - 实时费用记录和追踪
   - 支持语音快速记账
   - 预算使用情况可视化
   - 多维度费用分类统计

3. **地图导航** 🧭
   - 集成高德地图 API
   - 景点和住宿位置标记
   - 交互式地图查看行程
   - 点击标记查看详细信息

4. **用户系统** 👤
   - 注册登录功能
   - 云端数据同步
   - 多设备访问
   - 多份旅行计划管理

5. **语音交互** 🎤
   - Web Speech API 语音识别
   - 语音输入旅行需求
   - 语音记录费用
   - 支持中文识别

## 🛠️ 技术栈

### 前端框架
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **React Router** - 路由管理

### UI 组件
- **Ant Design 5** - UI 组件库
- **TailwindCSS** - 样式工具

### 状态管理
- **Zustand** - 轻量级状态管理

### 后端服务
- **Supabase** - 数据库和认证
  - PostgreSQL 数据库
  - 用户认证系统
  - 行级安全策略（RLS）
  - 云端数据同步

### AI 集成
- **OpenAI API** (或兼容服务)
  - GPT-4 行程规划
  - 预算分析和建议
  - 自定义 Base URL 支持

### 地图服务
- **高德地图 API**
  - 地图展示
  - 位置标记
  - 信息窗口

### 语音识别
- **Web Speech API**
  - 浏览器原生语音识别
  - 支持 Chrome/Edge

## 📦 项目结构

```
ai-travel-planner/
├── src/
│   ├── components/          # 通用组件
│   │   ├── VoiceInput.tsx   # 语音输入组件
│   │   ├── MapView.tsx      # 地图展示组件
│   │   └── ExpenseTracker.tsx # 费用追踪组件
│   ├── pages/               # 页面组件
│   │   ├── Login.tsx        # 登录/注册页
│   │   ├── Home.tsx         # 主页（计划列表）
│   │   ├── CreatePlan.tsx   # 创建计划页
│   │   ├── PlanDetail.tsx   # 计划详情页
│   │   └── Settings.tsx     # 设置页（配置检查）
│   ├── services/            # 服务层
│   │   ├── supabase.ts      # Supabase 服务
│   │   ├── llm.ts           # LLM API 服务
│   │   ├── plan.ts          # 计划管理服务
│   │   └── speech.ts        # 语音识别服务
│   ├── config/              # 配置
│   │   └── api.ts           # API 配置
│   ├── store/               # 状态管理
│   │   └── index.ts         # Zustand store
│   ├── types/               # 类型定义
│   │   └── index.ts         # TypeScript 类型
│   ├── App.tsx              # 应用主组件
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式
├── index.html               # HTML 模板
├── .env.local.example       # 环境变量示例
├── package.json             # 项目依赖
├── tsconfig.json            # TypeScript 配置
├── vite.config.ts           # Vite 配置
└── README.md                # 项目说明
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- 现代浏览器（Chrome/Edge，支持 Web Speech API）

### 安装依赖

```bash
npm install
```

### 配置 API 密钥

1. **复制环境变量模板**
   ```bash
   cp .env.local.example .env.local
   ```

2. **编辑 `.env.local` 文件，填入你的 API Keys**

```env
# LLM API 配置（OpenAI 或兼容服务）
VITE_LLM_BASE_URL=https://api.openai.com/v1
VITE_LLM_API_KEY=sk-your-api-key-here
VITE_LLM_MODEL=gpt-4

# Supabase 配置
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# 高德地图 API Key
VITE_AMAP_API_KEY=your-amap-key-here
VITE_AMAP_SECURITY_CODE=your-amap-security-code-here
```

3. **如何获取这些 API Keys？**
   - **LLM API (OpenAI)**: 访问 [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - **Supabase**: 访问 [https://supabase.com](https://supabase.com) → 创建项目 → Project Settings → API
   - **高德地图**: 访问 [https://console.amap.com](https://console.amap.com) → 应用管理 → 我的应用 → 获取 Key 和安全密钥

### 配置 Supabase 数据库

参考 `SUPABASE_SETUP.md` 文档，执行 SQL 创建数据库表和安全策略。

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 首次使用

1. 注册账号或登录
2. 点击"创建新计划"
3. 填写旅行信息并生成 AI 计划
4. 在"设置"页面可以查看配置状态

## 📖 使用指南

### 语音输入示例

点击语音输入按钮后，可以这样说：

- "我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"
- "去北京玩3天，预算3000元，喜欢历史文化"
- "巴黎7日游，预算2万，想看艺术馆和购物"

### 费用管理

在计划详情页的"费用管理"标签：

1. 点击"添加费用"
2. 选择分类（住宿/交通/餐饮/活动/购物/其他）
3. 输入金额和说明
4. 或使用语音输入快速记账
5. 查看预算使用情况和分类统计

### 地图导航

在计划详情页的"地图导航"标签：

- 查看所有景点和住宿位置
- 点击标记查看详细信息
- 蓝色标记：景点
- 红色标记：住宿

## 🔒 安全说明

### API Key 安全

- 所有 API Key 存储在 `.env.local` 文件中
- `.env.local` 已添加到 `.gitignore`，**不会**提交到 Git
- 仅在构建时打包到应用中
- 建议定期更换 API Key
- 不要在公共仓库中暴露 API Keys

### 数据安全

- 使用 Supabase 行级安全策略（RLS）
- 用户只能访问自己的数据
- 所有请求都需要认证令牌
- HTTPS 加密传输

## 🏗️ 构建部署

### 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录

### 环境变量配置

部署时需要配置以下环境变量：
- `VITE_LLM_BASE_URL`
- `VITE_LLM_API_KEY`
- `VITE_LLM_MODEL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_AMAP_API_KEY`
- `VITE_AMAP_SECURITY_CODE`

### 部署到 Vercel

1. 在 Vercel 项目设置中添加环境变量
2. 连接 Git 仓库自动部署

### 部署到 Netlify

1. 在 Netlify 项目设置中添加环境变量
2. 构建命令：`npm run build`
3. 发布目录：`dist`

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [React](https://react.dev/)
- [Ant Design](https://ant.design/)
- [Supabase](https://supabase.com/)
- [OpenAI](https://openai.com/)
- [高德地图](https://lbs.amap.com/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---

⭐ 如果这个项目对您有帮助，欢迎 Star！
