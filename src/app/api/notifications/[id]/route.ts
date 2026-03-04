import { createServerSupabaseClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabaseClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { read, archived } = await request.json();

    // Build update object
    const updateData: any = {};
    if (read !== undefined) {
      updateData.read = read;
      if (read) {
        updateData.read_at = new Date().toISOString();
      }
    }
    if (archived !== undefined) {
      updateData.archived = archived;
      if (archived) {
        updateData.archived_at = new Date().toISOString();
      }
    }

    // Update notification
    const { data, error } = await supabase
      .from('notifications')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Notification update error:', error);
      return NextResponse.json(
        { error: 'Failed to update notification' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabaseClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Archive notification instead of deleting
    const { error } = await supabase
      .from('notifications')
      .update({
        archived: true,
        archived_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (error) {
      console.error('Notification archive error:', error);
      return NextResponse.json(
        { error: 'Failed to archive notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification archive error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
