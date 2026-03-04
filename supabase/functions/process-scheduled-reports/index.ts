import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ScheduledReport {
  id: string;
  account_id: string;
  name: string;
  type: string;
  frequency: string;
  scheduled_time: string;
  recipients: string[];
  filters?: Record<string, any>;
  enabled: boolean;
  last_run_at?: string;
}

function shouldRunReport(report: ScheduledReport): boolean {
  if (!report.enabled) return false;

  const now = new Date();
  const [hours, minutes] = report.scheduled_time.split(":").map(Number);

  // Check if current time matches scheduled time (within a 5-minute window)
  const scheduledDate = new Date(now);
  scheduledDate.setHours(hours, minutes, 0, 0);

  const timeDiff = Math.abs(now.getTime() - scheduledDate.getTime());
  const fiveMinutes = 5 * 60 * 1000;

  if (timeDiff > fiveMinutes) return false;

  // Check frequency
  const lastRun = report.last_run_at ? new Date(report.last_run_at) : null;

  if (!lastRun) return true;

  const hoursDiff = (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60);
  const daysDiff = hoursDiff / 24;

  switch (report.frequency) {
    case "daily":
      return daysDiff >= 1;
    case "weekly":
      return daysDiff >= 7;
    case "monthly":
      return daysDiff >= 30;
    default:
      return false;
  }
}

async function generateReportHTML(
  report: ScheduledReport,
  metrics: any[]
): Promise<string> {
  // Generate simple HTML report based on metrics
  const totalSpend = metrics.reduce((sum: number, m: any) => sum + (m.spend || 0), 0);
  const conversions = metrics.reduce((sum: number, m: any) => sum + (m.conversions || 0), 0);
  const roas = totalSpend > 0 ? (conversions * 50) / totalSpend : 0;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
        .metric { padding: 15px; background: #f8f9fa; border-radius: 4px; text-align: center; }
        .label { font-size: 12px; color: #666; margin-bottom: 5px; }
        .value { font-size: 24px; font-weight: bold; color: #333; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${report.name}</h1>
          <p>${new Date().toLocaleDateString()}</p>
        </div>
        <div class="content">
          <div class="metrics">
            <div class="metric">
              <div class="label">Total Spend</div>
              <div class="value">$${totalSpend.toLocaleString()}</div>
            </div>
            <div class="metric">
              <div class="label">Conversions</div>
              <div class="value">${conversions}</div>
            </div>
            <div class="metric">
              <div class="label">ROAS</div>
              <div class="value">${roas.toFixed(2)}x</div>
            </div>
          </div>
          <p style="text-align: center;">
            <a href="https://media-manager.local/dashboard" style="color: #007bff; text-decoration: none;">
              View Full Report →
            </a>
          </p>
        </div>
        <div class="footer">
          <p>Scheduled Report from media-manager</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function sendReport(report: ScheduledReport, htmlContent: string) {
  if (!resendApiKey || !report.recipients.length) return;

  try {
    for (const recipient of report.recipients) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "reports@media-manager.local",
          to: recipient,
          subject: `Scheduled Report: ${report.name}`,
          html: htmlContent,
        }),
      });
    }
  } catch (error) {
    console.error("Error sending report email:", error);
  }
}

async function processScheduledReports() {
  try {
    // Get all scheduled reports
    const { data: reports, error: reportsError } = await supabase
      .from("scheduled_reports")
      .select("*");

    if (reportsError || !reports) {
      console.error("Failed to fetch reports:", reportsError);
      return;
    }

    for (const report of reports) {
      if (!shouldRunReport(report as ScheduledReport)) continue;

      try {
        // Get metrics based on report type and filters
        const { data: metrics } = await supabase
          .from("campaign_metrics")
          .select("*")
          .eq("account_id", report.account_id)
          .gte("date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        // Generate HTML report
        const htmlContent = await generateReportHTML(report, metrics || []);

        // Send to recipients
        await sendReport(report as ScheduledReport, htmlContent);

        // Update last_run_at
        await supabase
          .from("scheduled_reports")
          .update({ last_run_at: new Date().toISOString() })
          .eq("id", report.id);

        console.log(`Report ${report.name} sent successfully`);
      } catch (error) {
        console.error(`Error processing report ${report.id}:`, error);
      }
    }
  } catch (error) {
    console.error("Report processing error:", error);
  }
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  await processScheduledReports();

  return new Response(
    JSON.stringify({ success: true, message: "Reports processed" }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    }
  );
});
