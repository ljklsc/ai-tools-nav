"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { getCategories, searchTools, getToolsByCategory, getTools } from '@/lib/api';
import type { Category, Tool } from '@/lib/api';
import ToolCard from './ToolCard';

// 组件 Props 类型定义
export interface SearchBarProps {
  onSearchResults?: (results: Tool[]) => void;
  placeholder?: string;
  className?: string;
  showResults?: boolean;
}

// 防抖 Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearchResults,
  placeholder = '搜索 AI 工具...',
  className = '',
  showResults = true,
}) => {
  // 状态管理
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchResults, setSearchResults] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // 防抖搜索词
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // 引用
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 加载分类数据
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setError('加载分类失败');
      }
    };

    loadCategories();
  }, []);

  // 执行搜索
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchTerm.trim() && selectedCategory === 'all') {
        setSearchResults([]);
        onSearchResults?.([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        let results: Tool[];
        
        if (debouncedSearchTerm.trim()) {
          // 如果有搜索词，执行搜索
          results = await searchTools(debouncedSearchTerm, selectedCategory !== 'all' ? selectedCategory : undefined);
        } else {
          // 如果只是选择了分类，获取该分类的工具
          results = await getToolsByCategory(selectedCategory);
        }

        setSearchResults(results);
        onSearchResults?.(results);
      } catch (err) {
        console.error('Search failed:', err);
        setError('搜索失败，请稍后重试');
        setSearchResults([]);
        onSearchResults?.([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm, selectedCategory, onSearchResults]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 清除搜索
  const clearSearch = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    inputRef.current?.focus();
  };

  // 选择分类
  const selectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsDropdownOpen(false);
  };

  // 获取当前选中分类的显示名称
  const getSelectedCategoryName = () => {
    if (selectedCategory === 'all') return '全部分类';
    const category = categories.find(cat => cat.id === selectedCategory);
    return category?.name || '全部分类';
  };

  return (
    <div ref={searchRef} className={`relative w-full max-w-4xl mx-auto ${className}`}>
      {/* 搜索输入区域 */}
      <div className="relative">
        {/* 主搜索框 */}
        <div className={`
          flex items-center bg-white border-2 rounded-xl transition-all duration-200
          ${isFocused ? 'border-blue-500 shadow-lg' : 'border-gray-200 shadow-sm'}
          ${error ? 'border-red-300' : ''}
        `}>
          {/* 搜索图标 */}
          <div className="pl-4 pr-2">
            <Search className={`w-5 h-5 transition-colors ${
              isFocused ? 'text-blue-500' : 'text-gray-400'
            }`} />
          </div>

          {/* 搜索输入框 */}
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className="
              flex-1 py-3 sm:py-4 px-2 text-base sm:text-lg bg-transparent 
              focus:outline-none placeholder-gray-400
            "
          />

          {/* 分类筛选按钮 */}
          <div className="hidden sm:flex items-center border-l border-gray-200">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="
                flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 
                hover:text-blue-600 transition-colors
              "
            >
              <Filter className="w-4 h-4" />
              <span className="max-w-24 truncate">{getSelectedCategoryName()}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`} />
            </button>
          </div>

          {/* 清除按钮 */}
          {(searchTerm || selectedCategory !== 'all') && (
            <button
              onClick={clearSearch}
              className="p-2 mr-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* 加载指示器 */}
          {isLoading && (
            <div className="p-2 mr-2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* 移动端分类筛选 */}
        <div className="sm:hidden mt-3">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="
              w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 
              rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors
            "
          >
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>{getSelectedCategoryName()}</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${
              isDropdownOpen ? 'rotate-180' : ''
            }`} />
          </button>
        </div>

        {/* 分类下拉菜单 */}
        {isDropdownOpen && (
          <div className="
            absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl 
            shadow-lg z-50 max-h-64 overflow-y-auto
          ">
            <div className="p-2">
              <button
                onClick={() => selectCategory('all')}
                className={`
                  w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                  ${selectedCategory === 'all' 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                全部分类
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => selectCategory(category.id)}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between
                    ${selectedCategory === category.id 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-gray-500">{category.toolCount || 0}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 搜索结果 */}
      {showResults && searchResults.length > 0 && (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              搜索结果 ({searchResults.length})
            </h3>
            {searchTerm && (
              <p className="text-sm text-gray-600">
                关键词: <span className="font-medium">"{searchTerm}"</span>
              </p>
            )}
          </div>
          
          {/* 响应式网格布局 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {searchResults.map((tool) => (
              <ToolCard
                key={tool.id}
                id={tool.id}
                name={tool.name}
                description={tool.description}
                logo={tool.logo}
                category={tool.category}
                isFree={tool.isFree}
                rating={tool.rating}
                url={tool.url}
              />
            ))}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {showResults && searchResults.length === 0 && (searchTerm || selectedCategory !== 'all') && !isLoading && (
        <div className="mt-6 text-center py-8">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关工具</h3>
          <p className="text-gray-600 mb-4">尝试调整搜索关键词或选择其他分类</p>
          <button
            onClick={clearSearch}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            清除筛选条件
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;