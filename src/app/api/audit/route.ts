import { createServerSupabaseClient } from '@/lib/supabase-server';
import { validatePaginationParams, validateAccountId } from '@/lib/validation';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const eventType = searchParams.get('eventType');
    const entityType = searchParams.get('entityType');

    // Validate pagination params
    const paginationValidation = validatePaginationParams(
      searchParams.get('limit'),
      searchParams.get('offset')
    );
    if (!paginationValidation.valid) {
      return NextResponse.json(
        { error: paginationValidation.error },
        { status: 400 }
      );
    }

    // Validate accountId format
    const accountIdValidation = validateAccountId(accountId);
    if (!accountIdValidation.valid) {
      return NextResponse.json(
        { error: accountIdValidation.error },
        { status: 400 }
      );
    }

    const { limit, offset } = paginationValidation;

    let query = supabase
      .from('audit_events')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (accountId) {
      query = query.eq('account_id', accountId);
    }

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Audit events fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch audit events' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      events: data,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Audit API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      accountId,
      entityType,
      entityId,
      eventType,
      changes,
      metadata,
    } = await request.json();

    // Validate required fields
    if (!accountId || !entityType || !entityId || !eventType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate accountId format
    const accountIdValidation = validateAccountId(accountId);
    if (!accountIdValidation.valid) {
      return NextResponse.json(
        { error: accountIdValidation.error },
        { status: 400 }
      );
    }

    // Create audit event
    const { data, error } = await supabase
      .from('audit_events')
      .insert({
        account_id: accountId,
        user_id: user.id,
        entity_type: entityType,
        entity_id: entityId,
        event_type: eventType,
        changes,
        metadata,
      })
      .select()
      .single();

    if (error) {
      console.error('Audit event creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create audit event' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Audit event creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
