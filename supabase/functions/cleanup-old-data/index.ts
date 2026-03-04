import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CleanupResult {
  archivedNotifications: number;
  deletedAuditEvents: number;
  deletedActionLogs: number;
  duration: number;
}

async function cleanupOldData(): Promise<CleanupResult> {
  const startTime = Date.now();
  let archivedNotifications = 0;
  let deletedAuditEvents = 0;
  let deletedActionLogs = 0;

  try {
    // Archive old unread notifications (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: oldNotifications, error: notifError } = await supabase
      .from("notifications")
      .select("id")
      .eq("read", false)
      .lt("created_at", thirtyDaysAgo.toISOString());

    if (!notifError && oldNotifications && oldNotifications.length > 0) {
      const { error: archiveError } = await supabase
        .from("notifications")
        .update({
          archived: true,
          archived_at: new Date().toISOString(),
        })
        .lt("created_at", thirtyDaysAgo.toISOString())
        .eq("read", false);

      if (!archiveError) {
        archivedNotifications = oldNotifications.length;
      }
    }

    // Delete old audit events (older than 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: oldAuditEvents, error: auditError } = await supabase
      .from("audit_events")
      .select("id")
      .lt("timestamp", ninetyDaysAgo.toISOString());

    if (!auditError && oldAuditEvents && oldAuditEvents.length > 0) {
      const { error: deleteAuditError } = await supabase
        .from("audit_events")
        .delete()
        .lt("timestamp", ninetyDaysAgo.toISOString());

      if (!deleteAuditError) {
        deletedAuditEvents = oldAuditEvents.length;
      }
    }

    // Delete old completed action logs (older than 60 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const { data: oldActionLogs, error: actionError } = await supabase
      .from("action_logs")
      .select("id")
      .eq("status", "completed")
      .lt("completed_at", sixtyDaysAgo.toISOString());

    if (!actionError && oldActionLogs && oldActionLogs.length > 0) {
      const { error: deleteActionError } = await supabase
        .from("action_logs")
        .delete()
        .eq("status", "completed")
        .lt("completed_at", sixtyDaysAgo.toISOString());

      if (!deleteActionError) {
        deletedActionLogs = oldActionLogs.length;
      }
    }

    // Log cleanup operation
    console.log("Cleanup completed", {
      archivedNotifications,
      deletedAuditEvents,
      deletedActionLogs,
      timestamp: new Date().toISOString(),
    });

    return {
      archivedNotifications,
      deletedAuditEvents,
      deletedActionLogs,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error("Cleanup error:", error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const result = await cleanupOldData();

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({
        error: "Cleanup failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
