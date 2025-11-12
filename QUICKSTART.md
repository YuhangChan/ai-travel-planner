# 快速开始指南

## 第一步：安装依赖

```bash
npm install
```

## 第二步：配置环境变量

### 2.1 复制环境变量模板

```bash
cp .env.local.example .env.local
```

### 2.2 编辑 `.env.local` 文件

填入以下配置：

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

## 第三步：获取 API Keys

### 3.1 LLM API (OpenAI)

1. 访问 [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. 创建 API Key
3. 复制 Base URL: `https://api.openai.com/v1`
4. 复制 API Key: `sk-...`
5. 选择模型：`gpt-4` 或 `gpt-3.5-turbo` 等

**或使用其他兼容服务：**
- Azure OpenAI
- 国内 GPT API 服务
- 自部署 LLM 服务

### 3.2 Supabase

1. 访问 [https://supabase.com](https://supabase.com)
2. 创建新项目
3. 进入 Project Settings → API
4. 复制：
   - Project URL: `https://xxxxx.supabase.co`
   - anon/public key: `eyJ...`

### 3.3 高德地图 API

1. 访问 [https://console.amap.com](https://console.amap.com)
2. 应用管理 → 我的应用 → 创建新应用
3. 添加 Key（选择 Web 端 JS API）
4. 复制 API Key
5. 获取安全密钥（securityJsCode）：
   - 在应用设置中找到"Web端（JS API）"
   - 复制安全密钥（securityJsCode）

## 第四步：配置 Supabase 数据库

参考 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 执行 SQL 创建数据库表。

## 第五步：启动应用

```bash
npm run dev
```

访问 http://localhost:3000

## 第六步：使用应用

1. **注册账号**
   - 输入邮箱和密码（密码至少6位）
   - 查收验证邮件

2. **登录应用**
   - 使用注册的邮箱和密码登录

3. **检查配置**
   - 点击"设置"按钮
   - 查看所有 API 配置状态

4. **创建旅行计划**
   - 点击"创建新计划"
   - 填写目的地、日期、预算、人数
   - 输入旅行偏好（或使用语音输入）
   - 生成 AI 计划

## 常见问题

### Q1: 配置不完整？
**A:** 检查 `.env.local` 文件中所有环境变量是否填写完整，重启开发服务器。

### Q2: 语音识别不工作？
**A:** 确保使用 Chrome 或 Edge 浏览器，并授予麦克风权限。

### Q3: 地图不显示？
**A:** 检查高德地图 API Key 是否正确配置在 `.env.local` 中。

### Q4: 无法登录/注册？
**A:** 检查 Supabase 配置是否正确，数据库表是否创建。

### Q5: AI 生成计划失败？
**A:** 检查 LLM API Key 是否有效，是否有足够余额。

## 技术支持

- 查看浏览器控制台（F12）的错误信息
- 检查 `.env.local` 文件配置
- 在"设置"页面查看配置状态
- 查看 [README.md](./README.md) 完整文档

## 下一步

- 使用语音快速记录费用
- 在地图上查看行程
- 创建更多旅行计划

享受你的智能旅行规划体验！ ✈️🌍
