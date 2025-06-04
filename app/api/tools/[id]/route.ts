import { NextRequest, NextResponse } from 'next/server';
import { getTools } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: tools } = await getTools();
    const tool = tools?.find(t => t.id === params.id);
    
    if (!tool) {
      return NextResponse.json(
        { success: false, error: '工具未找到' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: tool });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取工具详情失败' },
      { status: 500 }
    );
  }
}