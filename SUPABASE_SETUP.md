# Supabase 数据库配置指南

## 1. 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 点击 "Start your project" 或 "New Project"
3. 填写项目信息：
   - Name: ai-travel-planner（或您喜欢的名称）
   - Database Password: 设置一个强密码（请妥善保管）
   - Region: 选择离您最近的区域（如 Southeast Asia - Singapore）
4. 点击 "Create new project" 等待项目创建完成（约 2 分钟）

## 2. 获取 API 密钥

项目创建完成后：

1. 在左侧菜单中点击 "Project Settings"（设置图标）
2. 点击 "API" 标签
3. 复制以下信息到 `.env.local` 文件：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJ...` (很长的一串字符)

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

## 3. 创建数据库表

在 Supabase 项目中：

1. 点击左侧菜单的 "SQL Editor"
2. 点击 "New query"
3. 复制并粘贴以下 SQL 语句：

```sql
-- 创建旅行计划表
CREATE TABLE travel_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(10, 2) NOT NULL,
  people_count INTEGER NOT NULL,
  preferences TEXT,
  itinerary JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建费用记录表
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES travel_plans(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('accommodation', 'transportation', 'food', 'activities', 'shopping', 'other')),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'CNY',
  description TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_travel_plans_user_id ON travel_plans(user_id);
CREATE INDEX idx_travel_plans_created_at ON travel_plans(created_at DESC);
CREATE INDEX idx_expenses_plan_id ON expenses(plan_id);
CREATE INDEX idx_expenses_date ON expenses(date);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_travel_plans_updated_at BEFORE UPDATE ON travel_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 设置行级安全策略（RLS）
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 用户只能查看和修改自己的旅行计划
CREATE POLICY "Users can view their own travel plans"
  ON travel_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own travel plans"
  ON travel_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own travel plans"
  ON travel_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own travel plans"
  ON travel_plans FOR DELETE
  USING (auth.uid() = user_id);

-- 用户只能查看和修改自己计划的费用记录
CREATE POLICY "Users can view expenses of their own plans"
  ON expenses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM travel_plans
    WHERE travel_plans.id = expenses.plan_id
    AND travel_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert expenses to their own plans"
  ON expenses FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM travel_plans
    WHERE travel_plans.id = expenses.plan_id
    AND travel_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can update expenses of their own plans"
  ON expenses FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM travel_plans
    WHERE travel_plans.id = expenses.plan_id
    AND travel_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete expenses of their own plans"
  ON expenses FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM travel_plans
    WHERE travel_plans.id = expenses.plan_id
    AND travel_plans.user_id = auth.uid()
  ));
```

4. 点击 "Run" 按钮执行 SQL
5. 确认所有语句都成功执行（显示绿色的 "Success"）

## 4. 配置认证

1. 点击左侧菜单的 "Authentication"
2. 在 "Providers" 标签中，确保 "Email" 已启用
3. （可选）在 "Email Templates" 中自定义注册确认邮件模板

## 5. 验证配置

1. 点击左侧菜单的 "Table Editor"
2. 应该能看到两个表：
   - `travel_plans` - 旅行计划表
   - `expenses` - 费用记录表
3. 点击表名可以查看表结构和数据

## 数据库表结构说明

### travel_plans 表（旅行计划）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键，自动生成 |
| user_id | UUID | 用户ID（外键关联 auth.users） |
| title | TEXT | 计划标题 |
| destination | TEXT | 目的地 |
| start_date | DATE | 开始日期 |
| end_date | DATE | 结束日期 |
| budget | DECIMAL | 预算 |
| people_count | INTEGER | 同行人数 |
| preferences | TEXT | 旅行偏好 |
| itinerary | JSONB | 行程详情（JSON格式） |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### expenses 表（费用记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键，自动生成 |
| plan_id | UUID | 计划ID（外键关联 travel_plans） |
| category | TEXT | 费用类别（住宿/交通/餐饮/活动/购物/其他） |
| amount | DECIMAL | 金额 |
| currency | TEXT | 货币（默认CNY） |
| description | TEXT | 说明 |
| date | DATE | 日期 |
| created_at | TIMESTAMP | 创建时间 |

## 安全说明

- 已启用行级安全策略（RLS），用户只能访问自己的数据
- 所有 API 请求都需要有效的认证令牌
- 数据库密码和 API 密钥请妥善保管

## 常见问题

### Q: 无法连接到 Supabase？
A: 请检查：
1. Project URL 和 Anon Key 在 `.env.local` 中是否正确
2. Supabase 项目是否处于激活状态
3. 浏览器控制台是否有错误信息

### Q: 注册后收不到验证邮件？
A: 请检查：
1. 垃圾邮件文件夹
2. Supabase 项目的 Email 设置
3. 如果是测试，可以在 Authentication 页面手动确认用户

### Q: 数据保存失败？
A: 请检查：
1. 是否已登录
2. RLS 策略是否正确配置
3. 数据格式是否符合表结构要求

## 需要帮助？

- Supabase 官方文档：[https://supabase.com/docs](https://supabase.com/docs)
- Supabase Discord 社区：[https://discord.supabase.com](https://discord.supabase.com)
