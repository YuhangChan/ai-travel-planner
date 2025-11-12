# 多阶段构建 Dockerfile for AI Travel Planner

# ==================== Stage 1: Build ====================
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --prefer-offline --no-audit

# 复制源代码
COPY . .

# 构建应用
# 注意：不设置任何环境变量，因为用户会在运行时通过配置页面输入
RUN npm run build

# ==================== Stage 2: Production ====================
FROM nginx:1.25-alpine

# 安装 tzdata 用于时区设置
RUN apk add --no-cache tzdata

# 设置时区为中国
ENV TZ=Asia/Shanghai

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 创建启动脚本来注入环境变量（可选，用于支持运行时环境变量）
RUN echo '#!/bin/sh' > /docker-entrypoint.d/40-generate-env.sh && \
    echo 'echo "Generating runtime environment configuration..."' >> /docker-entrypoint.d/40-generate-env.sh && \
    echo 'cat <<EOF > /usr/share/nginx/html/runtime-env.js' >> /docker-entrypoint.d/40-generate-env.sh && \
    echo 'window._env_ = {' >> /docker-entrypoint.d/40-generate-env.sh && \
    echo '  VITE_LLM_BASE_URL: "${VITE_LLM_BASE_URL:-}",' >> /docker-entrypoint.d/40-generate-env.sh && \
    echo '  VITE_LLM_API_KEY: "${VITE_LLM_API_KEY:-}",' >> /docker-entrypoint.d/40-generate-env.sh && \
    echo '  VITE_LLM_MODEL: "${VITE_LLM_MODEL:-gpt-4}",' >> /docker-entrypoint.d/40-generate-env.sh && \
    echo '  VITE_SUPABASE_URL: "${VITE_SUPABASE_URL:-}",' >> /docker-entrypoint.d/40-generate-env.sh && \
    echo '  VITE_SUPABASE_ANON_KEY: "${VITE_SUPABASE_ANON_KEY:-}",' >> /docker-entrypoint.d/40-generate-env.sh && \
    echo '  VITE_AMAP_API_KEY: "${VITE_AMAP_API_KEY:-}",' >> /docker-entrypoint.d/40-generate-env.sh && \
    echo '  VITE_AMAP_SECURITY_CODE: "${VITE_AMAP_SECURITY_CODE:-}"' >> /docker-entrypoint.d/40-generate-env.sh && \
    echo '};' >> /docker-entrypoint.d/40-generate-env.sh && \
    echo 'EOF' >> /docker-entrypoint.d/40-generate-env.sh && \
    chmod +x /docker-entrypoint.d/40-generate-env.sh

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

# 使用默认的 nginx 启动命令
CMD ["nginx", "-g", "daemon off;"]
