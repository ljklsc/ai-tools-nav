'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Star, ExternalLink, ArrowLeft, Heart, Share2, Menu, X, ChevronDown, User } from 'lucide-react'
import Image from 'next/image'
import MouQiLogo from '@/components/MouQiLogo'
import { getCategories, Category } from '@/lib/api'

interface Tool {
  id: string
  name: string
  description: string
  logo?: string
  category: string
  isFree: boolean
  rating: number
  url: string
  longDescription?: string
  features?: string[]
  screenshots?: string[]
  tags?: string[]
  reviews?: Review[]
}

interface Review {
  id: string
  user: string
  rating: number
  comment: string
  date: string
}

export default function ToolDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [tool, setTool] = useState<Tool | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  
  // 添加导航相关状态
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  // 获取分类数据
  useEffect(() => {
    const fetchCategories = async () => {
      const result = await getCategories()
      if (result.data) {
        setCategories(result.data)
      }
    }
    fetchCategories()
  }, [])

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

  useEffect(() => {
    const fetchTool = async () => {
      try {
        // 从API获取工具详情
        const response = await fetch(`/api/tools/${params.id}`);
        if (response.ok) {
          const toolData = await response.json();
          setTool(toolData.data);
        } else {
          // 如果API调用失败，使用模拟数据
          const mockTool: Tool = {
            id: params.id as string,
            name: 'ChatGPT',
            description: '强大的对话式AI助手，支持文本生成、问答、编程等多种任务',
            longDescription: 'ChatGPT是由OpenAI开发的大型语言模型，基于GPT架构。它能够理解和生成人类语言，在多个领域提供帮助，包括写作、编程、分析、创意等。',
            logo: '/next.svg',
            category: '文本生成',
            isFree: false,
            rating: 4.8,
            url: 'https://chat.openai.com',
            features: [
              '自然语言对话',
              '代码生成与调试',
              '文本创作与编辑',
              '多语言翻译',
              '数据分析与解释'
            ],
            tags: ['AI', '聊天机器人', '文本生成', '编程助手'],
            reviews: [
              {
                id: '1',
                user: '张三',
                rating: 5,
                comment: '非常好用的AI工具，回答准确，响应快速！',
                date: '2024-01-15'
              },
              {
                id: '2',
                user: '李四',
                rating: 4,
                comment: '功能强大，但有时候回答会有些冗长。',
                date: '2024-01-10'
              }
            ]
          }
          
          setTool(mockTool)
        }
      } catch (error) {
        console.error('获取工具详情失败:', error)
        // 使用模拟数据作为后备
      } finally {
        setLoading(false)
      }
    }

    fetchTool()
  }, [params.id])

  // 添加收藏状态检查的useEffect
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (tool?.id) {
        try {
          const response = await fetch(`/api/favorites/check?toolId=${tool.id}`)
          const result = await response.json()
          if (result.success) {
            setIsFavorite(result.data)
          }
        } catch (error) {
          console.error('检查收藏状态失败:', error)
        }
      }
    }
    
    checkFavoriteStatus()
  }, [tool?.id])
  
  // 收藏按钮的点击处理函数
  const handleToggleFavorite = async () => {
    if (!tool?.id) return
    
    try {
      const method = isFavorite ? 'DELETE' : 'POST'
      const response = await fetch('/api/favorites', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ toolId: tool.id }),
      })
      
      const result = await response.json()
      if (result.success) {
        setIsFavorite(!isFavorite)
      } else {
        alert(result.error || '操作失败')
      }
    } catch (error) {
      alert('网络错误，请稍后重试')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">工具未找到</h1>
          <p className="text-gray-600 mb-4">抱歉，您访问的工具不存在</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 导航栏 - 与主页面保持一致 */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/')}>
              <MouQiLogo className="w-8 h-8" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI工具导航
              </span>
            </div>
            
            {/* 桌面端导航 */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
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
                      <a
                        href="/"
                        className="block w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700"
                      >
                        <span>全部分类</span>
                      </a>
                      
                      {categories.map((category) => (
                        <a
                          key={category.id}
                          href={`/categories/${category.id}`}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700"
                        >
                          <div className="flex items-center space-x-2">
                            <span>{category.icon}</span>
                            <span>{category.name}</span>
                          </div>
                        </a>
                      ))}
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
                <a href="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-1">
                  首页
                </a>
                
                {/* 移动端分类菜单 */}
                <div className="px-2">
                  <div className="text-gray-700 font-medium py-1 mb-2">分类</div>
                  <div className="pl-4 space-y-2">
                    <a
                      href="/"
                      className="block w-full text-left py-1 text-sm text-gray-600"
                    >
                      全部分类
                    </a>
                    {categories.map((category) => (
                      <a
                        key={category.id}
                        href={`/categories/${category.id}`}
                        className="block w-full text-left py-1 text-sm text-gray-600 flex items-center space-x-2"
                      >
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </a>
                    ))}
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
                  className="text-left text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-1 flex items-center space-x-1"
                >
                  <User className="w-4 h-4" />
                  <span>管理</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* 面包屑导航 */}
      <div className="bg-white/50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <a href="/" className="hover:text-blue-600 transition-colors">首页</a>
            <span>/</span>
            <span className="text-gray-900">{tool?.name || '工具详情'}</span>
          </div>
        </div>
      </div>

      {/* 主要内容 - 移除原来的简单导航，保持现有的内容布局 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧主要信息 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 工具基本信息 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center border border-gray-100">
                  {tool.logo ? (
                    <Image
                      src={tool.logo}
                      alt={`${tool.name} logo`}
                      width={48}
                      height={48}
                      className="rounded-lg"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-blue-600">
                      {tool.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">{tool.name}</h1>
                      <p className="text-gray-600 mb-3">{tool.description}</p>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(tool.rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-1">
                            {tool.rating} 分
                          </span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          tool.isFree 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {tool.isFree ? '免费' : '付费'}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {tool.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        {/* 移除这里错误放置的useEffect和handleToggleFavorite */}
                        <button
                          onClick={handleToggleFavorite}
                          className={`p-2 rounded-lg transition-colors ${
                            isFavorite 
                              ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 详细描述 */}
            {tool.longDescription && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">详细介绍</h2>
                <p className="text-gray-700 leading-relaxed">{tool.longDescription}</p>
              </div>
            )}

            {/* 主要功能 */}
            {tool.features && tool.features.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">主要功能</h2>
                <ul className="space-y-2">
                  {tool.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 用户评价 */}
            {tool.reviews && tool.reviews.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">用户评价</h2>
                <div className="space-y-4">
                  {tool.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{review.user}</span>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右侧操作栏 */}
          <div className="space-y-6">
            {/* 访问工具 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 group"
              >
                <span>访问工具</span>
                <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* 标签 */}
            {tool.tags && tool.tags.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">相关标签</h3>
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}