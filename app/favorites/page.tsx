'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Star, ExternalLink, User, Menu, X, Heart, Trash2, Loader2 } from 'lucide-react'
import MouQiLogo from '@/components/MouQiLogo'
import { Tool } from '@/lib/api'

// 模拟收藏的工具数据
const favoriteTools = [
  {
    id: 1,
    name: 'ChatGPT',
    description: '强大的对话式AI助手，支持文本生成、问答、编程等多种任务',
    category: '文本生成',
    isFree: false,
    rating: 4.8,
    url: 'https://chat.openai.com',
    addedDate: '2024-01-15'
  },
  {
    id: 2,
    name: 'Midjourney',
    description: '顶级AI图像生成工具，创造令人惊艳的艺术作品',
    category: '图像生成',
    isFree: false,
    rating: 4.9,
    url: 'https://midjourney.com',
    addedDate: '2024-01-10'
  },
  {
    id: 3,
    name: 'DeepL',
    description: '高质量AI翻译工具，支持多种语言',
    category: '翻译工具',
    isFree: true,
    rating: 4.8,
    url: 'https://deepl.com',
    addedDate: '2024-01-08'
  }
]

export default function Favorites() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [favorites, setFavorites] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // 获取收藏列表
  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/favorites')
      const result = await response.json()
      
      if (result.success) {
        setFavorites(result.data || [])
      } else {
        setError(result.error || '获取收藏列表失败')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = () => {
    router.push('/admin/login')
  }

  const removeFavorite = async (toolId: string) => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ toolId }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setFavorites(favorites.filter(tool => tool.id !== toolId))
      } else {
        alert('移除收藏失败：' + result.error)
      }
    } catch (err) {
      alert('网络错误，请稍后重试')
    }
  }

  const filteredFavorites = favorites.filter(tool =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tool.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">加载收藏列表中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <X className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">加载失败</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchFavorites}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 导航栏 - 保持原有代码 */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <a href="/">
                  <MouQiLogo size="md" showText={true} />
                </a>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  首页
                </a>
                <a href="/categories" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  分类
                </a>
                <a href="/favorites" className="text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  收藏
                </a>
                <a href="/about" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  关于
                </a>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={handleAdminLogin}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
              >
                <User className="w-4 h-4" />
                <span>管理员登录</span>
              </button>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600 p-2 rounded-md transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="/" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                首页
              </a>
              <a href="/categories" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                分类
              </a>
              <a href="/favorites" className="text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                收藏
              </a>
              <a href="/about" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                关于
              </a>
              <button
                onClick={handleAdminLogin}
                className="w-full text-left bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded-md text-base font-medium transition-all duration-200 flex items-center space-x-2 mt-2"
              >
                <User className="w-4 h-4" />
                <span>管理员登录</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 页面头部 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-pink-500 to-red-500 p-4 rounded-full">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            我的
            <span className="bg-gradient-to-r from-pink-600 via-red-600 to-orange-600 bg-clip-text text-transparent">
              收藏
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            管理您收藏的AI工具，随时访问您最喜爱的应用
          </p>
          
          {/* 搜索栏 */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="搜索收藏的工具..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white/80 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* 收藏统计 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 shadow-md text-center">
            <div className="text-3xl font-bold text-pink-600 mb-2">{favorites.length}</div>
            <div className="text-gray-600">收藏工具</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 shadow-md text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {new Set(favorites.map(tool => tool.category?.name).filter(Boolean)).size}
            </div>
            <div className="text-gray-600">涉及分类</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 shadow-md text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {favorites.filter(tool => tool.is_free).length}
            </div>
            <div className="text-gray-600">免费工具</div>
          </div>
        </div>

        {/* 收藏工具列表 */}
        {filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((tool) => (
              <div
                key={tool.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        {tool.logo ? (
                          <img src={tool.logo} alt={tool.name} className="w-8 h-8 rounded" />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {tool.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {tool.name}
                        </h3>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          tool.is_free 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {tool.is_free ? '免费' : '付费'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFavorite(tool.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="取消收藏"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {tool.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(tool.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-1">
                        {tool.rating}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      收藏于 {new Date(tool.created_at || '').toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {tool.category?.name || '未分类'}
                    </span>
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                    >
                      <span>访问</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Heart className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {favorites.length === 0 ? '还没有收藏任何工具' : '未找到相关工具'}
            </h3>
            <p className="text-gray-600 mb-6">
              {favorites.length === 0 
                ? '去首页发现您喜欢的AI工具并添加到收藏吧' 
                : '尝试调整搜索关键词'}
            </p>
            {favorites.length === 0 && (
              <a
                href="/"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                <span>浏览工具</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}