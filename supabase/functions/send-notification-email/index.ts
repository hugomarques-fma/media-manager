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

// Retry helper with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(
        `[send-notification-email] Attempt ${attempt + 1} failed: ${lastError.message}. Retrying...`
      );

      if (attempt < maxRetries - 1) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

const envValidation = validateEnvVars();
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface NotificationPayload {
  notificationId: string;
  accountId: string;
  userId: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

async function sendNotificationEmail(payload: NotificationPayload) {
  if (!resendApiKey) {
    console.warn("[send-notification-email] RESEND_API_KEY not configured, skipping email");
    return;
  }

  try {
    // Get user email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(payload.userId);

    if (userError || !userData.user?.email) {
      console.error("[send-notification-email] Failed to get user email:", userError);
      return;
    }

    const userEmail = userData.user.email;

    // Prepare email content based on notification type
    let subject = payload.title;
    let htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${payload.title}</h2>
        <p style="color: #666; font-size: 16px;">${payload.message}</p>
        <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #007bff;">
          <strong>Priority:</strong> <span style="text-transform: capitalize;">${payload.priority}</span>
        </div>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999;">
          <p>This is an automated notification from media-manager. Please do not reply to this email.</p>
          <p><a href="https://media-manager.local/dashboard/notifications">View in Dashboard</a></p>
        </div>
      </div>
    `;

    // Send email via Resend with retry
    const response = await retryWithBackoff(() =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "notifications@media-manager.local",
          to: userEmail,
          subject: subject,
          html: htmlContent,
        }),
      })
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("[send-notification-email] Failed to send email:", error);
      throw new Error(`Resend API error: ${error.message}`);
    }

    console.log(`[send-notification-email] Email sent successfully to ${userEmail}`);
  } catch (error) {
    console.error("[send-notification-email] Error sending notification email:", error);
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

    const payload: NotificationPayload = await req.json();

    // Only send email for critical and high priority notifications
    if (payload.priority === "critical" || payload.priority === "high") {
      await sendNotificationEmail(payload);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification processed" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
