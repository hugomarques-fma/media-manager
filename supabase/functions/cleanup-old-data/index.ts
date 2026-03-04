import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

// Validate environment variables
function validateEnvVars(): { valid: boolean; error?: string } {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    return { valid: false, error: "Missing Supabase environment variables" };
  }

  return { valid: true };
}

const envValidation = validateEnvVars();
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
  const BATCH_SIZE = 1000;

  try {
    console.log("[cleanup-old-data] Starting cleanup operation");

    // Archive old unread notifications (older than 30 days) - process in batches
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let offset = 0;
    let hasMore = true;
    while (hasMore) {
      const { data: oldNotifications, error: notifError } = await supabase
        .from("notifications")
        .select("id")
        .eq("read", false)
        .lt("created_at", thirtyDaysAgo.toISOString())
        .range(offset, offset + BATCH_SIZE - 1);

      if (notifError || !oldNotifications || oldNotifications.length === 0) {
        hasMore = false;
        if (notifError) {
          console.warn("[cleanup-old-data] Error fetching notifications for archival:", notifError);
        }
        break;
      }

      const idsToArchive = oldNotifications.map((n) => n.id);
      const { error: archiveError } = await supabase
        .from("notifications")
        .update({
          archived: true,
          archived_at: new Date().toISOString(),
        })
        .in("id", idsToArchive);

      if (!archiveError) {
        archivedNotifications += oldNotifications.length;
        console.log(
          `[cleanup-old-data] Archived ${oldNotifications.length} notifications (total: ${archivedNotifications})`
        );
      } else {
        console.warn("[cleanup-old-data] Error archiving notifications batch:", archiveError);
      }

      offset += BATCH_SIZE;
      hasMore = oldNotifications.length === BATCH_SIZE;
    }

    // Delete old audit events (older than 90 days) - process in batches
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    offset = 0;
    hasMore = true;
    while (hasMore) {
      const { data: oldAuditEvents, error: auditError } = await supabase
        .from("audit_events")
        .select("id")
        .lt("timestamp", ninetyDaysAgo.toISOString())
        .range(offset, offset + BATCH_SIZE - 1);

      if (auditError || !oldAuditEvents || oldAuditEvents.length === 0) {
        hasMore = false;
        if (auditError) {
          console.warn("[cleanup-old-data] Error fetching audit events for deletion:", auditError);
        }
        break;
      }

      const idsToDelete = oldAuditEvents.map((e) => e.id);
      const { error: deleteAuditError } = await supabase
        .from("audit_events")
        .delete()
        .in("id", idsToDelete);

      if (!deleteAuditError) {
        deletedAuditEvents += oldAuditEvents.length;
        console.log(
          `[cleanup-old-data] Deleted ${oldAuditEvents.length} audit events (total: ${deletedAuditEvents})`
        );
      } else {
        console.warn("[cleanup-old-data] Error deleting audit events batch:", deleteAuditError);
      }

      offset += BATCH_SIZE;
      hasMore = oldAuditEvents.length === BATCH_SIZE;
    }

    // Delete old completed action logs (older than 60 days) - process in batches
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    offset = 0;
    hasMore = true;
    while (hasMore) {
      const { data: oldActionLogs, error: actionError } = await supabase
        .from("action_logs")
        .select("id")
        .eq("status", "completed")
        .lt("completed_at", sixtyDaysAgo.toISOString())
        .range(offset, offset + BATCH_SIZE - 1);

      if (actionError || !oldActionLogs || oldActionLogs.length === 0) {
        hasMore = false;
        if (actionError) {
          console.warn("[cleanup-old-data] Error fetching action logs for deletion:", actionError);
        }
        break;
      }

      const idsToDelete = oldActionLogs.map((a) => a.id);
      const { error: deleteActionError } = await supabase
        .from("action_logs")
        .delete()
        .in("id", idsToDelete);

      if (!deleteActionError) {
        deletedActionLogs += oldActionLogs.length;
        console.log(
          `[cleanup-old-data] Deleted ${oldActionLogs.length} action logs (total: ${deletedActionLogs})`
        );
      } else {
        console.warn("[cleanup-old-data] Error deleting action logs batch:", deleteActionError);
      }

      offset += BATCH_SIZE;
      hasMore = oldActionLogs.length === BATCH_SIZE;
    }

    // Log cleanup operation
    console.log("[cleanup-old-data] Cleanup completed", {
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
    console.error("[cleanup-old-data] Cleanup error:", error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Validate env vars before proceeding
    if (!envValidation.valid) {
      console.error("Configuration error:", envValidation.error);
      return new Response(
        JSON.stringify({ error: envValidation.error, status: "configuration_error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await cleanupOldData();

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[cleanup-old-data] Function error:", error);
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
