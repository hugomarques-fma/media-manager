// PDF Report Generation Utilities
// Note: In production, use a library like pdfkit or html2pdf with backend support

export interface CampaignReportData {
  campaignId: string;
  campaignName: string;
  objective: string;
  status: string;
  dateRange: {
    start: string;
    end: string;
  };
  metrics: {
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cpc: number;
    cpa: number;
    roas: number;
  };
  performance: {
    daily: Array<{
      date: string;
      spend: number;
      conversions: number;
      roas: number;
    }>;
  };
  insights: string[];
}

export function generateCampaignReportHTML(data: CampaignReportData): string {
  const dateStart = new Date(data.dateRange.start).toLocaleDateString();
  const dateEnd = new Date(data.dateRange.end).toLocaleDateString();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
        }
        .header {
          margin-bottom: 30px;
          border-bottom: 2px solid #007bff;
          padding-bottom: 15px;
        }
        .header h1 {
          margin: 0 0 10px 0;
          color: #333;
        }
        .metadata {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        .metric-box {
          padding: 15px;
          background: #f8f9fa;
          border-left: 4px solid #007bff;
          border-radius: 4px;
        }
        .metric-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
        }
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .section h2 {
          font-size: 18px;
          color: #333;
          margin-bottom: 15px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        th {
          background: #007bff;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: bold;
        }
        td {
          padding: 10px 12px;
          border-bottom: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background: #f8f9fa;
        }
        .insights {
          background: #e7f3ff;
          border-left: 4px solid #007bff;
          padding: 15px;
          border-radius: 4px;
        }
        .insights ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .insights li {
          margin-bottom: 8px;
          color: #333;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
        @media print {
          body { margin: 0; padding: 0; }
          .section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Campaign Performance Report</h1>
        <p style="margin: 5px 0; color: #666;">
          <strong>${data.campaignName}</strong> • ${dateStart} to ${dateEnd}
        </p>
      </div>

      <div class="metadata">
        <div class="metric-box">
          <div class="metric-label">Total Spend</div>
          <div class="metric-value">$${data.metrics.spend.toLocaleString()}</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">Conversions</div>
          <div class="metric-value">${data.metrics.conversions.toLocaleString()}</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">ROAS</div>
          <div class="metric-value">${data.metrics.roas.toFixed(2)}x</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">CTR</div>
          <div class="metric-value">${data.metrics.ctr.toFixed(2)}%</div>
        </div>
      </div>

      <div class="section">
        <h2>Campaign Overview</h2>
        <table>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Campaign ID</td>
            <td>${data.campaignId}</td>
          </tr>
          <tr>
            <td>Objective</td>
            <td>${data.objective}</td>
          </tr>
          <tr>
            <td>Status</td>
            <td><span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px;">${data.status}</span></td>
          </tr>
          <tr>
            <td>Impressions</td>
            <td>${data.metrics.impressions.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Clicks</td>
            <td>${data.metrics.clicks.toLocaleString()}</td>
          </tr>
          <tr>
            <td>CPC</td>
            <td>$${data.metrics.cpc.toFixed(2)}</td>
          </tr>
          <tr>
            <td>CPA</td>
            <td>$${data.metrics.cpa.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <div class="section">
        <h2>Daily Performance</h2>
        <table>
          <tr>
            <th>Date</th>
            <th>Spend</th>
            <th>Conversions</th>
            <th>ROAS</th>
          </tr>
          ${data.performance.daily
            .map(
              (day) => `
            <tr>
              <td>${new Date(day.date).toLocaleDateString()}</td>
              <td>$${day.spend.toFixed(2)}</td>
              <td>${day.conversions}</td>
              <td>${day.roas.toFixed(2)}x</td>
            </tr>
          `
            )
            .join('')}
        </table>
      </div>

      ${
        data.insights.length > 0
          ? `
        <div class="section">
          <h2>Key Insights</h2>
          <div class="insights">
            <ul>
              ${data.insights.map((insight) => `<li>${insight}</li>`).join('')}
            </ul>
          </div>
        </div>
      `
          : ''
      }

      <div class="footer">
        <p>Generated on ${new Date().toLocaleString()} by media-manager</p>
      </div>
    </body>
    </html>
  `;
}

export function downloadPDFReport(
  filename: string,
  htmlContent: string
) {
  // Create blob from HTML
  const blob = new Blob([htmlContent], { type: 'text/html' });

  // For client-side PDF generation, use print functionality
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.srcdoc = htmlContent;

  iframe.onload = () => {
    iframe.contentWindow?.print();
    // Note: User will need to "Save as PDF" from print dialog
  };

  document.body.appendChild(iframe);

  // Clean up after a delay
  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 1000);
}

// Schedule report generation interface
export interface ScheduledReport {
  id: string;
  account_id: string;
  name: string;
  type: 'campaign' | 'account' | 'performance' | 'roi';
  frequency: 'daily' | 'weekly' | 'monthly';
  scheduled_time: string; // HH:MM format
  recipients: string[];
  filters: {
    campaignIds?: string[];
    dateRange?: 'last_7_days' | 'last_30_days' | 'last_90_days';
    includeMetrics?: string[];
  };
  enabled: boolean;
  created_at: string;
  last_run_at?: string;
}

export function formatScheduleForDisplay(frequency: string, scheduledTime: string): string {
  const time = scheduledTime || '9:00 AM';

  switch (frequency) {
    case 'daily':
      return `Daily at ${time}`;
    case 'weekly':
      return `Weekly at ${time}`;
    case 'monthly':
      return `Monthly at ${time}`;
    default:
      return frequency;
  }
}
