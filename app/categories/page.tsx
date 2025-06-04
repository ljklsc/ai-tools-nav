'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Star, ExternalLink, ArrowLeft } from 'lucide-react'
import MouQiLogo from '@/components/MouQiLogo'
import ToolCard from '@/components/ToolCard'

// 模拟数据 - 与主页保持一致
const categories = [
  { id: 1, name: '文本生成', icon: '✍️', count: 25 },
  { id: 2, name: '图像生成', icon: '🎨', count: 18 },
  { id: 3, name: '代码助手', icon: '💻', count: 12 },
  { id: 4, name: '语音合成', icon: '🎵', count: 8 },
  { id: 5, name: '数据分析', icon: '📊', count: 15 },
  { id: 6, name: '翻译工具', icon: '🌐', count: 10 },
]

const tools = [
  {
    id: 1,
    name: 'ChatGPT',
    description: '强大的对话式AI助手，支持文本生成、问答、编程等多种任务',
    category: '文本生成',
    isFree: false,
    rating: 4.8,
    image: '/next.svg',
    url: 'https://chat.openai.com'
  },
  {
    id: 2,
    name: 'Midjourney',
    description: '顶级AI图像生成工具，创造令人惊艳的艺术作品',
    category: '图像生成',
    isFree: false,
    rating: 4.9,
    image: '/next.svg',
    url: 'https://midjourney.com'
  },
  {
    id: 3,
    name: 'GitHub Copilot',
    description: 'AI代码助手，提供智能代码补全和建议',
    category: '代码助手',
    isFree: false,
    rating: 4.7,
    image: '/next.svg',
    url: 'https://github.com/features/copilot'
  },
  {
    id: 4,
    name: 'Claude',
    description: 'Anthropic开发的AI助手，擅长分析、写作和编程',
    category: '文本生成',
    isFree: true,
    rating: 4.6,
    image: '/next.svg',
    url: 'https://claude.ai'
  },
  {
    id: 5,
    name: 'DALL-E 3',
    description: 'OpenAI的图像生成模型，创造高质量的AI艺术',
    category: '图像生成',
    isFree: false,
    rating: 4.5,
    image: '/next.svg',
    url: 'https://openai.com/dall-e-3'
  },
  {
    id: 6,
    name: 'Cursor',
    description: 'AI驱动的代码编辑器，提升编程效率',
    category: '代码助手',
    isFree: true,
    rating: 4.4,
    image: '/next.svg',
    url: 'https://cursor.sh'
  }
]

export default function CategoriesPage() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [filteredTools, setFilteredTools] = useState(tools)

  useEffect(() => {
    // 从URL参数获取筛选条件
    const filterParam = searchParams.get('filter')
    if (filterParam) {
      setSelectedCategory(filterParam)
    }
  }, [searchParams])

  useEffect(() => {
    let filtered = tools

    // 按分类筛选
    if (selectedCategory !== '全部') {
      filtered = filtered.filter(tool => tool.category === selectedCategory)
    }

    // 按搜索词筛选
    if (searchTerm) {
      filtered = filtered.filter(tool => 
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredTools(filtered)
  }, [selectedCategory, searchTerm])

  const currentCategory = categories.find(cat => cat.name === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <MouQiLogo showText={true} size="sm" />
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  首页
                </a>
                <a href="/categories" className="text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  分类
                </a>
                <a href="/favorites" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  收藏
                </a>
                <a href="/about" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  关于
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按钮和标题 */}
        <div className="mb-8">
          <a href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回首页
          </a>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {selectedCategory === '全部' ? '浏览分类' : `${currentCategory?.icon} ${selectedCategory}`}
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {selectedCategory === '全部' 
                ? '选择您感兴趣的AI工具分类' 
                : `发现最好的${selectedCategory}工具`
              }
            </p>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="搜索AI工具..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 分类筛选 */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCategory('全部')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === '全部'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              全部
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
                  selectedCategory === category.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
                <span className="ml-2 text-xs opacity-75">({category.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* 工具列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard 
              key={tool.id}
              id={tool.id.toString()}
              name={tool.name}
              description={tool.description}
              logo={tool.image}
              category={tool.category}
              isFree={tool.isFree}
              rating={tool.rating || 0}
              url={tool.url}
            />
          ))}
        </div>

        {/* 无结果提示 */}
        {filteredTools.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关工具</h3>
            <p className="text-gray-600">尝试调整搜索条件或选择其他分类</p>
          </div>
        )}
      </div>
    </div>
  )
}