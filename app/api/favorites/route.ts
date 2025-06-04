import { NextRequest, NextResponse } from 'next/server';
import { getFavoriteTools, addToFavorites, removeFromFavorites } from '@/lib/api';

// 获取收藏列表
// 在现有的GET方法之外，添加检查单个工具收藏状态的功能
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const toolId = searchParams.get('toolId')
  
  if (toolId) {
    // 检查单个工具的收藏状态
    try {
      const { data, error } = await isFavorited(toolId)
      
      if (error) {
        return NextResponse.json(
          { success: false, error },
          { status: 500 }
        )
      }
      
      return NextResponse.json({ success: true, data })
    } catch (error) {
      return NextResponse.json(
        { success: false, error: '检查收藏状态失败' },
        { status: 500 }
      )
    }
  } else {
    // 原有的获取收藏列表逻辑
    try {
      const { data, error } = await getFavoriteTools()
      
      if (error) {
        return NextResponse.json(
          { success: false, error },
          { status: 500 }
        )
      }
      
      return NextResponse.json({ success: true, data })
    } catch (error) {
      return NextResponse.json(
        { success: false, error: '获取收藏列表失败' },
        { status: 500 }
      )
    }
  }
}

// 添加收藏
export async function POST(request: NextRequest) {
  try {
    const { toolId } = await request.json();
    
    if (!toolId) {
      return NextResponse.json(
        { success: false, error: '工具ID不能为空' },
        { status: 400 }
      );
    }
    
    const { data, error } = await addToFavorites(toolId);
    
    if (error) {
      return NextResponse.json(
        { success: false, error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '添加收藏失败' },
      { status: 500 }
    );
  }
}

// 移除收藏
export async function DELETE(request: NextRequest) {
  try {
    const { toolId } = await request.json();
    
    if (!toolId) {
      return NextResponse.json(
        { success: false, error: '工具ID不能为空' },
        { status: 400 }
      );
    }
    
    const { data, error } = await removeFromFavorites(toolId);
    
    if (error) {
      return NextResponse.json(
        { success: false, error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '移除收藏失败' },
      { status: 500 }
    );
  }
}