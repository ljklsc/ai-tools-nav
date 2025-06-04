'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  getTools,
  getCategories,
  createTool,
  updateTool,
  deleteTool as deleteToolAPI,
  createCategory,
  updateCategory,
  deleteCategory as deleteCategoryAPI,
  getStats,
  type Tool as APITool,
  type Category as APICategory
} from '@/lib/api';

// 适配后台使用的类型
interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  category_id: string;
  status: 'active' | 'inactive';
  createdAt: string;
  logo?: string;
  is_free: boolean;
  rating: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
  toolCount: number;
}

interface Stats {
  totalTools: number;
  totalCategories: number;
  pendingComments: number;
  totalViews: number;
}

export default function AdminDashboard() {
  const { user, isAdmin, loading, signOut } = useAuth(); // 添加signOut
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalTools: 0,
    totalCategories: 0,
    pendingComments: 0,
    totalViews: 0
  });
  const [showToolForm, setShowToolForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 表单状态
  const [toolForm, setToolForm] = useState({
    name: '',
    description: '',
    url: '',
    category_id: '',
    logo: '',
    is_free: true,
    rating: 0,
    status: 'active' as 'active' | 'inactive'
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/admin/login');
      return;
    }

    if (isAdmin) {
      loadData();
    }
  }, [user, isAdmin, loading, router]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 并行加载所有数据
      const [toolsResult, categoriesResult, statsResult] = await Promise.all([
        getTools(),
        getCategories(),
        getStats()
      ]);

      if (toolsResult.error) {
        throw new Error(`加载工具失败: ${toolsResult.error}`);
      }
      if (categoriesResult.error) {
        throw new Error(`加载分类失败: ${categoriesResult.error}`);
      }
      if (statsResult.error) {
        throw new Error(`加载统计失败: ${statsResult.error}`);
      }

      // 转换工具数据格式
      const transformedTools: Tool[] = (toolsResult.data || []).map((tool: APITool) => ({
        id: tool.id,
        name: tool.name,
        description: tool.description,
        url: tool.url,
        category: tool.category?.name || '未分类',
        category_id: tool.category_id,
        status: 'active' as const, // 可以根据实际需要调整
        createdAt: tool.created_at?.split('T')[0] || '',
        logo: tool.logo,
        is_free: tool.is_free,
        rating: tool.rating
      }));

      // 计算每个分类的工具数量
      const transformedCategories: Category[] = (categoriesResult.data || []).map((cat: APICategory) => {
        const toolCount = transformedTools.filter(tool => tool.category_id === cat.id).length;
        return {
          id: cat.id,
          name: cat.name,
          description: cat.description || '',
          toolCount
        };
      });

      setTools(transformedTools);
      setCategories(transformedCategories);
      setStats({
        totalTools: statsResult.data?.totalTools || 0,
        totalCategories: statsResult.data?.totalCategories || 0,
        pendingComments: 0, // 如果有评论系统可以添加
        totalViews: statsResult.data?.totalViews || 0
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载数据失败';
      setError(errorMessage);
      console.error('加载数据失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 改进表单重置函数
  const resetToolForm = () => {
    setToolForm({ 
      name: '', 
      description: '', 
      url: '', 
      category_id: '', 
      logo: '', 
      is_free: true, 
      rating: 0, 
      status: 'active' 
    });
    setEditingTool(null);
    setShowToolForm(false);
  };
  
  // 改进handleToolSubmit函数
  const handleToolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!toolForm.name.trim() || !toolForm.description.trim() || !toolForm.url.trim() || !toolForm.category_id) {
      setError('请填写所有必填字段');
      return;
    }
    
    setIsLoading(true);
    setError(null);
  
    try {
      if (editingTool) {
        // 更新工具
        const result = await updateTool(editingTool.id, {
          name: toolForm.name.trim(),
          description: toolForm.description.trim(),
          url: toolForm.url.trim(),
          category_id: toolForm.category_id,
          logo: toolForm.logo.trim(),
          is_free: toolForm.is_free,
          rating: toolForm.rating
        });
  
        if (result.error) {
          throw new Error(result.error);
        }
      } else {
        // 创建新工具
        const result = await createTool({
          name: toolForm.name.trim(),
          description: toolForm.description.trim(),
          url: toolForm.url.trim(),
          category_id: toolForm.category_id,
          logo: toolForm.logo.trim(),
          is_free: toolForm.is_free,
          rating: toolForm.rating,
          tags: [] // 添加默认tags字段
        });
  
        if (result.error) {
          throw new Error(result.error);
        }
      }
  
      // 重新加载数据
      await loadData();
      
      // 重置表单并关闭模态框
      resetToolForm();
      
      // 显示成功消息
      console.log(editingTool ? '工具更新成功' : '工具创建成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '操作失败';
      setError(errorMessage);
      console.error('工具操作失败:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 添加取消按钮的处理函数
  const handleCancelToolForm = () => {
    resetToolForm();
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (editingCategory) {
        // 更新分类
        const result = await updateCategory(editingCategory.id, {
          name: categoryForm.name,
          description: categoryForm.description
        });

        if (result.error) {
          throw new Error(result.error);
        }
      } else {
        // 创建新分类
        const result = await createCategory({
          name: categoryForm.name,
          description: categoryForm.description
        });

        if (result.error) {
          throw new Error(result.error);
        }
      }

      // 重新加载数据
      await loadData();
      
      // 重置表单
      setCategoryForm({ name: '', description: '' });
      setShowCategoryForm(false);
      setEditingCategory(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '操作失败';
      setError(errorMessage);
      console.error('分类操作失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTool = async (id: string) => {
    if (!confirm('确定要删除这个工具吗？')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await deleteToolAPI(id);
      if (result.error) {
        throw new Error(result.error);
      }

      // 重新加载数据
      await loadData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除失败';
      setError(errorMessage);
      console.error('删除工具失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('确定要删除这个分类吗？')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await deleteCategoryAPI(id);
      if (result.error) {
        throw new Error(result.error);
      }

      // 重新加载数据
      await loadData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除失败';
      setError(errorMessage);
      console.error('删除分类失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const editTool = (tool: Tool) => {
    setEditingTool(tool);
    setToolForm({
      name: tool.name,
      description: tool.description,
      url: tool.url,
      category_id: tool.category_id,
      logo: tool.logo || '',
      is_free: tool.is_free,
      rating: tool.rating,
      status: tool.status
    });
    setShowToolForm(true);
  };

  const editCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description
    });
    setShowCategoryForm(true);
  };

  // 添加退出登录处理函数
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 错误提示 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mx-4">
          <strong className="font-bold">错误：</strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="float-right font-bold text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">管理后台</h1>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-xs sm:text-sm text-gray-600 truncate max-w-32 sm:max-w-none">
                欢迎，{user?.email}
              </span>
              <button
                onClick={() => router.push('/')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                返回首页
              </button>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* 响应式标签导航 */}
        <div className="mb-6 sm:mb-8">
          <nav className="flex space-x-2 sm:space-x-8 overflow-x-auto pb-2">
            {[
              { id: 'dashboard', name: '数据统计' },
              { id: 'tools', name: '工具管理' },
              { id: 'categories', name: '分类管理' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* 数据统计面板 */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">总工具数</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalTools}</p>
                  </div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm">🔧</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">总分类数</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
                  </div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm">📁</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">总访问量</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalViews}</p>
                  </div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm">👁️</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">待审核评论</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.pendingComments}</p>
                  </div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm">💬</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 工具管理 */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
              <h2 className="text-xl font-semibold text-gray-900">工具管理</h2>
              <button
                onClick={() => {
                  setEditingTool(null);
                  setToolForm({ 
                    name: '', 
                    description: '', 
                    url: '', 
                    category_id: '', 
                    logo: '', 
                    is_free: true, 
                    rating: 0, 
                    status: 'active' 
                  });
                  setShowToolForm(true);
                }}
                className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                disabled={isLoading}
              >
                添加工具
              </button>
            </div>

            {/* 工具表格 */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">描述</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tools.map((tool) => (
                      <tr key={tool.id}>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="max-w-32 lg:max-w-none truncate">{tool.name}</div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                          <div className="max-w-xs truncate">{tool.description}</div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tool.category}</td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            tool.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {tool.status === 'active' ? '启用' : '禁用'}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => editTool(tool)}
                              className="text-blue-600 hover:text-blue-900"
                              disabled={isLoading}
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => deleteTool(tool.id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={isLoading}
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 工具表单模态框 */}
            {showToolForm && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
                <div className="relative top-4 sm:top-20 mx-auto p-5 border w-full max-w-md sm:max-w-lg shadow-lg rounded-md bg-white">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {editingTool ? '编辑工具' : '添加工具'}
                  </h3>
                  <form onSubmit={handleToolSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">名称</label>
                      <input
                        type="text"
                        value={toolForm.name}
                        onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">描述</label>
                      <textarea
                        value={toolForm.description}
                        onChange={(e) => setToolForm({ ...toolForm, description: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        rows={3}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">URL</label>
                      <input
                        type="url"
                        value={toolForm.url}
                        onChange={(e) => setToolForm({ ...toolForm, url: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">分类</label>
                      <select
                        value={toolForm.category_id}
                        onChange={(e) => setToolForm({ ...toolForm, category_id: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                        disabled={isLoading}
                      >
                        <option value="">选择分类</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Logo URL</label>
                      <input
                        type="url"
                        value={toolForm.logo}
                        onChange={(e) => setToolForm({ ...toolForm, logo: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_free"
                        checked={toolForm.is_free}
                        onChange={(e) => setToolForm({ ...toolForm, is_free: e.target.checked })}
                        className="mr-2"
                        disabled={isLoading}
                      />
                      <label htmlFor="is_free" className="text-sm font-medium text-gray-700">免费工具</label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">评分 (0-5)</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={toolForm.rating}
                        onChange={(e) => setToolForm({ ...toolForm, rating: parseFloat(e.target.value) || 0 })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowToolForm(false)}
                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        disabled={isLoading}
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        disabled={isLoading}
                      >
                        {isLoading ? '处理中...' : (editingTool ? '更新' : '添加')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 分类管理和评论审核也采用类似的响应式设计 */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">分类管理</h2>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({ name: '', description: '' });
                  setShowCategoryForm(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                添加分类
              </button>
            </div>

            {/* 分类表格 */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工具数量</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.toolCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => editCategory(category)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分类表单模态框 */}
            {showCategoryForm && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {editingCategory ? '编辑分类' : '添加分类'}
                  </h3>
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">名称</label>
                      <input
                        type="text"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">描述</label>
                      <textarea
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        rows={3}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowCategoryForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        disabled={isLoading}
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        disabled={isLoading}
                      >
                        {isLoading ? '处理中...' : (editingCategory ? '更新' : '添加')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 评论审核 */}
        {activeTab === 'comments' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">评论审核</h2>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工具</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评论内容</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">作者</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {comments.map((comment) => (
                    <tr key={comment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{comment.toolName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{comment.content}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comment.author}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          comment.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : comment.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {comment.status === 'pending' ? '待审核' : comment.status === 'approved' ? '已通过' : '已拒绝'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comment.createdAt}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {comment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleCommentAction(comment.id, 'approved')}
                              className="text-green-600 hover:text-green-900 mr-4"
                            >
                              通过
                            </button>
                            <button
                              onClick={() => handleCommentAction(comment.id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                            >
                              拒绝
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}