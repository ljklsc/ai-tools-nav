'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import ToolCard from './ToolCard'
import { Tool } from '@/lib/api'

interface VirtualizedToolGridProps {
  tools: Tool[]
  onLoadMore: () => void
  hasMore: boolean
  loading: boolean
  favoriteTools: Set<string>  // Missing!
  onToggleFavorite: (toolId: string, isFavorited: boolean) => void  // Missing!
}

const VirtualizedToolGrid: React.FC<VirtualizedToolGridProps> = ({
  tools,
  onLoadMore,
  hasMore,
  loading,
  favoriteTools,  // Add this
  onToggleFavorite  // Add this
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // 无限滚动
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries
      if (target.isIntersecting && hasMore && !loading) {
        onLoadMore()
      }
    },
    [hasMore, loading, onLoadMore]
  )

  useEffect(() => {
    const element = loadMoreRef.current
    if (!element) return

    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    })

    observerRef.current.observe(element)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [handleObserver])

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          // 在渲染ToolCard时传递收藏相关props
          <ToolCard
            key={tool.id}
            id={tool.id}
            name={tool.name}
            description={tool.description}
            logo={tool.logo}
            category={tool.category?.name || '未分类'}
            isFree={tool.is_free}
            rating={tool.rating}
            url={tool.url}
            isFavorited={favoriteTools.has(tool.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
      
      {/* 加载更多触发器 */}
      <div ref={loadMoreRef} className="h-10 flex items-center justify-center mt-8">
        {loading && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">加载中...</span>
          </div>
        )}
      </div>
    </>
  )
}

export default VirtualizedToolGrid