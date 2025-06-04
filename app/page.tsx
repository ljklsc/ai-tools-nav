'use client';

import { useState, useEffect, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, Star, ExternalLink, User, Menu, X, ChevronDown } from 'lucide-react'
import MouQiLogo from '@/components/MouQiLogo'
import ToolCard from '@/components/ToolCard'
import VirtualizedToolGrid from '@/components/VirtualizedToolGrid'
import { getCategoriesOptimized, getToolsPaginated, Category, Tool } from '@/lib/api'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  
  // ADD THESE HOOKS HERE - INSIDE THE COMPONENT
  const [favoriteTools, setFavoriteTools] = useState<Set<string>>(new Set())
  
  const router = useRouter()
  
  // 获取收藏状态
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch('/api/favorites')
        const result = await response.json()
        if (result.success) {
          const favoriteIds = new Set(result.data.map((tool: Tool) => tool.id))
          setFavoriteTools(favoriteIds)
        }
      } catch (error) {
        console.error('获取收藏列表失败:', error)
      }
    }
    
    fetchFavorites()
  }, [])

  // 收藏切换处理函数
  const handleToggleFavorite = async (toolId: string, isFavorited: boolean) => {
    try {
      const method = isFavorited ? 'DELETE' : 'POST'
      const response = await fetch('/api/favorites', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ toolId }),
      })
      
      const result = await response.json()
      if (result.success) {
        const newFavorites = new Set(favoriteTools)
        if (isFavorited) {
          newFavorites.delete(toolId)
        } else {
          newFavorites.add(toolId)
        }
        setFavoriteTools(newFavorites)
      } else {
        alert(result.error || '操作失败')
      }
    } catch (error) {
      alert('网络错误，请稍后重试')
    }
  }

  // 使用 useMemo 优化过滤逻辑
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = searchTerm === '' || 
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === '全部' || 
                             (tool.category && tool.category.name === selectedCategory)
      return matchesSearch && matchesCategory
    })
  }, [tools, searchTerm, selectedCategory])

  // 使用 useMemo 优化分类统计
  const categoriesWithCount = useMemo(() => {
    return categories.map(category => ({
      ...category,
      count: tools.filter(tool => tool.category && tool.category.id === category.id).length
    }))
  }, [categories, tools])

  // 防抖搜索
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term)
    }, 300),
    []
  )

  // 初始数据加载
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        
        // 并行获取分类和第一页工具数据
        const [categoriesResult, toolsResult] = await Promise.all([
          getCategoriesOptimized(),
          getToolsPaginated({ page: 1, limit: 20 })
        ])
        
        if (categoriesResult.error) {
          console.error('获取分类失败:', categoriesResult.error)
        } else {
          setCategories(categoriesResult.data || [])
        }
        
        if (toolsResult.error) {
          console.error('获取工具失败:', toolsResult.error)
          setError(toolsResult.error)
        } else {
          const result = toolsResult.data!
          setTools(result.data)
          setHasMore(result.data.length === result.limit)
        }
      } catch (err) {
        console.error('获取数据异常:', err)
        setError('获取数据失败')
      } finally {
        setLoading(false)
      }
    }
    
    fetchInitialData()
  }, [])

  // 加载更多数据
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    
    try {
      setLoadingMore(true)
      const nextPage = page + 1
      const result = await getToolsPaginated({ page: nextPage, limit: 20 })
      
      if (result.data) {
        setTools(prev => [...prev, ...result.data!.data])
        setPage(nextPage)
        setHasMore(result.data.data.length === result.data.limit)
      }
    } catch (err) {
      console.error('加载更多失败:', err)
    } finally {
      setLoadingMore(false)
    }
  }, [page, loadingMore, hasMore])

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.dropdown-container')) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isDropdownOpen])
  
  const handleAdminLogin = () => {
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <ExternalLink className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">加载失败</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 导航栏 */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <MouQiLogo />
            </div>
            
            {/* 桌面端导航 */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                首页
              </a>
              
              {/* 分类下拉菜单 */}
              <div className="relative dropdown-container">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  <span>分类</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {/* 下拉菜单内容 */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="max-h-96 overflow-y-auto">
                      <button
                        onClick={() => {
                          setSelectedCategory('全部')
                          setIsDropdownOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center justify-between ${
                          selectedCategory === '全部' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        <span>全部分类</span>
                        <span className="text-sm text-gray-500">({tools.length})</span>
                      </button>
                      
                      {categories.map((category) => {
                        const count = tools.filter(tool => tool.category && tool.category.id === category.id).length
                        return (
                          <button
                            key={category.id}
                            onClick={() => {
                              setSelectedCategory(category.name)
                              setIsDropdownOpen(false)
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center justify-between ${
                              selectedCategory === category.name ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span>{category.icon}</span>
                              <span>{category.name}</span>
                            </div>
                            <span className="text-sm text-gray-500">({count})</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              <a href="/favorites" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                收藏
              </a>
              <a href="/about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                关于
              </a>
              <button 
                onClick={handleAdminLogin}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                <User className="w-4 h-4" />
                <span>管理</span>
              </button>
            </div>
            
            {/* 移动端菜单按钮 */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          {/* 移动端菜单 */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3">
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-1">
                  首页
                </a>
                
                {/* 移动端分类菜单 */}
                <div className="px-2">
                  <div className="text-gray-700 font-medium py-1 mb-2">分类</div>
                  <div className="pl-4 space-y-2">
                    <button
                      onClick={() => {
                        setSelectedCategory('全部')
                        setIsMobileMenuOpen(false)
                      }}
                      className={`block w-full text-left py-1 text-sm ${
                        selectedCategory === '全部' ? 'text-blue-600 font-medium' : 'text-gray-600'
                      }`}
                    >
                      全部分类 ({tools.length})
                    </button>
                    {categories.map((category) => {
                      const count = tools.filter(tool => tool.category && tool.category.id === category.id).length
                      return (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.name)
                            setIsMobileMenuOpen(false)
                          }}
                          className={`block w-full text-left py-1 text-sm flex items-center justify-between ${
                            selectedCategory === category.name ? 'text-blue-600 font-medium' : 'text-gray-600'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span>{category.icon}</span>
                            <span>{category.name}</span>
                          </div>
                          <span>({count})</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
                
                <a href="/favorites" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-1">
                  收藏
                </a>
                <a href="/about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-1">
                  关于
                </a>
                <button 
                  onClick={handleAdminLogin}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-1 text-left"
                >
                  <User className="w-4 h-4" />
                  <span>管理</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 头部区域 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            发现最好的
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI工具
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            精选优质AI工具，提升工作效率，释放创造力
          </p>
        </div>

        {/* 搜索栏 */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索AI工具..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm"
            />
          </div>
        </div>

        {/* 分类筛选 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory('全部')}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                selectedCategory === '全部'
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              全部 ({tools.length})
            </button>
            {categoriesWithCount.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 flex items-center space-x-2 ${
                  selectedCategory === category.name
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
                <span className="text-sm opacity-75">({category.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* 工具网格 - 使用虚拟化 */}
        {filteredTools.length > 0 ? (
          <VirtualizedToolGrid 
            tools={filteredTools}
            onLoadMore={loadMore}
            hasMore={hasMore}
            loading={loadingMore}
            favoriteTools={favoriteTools}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">未找到相关工具</h3>
            <p className="text-gray-600">尝试调整搜索关键词或选择其他分类</p>
          </div>
        )}
      </div>
    </div>
  )
}

// 防抖函数 - Keep this outside the component
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
