# Docker 部署指南

本文档介绍如何构建、测试和部署 AI Travel Planner 的 Docker 镜像。

## 📋 目录

- [本地构建和测试](#本地构建和测试)
- [GitHub Actions 自动部署](#github-actions-自动部署)
- [运行 Docker 容器](#运行-docker-容器)
- [环境变量配置](#环境变量配置)
- [故障排查](#故障排查)

---

## 🔧 本地构建和测试

### 1. 构建 Docker 镜像

在项目根目录下运行：

```bash
# 构建镜像
docker build -t ai-travel-planner:latest .

# 或者使用自定义标签
docker build -t ai-travel-planner:v1.0.0 .
```

构建过程说明：
- **阶段 1 (Builder)**：使用 Node.js 18 安装依赖并构建前端应用
- **阶段 2 (Production)**：使用 Nginx Alpine 镜像提供静态文件服务
- 最终镜像大小约 40-50 MB

### 2. 查看构建的镜像

```bash
# 列出镜像
docker images | grep ai-travel-planner

# 查看镜像详情
docker inspect ai-travel-planner:latest
```

### 3. 本地运行测试

#### 方式 1: 不带环境变量（推荐）

用户将通过配置页面输入 API Keys：

```bash
docker run -d \
  --name ai-travel-planner-test \
  -p 8080:80 \
  ai-travel-planner:latest
```

然后访问 http://localhost:8080，应用会自动跳转到配置页面 (`/config`)，用户可以在这里输入所有必需的 API Keys。

#### 方式 2: 带环境变量（可选）

如果希望预设默认值：

```bash
docker run -d \
  --name ai-travel-planner-test \
  -p 8080:80 \
  -e VITE_LLM_BASE_URL=https://api.openai.com/v1 \
  -e VITE_LLM_API_KEY=your-api-key \
  -e VITE_LLM_MODEL=gpt-4 \
  -e VITE_SUPABASE_URL=https://xxxxx.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=your-anon-key \
  -e VITE_AMAP_API_KEY=your-amap-key \
  -e VITE_AMAP_SECURITY_CODE=your-security-code \
  ai-travel-planner:latest
```

### 4. 测试应用功能

访问 http://localhost:8080 并测试以下功能：

- ✅ **配置页面** (`/config`)：检查是否可以填写和保存 API Keys
- ✅ **登录/注册**：测试 Supabase 认证功能
- ✅ **创建计划**：测试 LLM API 调用和流式输出
- ✅ **地图显示**：测试高德地图 API 集成
- ✅ **路由跳转**：测试所有页面路由是否正常（`/`, `/create`, `/plan/:id`, `/settings`, `/debug`）

### 5. 查看容器日志

```bash
# 实时查看日志
docker logs -f ai-travel-planner-test

# 查看最近 100 行日志
docker logs --tail 100 ai-travel-planner-test
```

### 6. 进入容器调试

```bash
# 进入容器
docker exec -it ai-travel-planner-test sh

# 查看 nginx 配置
cat /etc/nginx/conf.d/default.conf

# 查看网站文件
ls -la /usr/share/nginx/html

# 检查 nginx 进程
ps aux | grep nginx

# 退出容器
exit
```

### 7. 停止和清理

```bash
# 停止容器
docker stop ai-travel-planner-test

# 删除容器
docker rm ai-travel-planner-test

# 删除镜像（可选）
docker rmi ai-travel-planner:latest
```

---

## 🚀 GitHub Actions 自动部署

### 1. 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets（Settings → Secrets and variables → Actions）：

| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `ALIYUN_REGISTRY` | 阿里云容器镜像服务地址 | `registry.cn-hangzhou.aliyuncs.com` |
| `ALIYUN_NAMESPACE` | 镜像命名空间 | `your-namespace` |
| `ALIYUN_USERNAME` | 阿里云账号用户名 | `your-username@example.com` |
| `ALIYUN_PASSWORD` | 阿里云容器镜像服务密码 | `your-password` |

#### 如何获取阿里云容器镜像服务信息：

1. 访问 [阿里云容器镜像服务控制台](https://cr.console.aliyun.com/)
2. 创建命名空间（如果还没有）
3. 在"访问凭证"页面查看：
   - Registry 地址（如 `registry.cn-hangzhou.aliyuncs.com`）
   - 用户名（通常是阿里云账号）
4. 设置或重置密码

### 2. 触发构建

GitHub Actions 会在以下情况自动触发：

- ✅ **Push 到 main/master 分支**：构建并推送 `latest` 标签
- ✅ **创建 Git Tag**（如 `v1.0.0`）：构建并推送版本标签
- ✅ **Pull Request**：仅构建不推送
- ✅ **手动触发**：在 GitHub Actions 页面点击 "Run workflow"

### 3. 查看构建状态

1. 进入 GitHub 仓库的 **Actions** 页面
2. 查看最新的 workflow 运行状态
3. 点击查看详细日志

### 4. 镜像标签说明

| 触发条件 | 镜像标签 | 示例 |
|---------|---------|------|
| Push 到 main | `latest` | `registry.cn-hangzhou.aliyuncs.com/namespace/ai-travel-planner:latest` |
| Git Tag v1.0.0 | `1.0.0`, `1.0`, `v1.0.0` | `registry.cn-hangzhou.aliyuncs.com/namespace/ai-travel-planner:1.0.0` |
| PR #123 | `pr-123` | `registry.cn-hangzhou.aliyuncs.com/namespace/ai-travel-planner:pr-123` |
| Git SHA | `main-abc1234` | `registry.cn-hangzhou.aliyuncs.com/namespace/ai-travel-planner:main-abc1234` |

---

## 🐳 运行 Docker 容器

### 从阿里云拉取并运行

```bash
# 登录阿里云容器镜像服务
docker login registry.cn-hangzhou.aliyuncs.com

# 拉取镜像
docker pull registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-travel-planner:latest

# 运行容器
docker run -d \
  --name ai-travel-planner \
  -p 80:80 \
  --restart unless-stopped \
  registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-travel-planner:latest
```

### 使用 Docker Compose（推荐）

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  ai-travel-planner:
    image: registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-travel-planner:latest
    container_name: ai-travel-planner
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      # 可选：预设环境变量（用户仍可在配置页面修改）
      # - VITE_LLM_BASE_URL=https://api.openai.com/v1
      # - VITE_LLM_MODEL=gpt-4
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:80/health"]
      interval: 30s
      timeout: 3s
      start_period: 5s
      retries: 3
```

运行：

```bash
# 启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

---

## ⚙️ 环境变量配置

### 应用配置方式说明

本应用采用**双层配置机制**：

1. **环境变量**（可选，作为默认值）
   - 在 Docker 运行时通过 `-e` 参数或 docker-compose.yml 设置
   - 会在配置页面作为默认值预填充

2. **localStorage**（推荐，优先级更高）
   - 用户通过配置页面 (`/config`) 手动输入
   - 存储在浏览器本地，每个用户独立配置
   - 配置优先级：localStorage > 环境变量

### 配置项清单

| 环境变量 | 必需 | 说明 | 默认值 |
|---------|-----|------|--------|
| `VITE_LLM_BASE_URL` | 是 | LLM API 地址 | 无 |
| `VITE_LLM_API_KEY` | 是 | LLM API 密钥 | 无 |
| `VITE_LLM_MODEL` | 是 | LLM 模型名称 | `gpt-4` |
| `VITE_SUPABASE_URL` | 是 | Supabase 项目 URL | 无 |
| `VITE_SUPABASE_ANON_KEY` | 是 | Supabase 匿名密钥 | 无 |
| `VITE_AMAP_API_KEY` | 是 | 高德地图 API Key | 无 |
| `VITE_AMAP_SECURITY_CODE` | 是 | 高德地图安全密钥 | 无 |

### 典型使用场景

#### 场景 1: 多用户环境（推荐）

不设置环境变量，让每个用户通过配置页面输入自己的 API Keys：

```bash
docker run -d -p 80:80 ai-travel-planner:latest
```

#### 场景 2: 单用户环境

预设所有配置，跳过配置页面：

```bash
docker run -d \
  -p 80:80 \
  -e VITE_LLM_BASE_URL=https://api.openai.com/v1 \
  -e VITE_LLM_API_KEY=sk-... \
  -e VITE_LLM_MODEL=gpt-4 \
  -e VITE_SUPABASE_URL=https://xxx.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=eyJ... \
  -e VITE_AMAP_API_KEY=xxx \
  -e VITE_AMAP_SECURITY_CODE=xxx \
  ai-travel-planner:latest
```

#### 场景 3: 部分预设

只预设公共配置，用户补充私密信息：

```bash
docker run -d \
  -p 80:80 \
  -e VITE_SUPABASE_URL=https://xxx.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=eyJ... \
  -e VITE_AMAP_API_KEY=xxx \
  -e VITE_AMAP_SECURITY_CODE=xxx \
  ai-travel-planner:latest
```

用户只需在配置页面填写 LLM 相关配置。

---

## 🔍 故障排查

### 问题 1: 容器无法启动

```bash
# 查看容器状态
docker ps -a | grep ai-travel-planner

# 查看详细错误日志
docker logs ai-travel-planner-test
```

### 问题 2: 页面显示空白

1. 检查浏览器控制台是否有 JavaScript 错误
2. 验证 nginx 配置是否正确：
   ```bash
   docker exec ai-travel-planner-test cat /etc/nginx/conf.d/default.conf
   ```
3. 检查构建产物是否存在：
   ```bash
   docker exec ai-travel-planner-test ls -la /usr/share/nginx/html
   ```

### 问题 3: 路由 404 错误

确认 nginx.conf 包含以下配置：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 问题 4: 配置无法保存

1. 检查浏览器是否允许 localStorage
2. 打开浏览器开发者工具 → Application → Local Storage
3. 查看是否有 `ai-travel-planner-config` 键

### 问题 5: API 调用失败

1. 访问 `/settings` 页面检查配置状态
2. 确认所有 API Keys 已正确配置
3. 检查浏览器控制台的网络请求错误

### 问题 6: GitHub Actions 构建失败

1. 检查 Secrets 是否正确配置
2. 验证阿里云容器镜像服务凭证是否有效
3. 查看 Actions 日志中的详细错误信息

---

## 📊 性能优化

### 镜像大小优化

- ✅ 使用多阶段构建
- ✅ 使用 Alpine 基础镜像
- ✅ .dockerignore 排除不必要文件
- ✅ 最终镜像大小约 40-50 MB

### 运行时优化

- ✅ Nginx gzip 压缩
- ✅ 静态资源缓存（1 年）
- ✅ 健康检查
- ✅ 多平台支持 (amd64, arm64)

---

## 📚 相关资源

- [Docker 官方文档](https://docs.docker.com/)
- [阿里云容器镜像服务](https://help.aliyun.com/product/60716.html)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Nginx 配置指南](https://nginx.org/en/docs/)

---

## 🆘 获取帮助

如果遇到问题：

1. 查看本文档的"故障排查"部分
2. 检查容器日志：`docker logs ai-travel-planner`
3. 在 GitHub Issues 中提问
4. 确保所有 API Keys 配置正确

---

**最后更新**: 2025-11-12
