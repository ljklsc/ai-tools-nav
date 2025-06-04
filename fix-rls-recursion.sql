-- 修复 Supabase admins 表的无限递归 RLS 策略问题
-- 执行此脚本来解决 "infinite recursion detected in policy for relation 'admins'" 错误

-- 1. 首先删除现有的有问题的 RLS 策略
DROP POLICY IF EXISTS "Users can view admin status" ON admins;
DROP POLICY IF EXISTS "Admin access policy" ON admins;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON admins;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON admins;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON admins;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON admins;

-- 2. 暂时禁用 RLS（用于测试）
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- 3. 或者创建简单的非递归策略（推荐用于生产环境）
-- 取消注释以下代码来启用简单的 RLS 策略：

/*
-- 重新启用 RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 创建简单的策略：只允许认证用户查看
CREATE POLICY "Allow authenticated users to view admins" ON admins
    FOR SELECT USING (auth.role() = 'authenticated');

-- 创建策略：只允许现有管理员插入新管理员
CREATE POLICY "Allow admins to insert" ON admins
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid()
        )
    );
*/

-- 4. 验证策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'admins';