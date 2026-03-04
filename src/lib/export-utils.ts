/**
 * Export utilities for CSV and Excel format data
 */

export interface ExportData {
  [key: string]: any;
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data: ExportData[], filename: string): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get all unique keys from all objects
  const allKeys = Array.from(
    new Set(
      data.reduce((keys: string[], obj) => {
        return [...keys, ...Object.keys(obj)];
      }, [])
    )
  );

  // Create header row
  const header = allKeys.join(',');

  // Create data rows
  const rows = data.map((obj) =>
    allKeys
      .map((key) => {
        const value = obj[key];
        // Handle special cases
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      })
      .join(',')
  );

  // Combine header and rows
  const csv = [header, ...rows].join('\n');

  // Create blob and download
  downloadFile(csv, `${filename}.csv`, 'text/csv');
}

/**
 * Export data to Excel format (using CSV with proper encoding)
 */
export function exportToExcel(data: ExportData[], filename: string): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get all unique keys
  const allKeys = Array.from(
    new Set(
      data.reduce((keys: string[], obj) => {
        return [...keys, ...Object.keys(obj)];
      }, [])
    )
  );

  // Create header row with proper formatting
  const headers = allKeys;

  // Create worksheet data
  const worksheetData: string[][] = [
    headers,
    ...data.map((obj) =>
      allKeys.map((key) => {
        const value = obj[key];
        if (value === null || value === undefined) return '';
        return String(value);
      })
    ),
  ];

  // Convert to CSV (Excel can read CSV)
  const csv = worksheetData
    .map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if needed
          if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        })
        .join(',')
    )
    .join('\n');

  // Add BOM for proper Excel encoding
  const bom = '\ufeff';
  downloadFile(bom + csv, `${filename}.csv`, 'text/csv;charset=utf-8');
}

/**
 * Export campaign metrics as detailed report
 */
export function exportCampaignReport(
  campaigns: any[],
  metrics: any[],
  format: 'csv' | 'excel'
): void {
  // Merge campaigns with their metrics
  const reportData = campaigns.map((campaign) => {
    const campaignMetrics = metrics.filter((m) => m.campaign_id === campaign.id);
    const totalSpend = campaignMetrics.reduce((sum, m) => sum + (m.spend || 0), 0);
    const totalConversions = campaignMetrics.reduce((sum, m) => sum + (m.conversions || 0), 0);
    const avgROAS = campaignMetrics.length
      ? campaignMetrics.reduce((sum, m) => sum + (m.roas || 0), 0) / campaignMetrics.length
      : 0;

    return {
      'Campaign Name': campaign.name,
      Status: campaign.status,
      Objective: campaign.objective,
      'Daily Budget': `$${campaign.daily_budget?.toFixed(2) || '0.00'}`,
      'Total Spend': `$${totalSpend.toFixed(2)}`,
      'Total Conversions': totalConversions,
      'Avg ROAS': avgROAS.toFixed(2),
      'Created At': new Date(campaign.created_at).toLocaleDateString(),
    };
  });

  const timestamp = new Date().toISOString().split('T')[0];
  if (format === 'excel') {
    exportToExcel(reportData, `campaign-report-${timestamp}`);
  } else {
    exportToCSV(reportData, `campaign-report-${timestamp}`);
  }
}

/**
 * Export performance analytics
 */
export function exportPerformanceAnalytics(
  data: Array<{
    date: string;
    spend: number;
    conversions: number;
    impressions: number;
    roas: number;
    cpa?: number;
  }>,
  format: 'csv' | 'excel'
): void {
  const reportData = data.map((row) => ({
    Date: row.date,
    'Spend ($)': row.spend.toFixed(2),
    Conversions: row.conversions,
    Impressions: row.impressions,
    ROAS: row.roas.toFixed(2),
    'CPA ($)': row.cpa?.toFixed(2) || '—',
  }));

  const timestamp = new Date().toISOString().split('T')[0];
  if (format === 'excel') {
    exportToExcel(reportData, `performance-analytics-${timestamp}`);
  } else {
    exportToCSV(reportData, `performance-analytics-${timestamp}`);
  }
}

/**
 * Download file helper
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Generate PDF report (requires external library)
 * This is a placeholder for future implementation
 */
export async function exportToPDF(
  data: ExportData[],
  title: string,
  filename: string
): Promise<void> {
  console.warn(
    'PDF export requires additional library. Install with: npm install jspdf autoTable'
  );
  // TODO: Implement PDF export using jsPDF
}
