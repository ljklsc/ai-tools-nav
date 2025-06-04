'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Menu, X, Mail, Github, Twitter, Globe, Target, Users, Zap, Shield } from 'lucide-react'
import MouQiLogo from '@/components/MouQiLogo'

const features = [
  {
    icon: <Target className="w-8 h-8 text-blue-600" />,
    title: '精准分类',
    description: '按功能精心分类，快速找到适合您需求的AI工具'
  },
  {
    icon: <Users className="w-8 h-8 text-purple-600" />,
    title: '用户友好',
    description: '简洁直观的界面设计，提供最佳的用户体验'
  },
  {
    icon: <Zap className="w-8 h-8 text-yellow-600" />,
    title: '实时更新',
    description: '持续收录最新最热门的AI工具，保持内容新鲜'
  },
  {
    icon: <Shield className="w-8 h-8 text-green-600" />,
    title: '安全可靠',
    description: '严格筛选优质工具，确保推荐内容的质量和安全性'
  }
]

const team = [
  {
    name: 'MouQi Team',
    role: '产品团队',
    description: '致力于为用户提供最优质的AI工具发现体验',
    avatar: '🚀'
  }
]

export default function About() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleAdminLogin = () => {
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 导航栏 */}
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
                <a href="/favorites" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  收藏
                </a>
                <a href="/about" className="text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
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
              <a href="/favorites" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                收藏
              </a>
              <a href="/about" className="text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
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

      {/* 页面内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 关于我们 */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <MouQiLogo size="lg" showText={false} className="animate-pulse" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            关于
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              MouQi
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            MouQi 是一个专业的AI工具发现平台，致力于为用户提供最全面、最优质的人工智能工具导航服务。
            我们精心收录和分类全球优秀的AI应用，帮助用户快速找到适合自己需求的智能解决方案。
          </p>
        </div>

        {/* 我们的使命 */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 mb-16 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">我们的使命</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              让每个人都能轻松发现和使用最适合的AI工具，提升工作效率和创作能力，
              推动人工智能技术在各个领域的普及和应用。
            </p>
          </div>
        </div>

        {/* 核心特色 */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">核心特色</h2>
            <p className="text-lg text-gray-600">为什么选择 MouQi</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 数据统计 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-16 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">平台数据</h2>
            <p className="text-blue-100">持续增长的AI工具生态</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">200+</div>
              <div className="text-blue-100">AI工具</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-100">工具分类</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-blue-100">用户访问</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">每日</div>
              <div className="text-blue-100">内容更新</div>
            </div>
          </div>
        </div>

        {/* 团队介绍 */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">团队介绍</h2>
            <p className="text-lg text-gray-600">专业的团队，专注的服务</p>
          </div>
          
          <div className="flex justify-center">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-md text-center max-w-sm">
                <div className="text-6xl mb-4">{member.avatar}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 联系我们 */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">联系我们</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            如果您有任何建议、合作意向或发现了优秀的AI工具，欢迎与我们联系。
            我们期待与您一起推动AI工具生态的发展。
          </p>
          
          <div className="flex justify-center space-x-6">
            <a
              href="mailto:contact@mouqi.com"
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>邮箱联系</span>
            </a>
            <a
              href="https://mouqi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Globe className="w-5 h-5" />
              <span>官方网站</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}