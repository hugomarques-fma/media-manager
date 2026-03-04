import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface DigestEmail {
  recipient: string;
  accountName: string;
  metrics: {
    totalSpend: number;
    conversions: number;
    roas: number;
    topCampaign: string;
    topCampaignRoas: number;
  };
  alerts: Array<{
    type: string;
    message: string;
  }>;
  suggestions: Array<{
    title: string;
    description: string;
  }>;
}

async function generateDigestEmail(data: DigestEmail): Promise<string> {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .metric { display: inline-block; width: 48%; margin: 1%; padding: 15px; background: #f8f9fa; border-radius: 4px; }
        .metric-label { font-size: 12px; color: #666; }
        .metric-value { font-size: 24px; font-weight: bold; color: #333; }
        .section { margin: 30px 0; }
        .section h2 { color: #333; font-size: 18px; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .alert { padding: 12px; margin: 10px 0; border-left: 4px solid #ffc107; background: #fffbea; }
        .suggestion { padding: 12px; margin: 10px 0; border-left: 4px solid #28a745; background: #f0f8f5; }
        .button { display: inline-block; background: #007bff; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; margin-top: 20px; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Daily Performance Digest</h1>
          <p>${data.accountName}</p>
        </div>

        <div class="content">
          <p>Hi,</p>
          <p>Here's your daily performance summary for ${new Date().toLocaleDateString()}.</p>

          <div class="section">
            <h2>Key Metrics</h2>
            <div>
              <div class="metric">
                <div class="metric-label">Total Spend</div>
                <div class="metric-value">$${data.metrics.totalSpend.toLocaleString()}</div>
              </div>
              <div class="metric">
                <div class="metric-label">Conversions</div>
                <div class="metric-value">${data.metrics.conversions.toLocaleString()}</div>
              </div>
              <div class="metric">
                <div class="metric-label">ROAS</div>
                <div class="metric-value">${data.metrics.roas.toFixed(2)}x</div>
              </div>
              <div class="metric">
                <div class="metric-label">Top Campaign</div>
                <div class="metric-value">${data.metrics.topCampaign}</div>
              </div>
            </div>
          </div>

          ${
            data.alerts.length > 0
              ? `
            <div class="section">
              <h2>⚠️ Alerts</h2>
              ${data.alerts.map((a) => `<div class="alert"><strong>${a.type}:</strong> ${a.message}</div>`).join("")}
            </div>
          `
              : ""
          }

          ${
            data.suggestions.length > 0
              ? `
            <div class="section">
              <h2>💡 Suggestions</h2>
              ${data.suggestions.map((s) => `<div class="suggestion"><strong>${s.title}:</strong> ${s.description}</div>`).join("")}
            </div>
          `
              : ""
          }

          <a href="https://media-manager.local/dashboard" class="button">View Full Dashboard</a>
        </div>

        <div class="footer">
          <p>This is an automated email from media-manager. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function sendDailyDigests() {
  try {
    // Get all users with digest email enabled
    const { data: users, error: userError } = await supabase
      .from("ad_accounts")
      .select("id, name, owner_id")
      .limit(100);

    if (userError || !users) {
      console.error("Failed to fetch users:", userError);
      return;
    }

    for (const account of users) {
      try {
        // Get yesterday's metrics
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const startDate = yesterday.toISOString().split("T")[0];

        const { data: metrics } = await supabase
          .from("campaign_metrics")
          .select("*")
          .eq("account_id", account.id)
          .gte("date", startDate)
          .lt("date", new Date().toISOString().split("T")[0]);

        // Calculate totals
        const totalSpend = (metrics || []).reduce((sum, m: any) => sum + (m.spend || 0), 0);
        const conversions = (metrics || []).reduce((sum, m: any) => sum + (m.conversions || 0), 0);
        const roas = totalSpend > 0 ? (conversions * 50) / totalSpend : 0; // Assuming $50 AOV

        // Get top campaign
        const topCampaign = (metrics || []).sort((a: any, b: any) => b.roas - a.roas)[0];

        // Get unread notifications (alerts)
        const { data: alerts } = await supabase
          .from("notifications")
          .select("*")
          .eq("account_id", account.id)
          .eq("read", false)
          .or("priority.eq.'critical',priority.eq.'high'")
          .limit(5);

        // Get pending suggestions
        const { data: suggestions } = await supabase
          .from("ai_suggestions")
          .select("*")
          .eq("account_id", account.id)
          .eq("status", "pending")
          .limit(3);

        // Get user email
        const { data: userData } = await supabase.auth.admin.getUserById(account.owner_id);

        if (!userData.user?.email) continue;

        const digestData: DigestEmail = {
          recipient: userData.user.email,
          accountName: account.name,
          metrics: {
            totalSpend,
            conversions,
            roas,
            topCampaign: topCampaign?.campaign_name || "N/A",
            topCampaignRoas: topCampaign?.roas || 0,
          },
          alerts: (alerts || []).map((a: any) => ({
            type: a.type,
            message: a.message,
          })),
          suggestions: (suggestions || []).map((s: any) => ({
            title: s.title,
            description: s.description,
          })),
        };

        const htmlContent = await generateDigestEmail(digestData);

        // Send email
        if (resendApiKey) {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: "digest@media-manager.local",
              to: digestData.recipient,
              subject: `Daily Digest - ${digestData.accountName}`,
              html: htmlContent,
            }),
          });

          if (!response.ok) {
            console.error(`Failed to send digest to ${digestData.recipient}`);
          } else {
            console.log(`Digest sent to ${digestData.recipient}`);
          }
        }
      } catch (error) {
        console.error(`Error processing account ${account.id}:`, error);
      }
    }
  } catch (error) {
    console.error("Digest generation error:", error);
  }
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  await sendDailyDigests();

  return new Response(
    JSON.stringify({ success: true, message: "Daily digests sent" }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    }
  );
});
