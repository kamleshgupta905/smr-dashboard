import * as XLSX from 'xlsx';

/**
 * Exports JSON data to a formatted Excel file (.xlsx)
 * @param {Array<Object>} data - Array of objects to export
 * @param {string} fileName - Name of the output file (without extension)
 * @param {string} sheetName - Worksheet name
 */
export function exportToExcel(data, fileName = 'export', sheetName = 'Sheet1') {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-fit column widths
  const keys = Object.keys(data[0] || {});
  const colWidths = keys.map(key => {
    const maxLen = Math.max(
      key.length,
      ...data.map(row => String(row[key] ?? '').length)
    );
    return { wch: Math.min(Math.max(maxLen + 3, 12), 60) };
  });
  worksheet['!cols'] = colWidths;

  // Create workbook and append sheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Trigger browser download
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${fileName}_${dateStr}.xlsx`);
}

/**
 * Formats assigned vendor survey links for clean Excel output
 */
export function exportVendorLinksToExcel(survey, assignedVendors, generatedLinks = {}) {
  const rows = assignedVendors.map(vendor => {
    const vid = vendor.vendor_id || vendor.vendor_code || vendor.id || 'VND';
    const linkObj = generatedLinks[vid] || {};
    const liveLink = linkObj.liveLink || linkObj.url || (typeof linkObj === 'string' ? linkObj : '');
    const testLink = linkObj.testLink || '';

    return {
      'Vendor ID': vid,
      'Vendor Name': vendor.name || 'Vendor',
      'Vendor Email': vendor.email || 'N/A',
      'Survey ID': survey.SurveyId || survey.id || 'N/A',
      'Survey Name': survey.Name || survey.title || 'Market Research Survey',
      'Study Type': survey.StudyTypes || survey.type || 'Adhoc',
      'CPI Rate ($)': Number(survey.cpi || survey.CPI || 1.15).toFixed(2),
      'Vendor Payout ($)': Number(vendor.cpi || (survey.cpi * 0.7) || 0.80).toFixed(2),
      'Quota Required': survey.TotalCompleteRequired || survey.quota || 500,
      'Status': 'Live & Active',
      'Live Entry Link': liveLink || 'Pending Generation',
      'Test Sandbox Link': testLink || 'Pending Generation',
      'Assigned Date': new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    };
  });

  const surveyId = survey.SurveyId || survey.id || 'Survey';
  exportToExcel(rows, `SMR_Assigned_Vendors_${surveyId}`, 'Assigned Links');
}

/**
 * Formats full live inventory of surveys for Excel export
 */
export function exportSurveysInventoryToExcel(surveys) {
  const rows = surveys.map(s => ({
    'Survey ID': s.SurveyId || s.id,
    'Survey Name': s.Name || s.title,
    'Client / Source': s.client || s.client_name || 'Zamplia Supply Network',
    'CPI ($)': Number(s.cpi || s.CPI || 0).toFixed(2),
    'LOI (Minutes)': s.loi || s.LOI || s.LengthOfInterview || 10,
    'Incidence Rate (%)': `${s.ir || s.IR || s.IncidenceRate || 50}%`,
    'Completes Required': s.TotalCompleteRequired || s.quota || 0,
    'Completes Remaining': s.TotalCompleteRemaining || s.remaining || 0,
    'Study Type': s.StudyTypes || s.study_type || 'Consumer',
    'Status': s.status || 'Live'
  }));

  exportToExcel(rows, 'SMR_Live_Surveys_Inventory', 'Live Inventory');
}
