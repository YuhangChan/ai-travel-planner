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
- 支持本地持久化

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
│   │   └── Settings.tsx     # 设置页（API配置）
│   ├── services/            # 服务层
│   │   ├── supabase.ts      # Supabase 服务
│   │   ├── llm.ts           # LLM API 服务
│   │   ├── plan.ts          # 计划管理服务
│   │   └── speech.ts        # 语音识别服务
│   ├── store/               # 状态管理
│   │   └── index.ts         # Zustand store
│   ├── types/               # 类型定义
│   │   └── index.ts         # TypeScript 类型
│   ├── App.tsx              # 应用主组件
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式
├── index.html               # HTML 模板
├── package.json             # 项目依赖
├── tsconfig.json            # TypeScript 配置
├── vite.config.ts           # Vite 配置
├── tailwind.config.js       # TailwindCSS 配置
├── SUPABASE_SETUP.md        # Supabase 配置指南
└── README.md                # 项目说明
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- 现代浏览器（Chrome/Edge，支持 Web Speech API）

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install

# 或使用 pnpm
pnpm install
```

### 配置 API 密钥

本项目需要配置以下 API 服务：

1. **Supabase**（数据库和认证）
   - 参考 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 创建项目和数据库
   - 获取 Project URL 和 Anon Key

2. **LLM API**（AI 行程规划）
   - OpenAI API: https://platform.openai.com/api-keys
   - 或其他兼容 OpenAI 格式的 API 服务

3. **高德地图 API**（地图服务）
   - 访问 https://console.amap.com 申请 Web 服务 Key
   - 在 `index.html` 中替换 `YOUR_AMAP_KEY`

```html
<!-- index.html -->
<script type="text/javascript" src="https://webapi.amap.com/maps?v=2.0&key=YOUR_AMAP_KEY"></script>
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 首次使用配置

1. 注册账号或登录
2. 访问"设置"页面
3. 填入以下配置：
   - LLM Base URL（例如：`https://api.openai.com/v1`）
   - LLM API Key
   - Supabase URL
   - Supabase Anon Key
   - 高德地图 API Key
4. 保存设置

### 创建第一个旅行计划

1. 点击"创建新计划"
2. 填写基本信息：
   - 目的地
   - 出行日期
   - 预算
   - 同行人数
3. （可选）点击"语音输入"按钮，说出您的旅行偏好
4. 点击"生成 AI 旅行计划"
5. 等待 AI 生成详细行程（约 10-30 秒）
6. 查看行程详情、地图导航和费用管理

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

- 所有 API Key 仅存储在**浏览器本地**（localStorage）
- **不会**上传到任何服务器
- 建议定期更换 API Key
- 不要在公共设备上保存 API Key

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

### 部署到 Vercel

1. 安装 Vercel CLI：
```bash
npm i -g vercel
```

2. 部署：
```bash
vercel
```

### 部署到 Netlify

1. 在 Netlify 中创建新站点
2. 连接 Git 仓库
3. 构建命令：`npm run build`
4. 发布目录：`dist`

### 部署到其他平台

支持任何静态网站托管平台：
- GitHub Pages
- Cloudflare Pages
- AWS S3 + CloudFront
- 等等

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

## 📞 联系方式

如有问题或建议，请提交 Issue 或联系开发者。

---

⭐ 如果这个项目对您有帮助，欢迎 Star！
