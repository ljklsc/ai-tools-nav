import { supabase } from './supabase';

// 定义数据类型
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at?: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  logo?: string;
  category_id: string;
  category?: Category;
  is_free: boolean;
  rating: number;
  url: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

// API 响应类型
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * 获取所有分类
 */
export async function getCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('获取分类失败:', error);
      return { data: null, error: error.message };
    }

    return { data: data || [], error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知错误';
    console.error('获取分类异常:', err);
    return { data: null, error: errorMessage };
  }
}

/**
 * 获取所有工具
 */
export async function getTools(): Promise<ApiResponse<Tool[]>> {
  try {
    const { data, error } = await supabase
      .from('tools')
      .select(`
        *,
        category:categories(
          id,
          name,
          description,
          icon
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取工具失败:', error);
      return { data: null, error: error.message };
    }

    return { data: data || [], error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知错误';
    console.error('获取工具异常:', err);
    return { data: null, error: errorMessage };
  }
}

/**
 * 根据分类筛选工具
 * @param categoryId 分类ID
 */
export async function getToolsByCategory(categoryId: string): Promise<ApiResponse<Tool[]>> {
  try {
    const { data, error } = await supabase
      .from('tools')
      .select(`
        *,
        category:categories(
          id,
          name,
          description,
          icon
        )
      `)
      .eq('category_id', categoryId)
      .order('rating', { ascending: false });

    if (error) {
      console.error('根据分类获取工具失败:', error);
      return { data: null, error: error.message };
    }

    return { data: data || [], error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知错误';
    console.error('根据分类获取工具异常:', err);
    return { data: null, error: errorMessage };
  }
}

/**
 * 搜索工具
 * @param keyword 搜索关键词
 */
export async function searchTools(keyword: string): Promise<ApiResponse<Tool[]>> {
  try {
    if (!keyword.trim()) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('tools')
      .select(`
        *,
        category:categories(
          id,
          name,
          description,
          icon
        )
      `)
      .or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`)
      .order('rating', { ascending: false });

    if (error) {
      console.error('搜索工具失败:', error);
      return { data: null, error: error.message };
    }

    return { data: data || [], error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知错误';
    console.error('搜索工具异常:', err);
    return { data: null, error: errorMessage };
  }
}

/**
 * 获取热门工具（评分最高的工具）
 * @param limit 限制数量，默认10个
 */
export async function getPopularTools(limit: number = 10): Promise<ApiResponse<Tool[]>> {
  try {
    const { data, error } = await supabase
      .from('tools')
      .select(`
        *,
        category:categories(
          id,
          name,
          description,
          icon
        )
      `)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('获取热门工具失败:', error);
      return { data: null, error: error.message };
    }

    return { data: data || [], error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知错误';
    console.error('获取热门工具异常:', err);
    return { data: null, error: errorMessage };
  }
}

/**
 * 获取免费工具
 */
export async function getFreeTools(): Promise<ApiResponse<Tool[]>> {
  try {
    const { data, error } = await supabase
      .from('tools')
      .select(`
        *,
        category:categories(
          id,
          name,
          description,
          icon
        )
      `)
      .eq('is_free', true)
      .order('rating', { ascending: false });

    if (error) {
      console.error('获取免费工具失败:', error);
      return { data: null, error: error.message };
    }

    return { data: data || [], error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知错误';
    console.error('获取免费工具异常:', err);
    return { data: null, error: errorMessage };
  }
}

/**
 * 管理员专用 - 创建新工具
 */
export async function createTool(tool: Omit<Tool, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Tool>> {
  try {
    const { data, error } = await supabase
      .from('tools')
      .insert({
        name: tool.name,
        description: tool.description,
        logo: tool.logo,
        category_id: tool.category_id,
        is_free: tool.is_free,
        rating: tool.rating,
        url: tool.url,
        tags: tool.tags
      })
      .select(`
        *,
        category:categories(
          id,
          name,
          description,
          icon
        )
      `)
      .single();

    if (error) {
      console.error('创建工具失败:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知错误';
    console.error('创建工具异常:', err);
    return { data: null, error: errorMessage };
  }
}

/**
 * 管理员专用 - 更新工具
 */
export async function updateTool(id: string, updates: Partial<Omit<Tool, 'id' | 'created_at'>>): Promise<ApiResponse<Tool>> {
  try {
    const { data, error } = await supabase
      .from('tools')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        category:categories(
          id,
          name,
          description,
          icon
        )
      `)
      .single();

    if (error) {
      console.error('更新工具失败:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知错误';
    console.error('更新工具异常:', err);
    return { data: null, error: errorMessage };
  }
}

/**
 * 管理员专用 - 删除工具
 */
export async function deleteTool(id: string): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('tools')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除工具失败:', error);
      return { data: null, error: error.message };
    }

    return { data: true, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知错误';
    console.error('删除工具异常:', err);
    return { data: null, error: errorMessage };
  }
}

/**
 * 管理员专用 - 创建新分类
 */
export async function createCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<ApiResponse<Category>> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        description: category.description,
        icon: category.icon
      })
      .select()
      .single();

    if (error) {
      console.error('创建分类失败:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知错误';
    console.error('创建分类异常:', err);
    return { data: null, error: errorMessage };
  }
}

/**
 * 管理员专用 - 更新分类
 */
export async function updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'created_at'>>): Promise<ApiResponse<Category>> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新分类失败:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知错误';
    console.error('更新分类异常:', err);
    return { data: null, error: errorMessage };
  }
}

/**
 * 管理员专用 - 删除分类
 */
export async function deleteCategory(id: string): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除分类失败:', error);
      return { data: null, error: error.message };
    }

    return { data: true, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知错误';
    console.error('删除分类异常:', err);
    return { data: null, error: errorMessage };
  }
}

/**
 * 获取统计数据
 */
export async function getStats(): Promise<ApiResponse<{
  totalTools: number;
  totalCategories: number;
  totalViews: number;
}>> {
  try {
    const [toolsResult, categoriesResult] = await Promise.all([
      supabase.from('tools').select('id', { count: 'exact', head: true }),
      supabase.from('categories').select('id', { count: 'exact', head: true })
    ]);

    if (toolsResult.error || categoriesResult.error) {
      return { 
        data: null, 
        error: toolsResult.error?.message || categoriesResult.error?.message || '获取统计失败' 
      };
    }

    return {
      data: {
        totalTools: toolsResult.count || 0,
        totalCategories: categoriesResult.count || 0,
        totalViews: 0 // 如果有访问统计表可以从那里获取
      },
      error: null
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知错误';
    console.error('获取统计异常:', err);
    return { data: null, error: errorMessage };
  }
}

// 收藏相关接口
export interface Favorite {
  id: string;
  user_id: string;
  tool_id: string;
  tool?: Tool;
  created_at: string;
}

/**
 * 获取用户收藏的工具
 */
export async function getFavoriteTools(): Promise<ApiResponse<Tool[]>> {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        tool:tools(
          *,
          category:categories(
            id,
            name,
            description,
            icon
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取收藏工具失败:', error);
      return { data: null, error: error.message };
    }

    // 提取工具数据
    const tools = data?.map(fav => fav.tool).filter(Boolean) || [];
    return { data: tools, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知错误';
    console.error('获取收藏工具异常:', err);
    return { data: null, error: errorMessage };
  }
}

/**
 * 添加工具到收藏
 * @param toolId 工具ID
 */
export async function addToFavorites(toolId: string): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('favorites')
      .insert({ tool_id: toolId });

    if (error) {
      console.error('添加收藏失败:', error);
      return { data: null, error: error.message };
    }

    return { data: true, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知错误';
    console.error('添加收藏异常:', err);
    return { data: null, error: errorMessage };
  }
}

/**
 * 从收藏中移除工具
 * @param toolId 工具ID
 */
export async function removeFromFavorites(toolId: string): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('tool_id', toolId);

    if (error) {
      console.error('移除收藏失败:', error);
      return { data: null, error: error.message };
    }

    return { data: true, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知错误';
    console.error('移除收藏异常:', err);
    return { data: null, error: errorMessage };
  }
}

/**
 * 检查工具是否已收藏
 * @param toolId 工具ID
 */
export async function isFavorited(toolId: string): Promise<ApiResponse<boolean>> {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('tool_id', toolId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 是没有找到记录的错误码
      console.error('检查收藏状态失败:', error);
      return { data: null, error: error.message };
    }

    return { data: !!data, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知错误';
    console.error('检查收藏状态异常:', err);
    return { data: null, error: errorMessage };
  }
}

// 添加分页和缓存支持
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface ToolsResponse {
  data: Tool[];
  total: number;
  page: number;
  limit: number;
}

// 缓存配置
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存
const cache = new Map<string, { data: any; timestamp: number }>();

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCachedData<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// 优化的工具获取函数
export async function getToolsPaginated(
  options: PaginationOptions = {}
): Promise<ApiResponse<ToolsResponse>> {
  const { page = 1, limit = 20 } = options;
  const cacheKey = `tools_${page}_${limit}`;
  
  // 检查缓存
  const cached = getCachedData<ToolsResponse>(cacheKey);
  if (cached) {
    return { data: cached, error: null };
  }

  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('tools')
      .select(`
        *,
        category:categories(
          id,
          name,
          icon
        )
      `, { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取工具失败:', error);
      return { data: null, error: error.message };
    }

    const result: ToolsResponse = {
      data: data || [],
      total: count || 0,
      page,
      limit
    };

    // 缓存结果
    setCachedData(cacheKey, result);
    
    return { data: result, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知错误';
    console.error('获取工具异常:', err);
    return { data: null, error: errorMessage };
  }
}

// 优化分类获取
export async function getCategoriesOptimized(): Promise<ApiResponse<Category[]>> {
  const cacheKey = 'categories';
  
  // 检查缓存
  const cached = getCachedData<Category[]>(cacheKey);
  if (cached) {
    return { data: cached, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, icon')
      .order('name', { ascending: true });

    if (error) {
      console.error('获取分类失败:', error);
      return { data: null, error: error.message };
    }

    // 缓存结果
    setCachedData(cacheKey, data || []);
    
    return { data: data || [], error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知错误';
    console.error('获取分类异常:', err);
    return { data: null, error: errorMessage };
  }
}