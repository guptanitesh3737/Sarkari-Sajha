import { Vacancy } from '../types';

/**
 * Escapes values for standard RFC 4180 CSV output.
 */
function escapeCSVValue(val: any): string {
  if (val === null || val === undefined) {
    return '""';
  }
  const str = String(val);
  // Double-quote all instances of internal quotes
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Exports a list of SarkariSajha vacancies as a downloadable CSV file.
 * Includes UTF-8 BOM for full multi-language & Devanagari script compatibility in Excel.
 */
export function exportVacanciesToCSV(vacancies: Vacancy[], filenamePrefix: string = 'SarkariSajha_Vacancies'): boolean {
  if (!vacancies || vacancies.length === 0) {
    return false;
  }

  const headers = [
    'Vacancy ID',
    'Title (English)',
    'Title (Nepali)',
    'Organization',
    'Short Org',
    'Category',
    'Province',
    'Level',
    'Total Posts',
    'Application Fee (NPR)',
    'Application Deadline',
    'Exam Date',
    'Status',
    'Notice Number',
    'Apply URL',
    'Minimum Qualification',
    'Min Age',
    'Max Age',
    'Eligible Fields',
    'Syllabus Topics',
    'Created At'
  ];

  const rows = vacancies.map((v) => [
    escapeCSVValue(v.id),
    escapeCSVValue(v.title),
    escapeCSVValue(v.titleNp || v.title),
    escapeCSVValue(v.org),
    escapeCSVValue(v.shortOrg || ''),
    escapeCSVValue(v.category),
    escapeCSVValue(v.province),
    escapeCSVValue(v.level),
    escapeCSVValue(v.posts),
    escapeCSVValue(v.fee),
    escapeCSVValue(v.deadline),
    escapeCSVValue(v.examDate || 'To be announced'),
    escapeCSVValue(v.status),
    escapeCSVValue(v.noticeNumber || ''),
    escapeCSVValue(v.applyUrl || ''),
    escapeCSVValue(v.qualifications?.minLevel || ''),
    escapeCSVValue(v.qualifications?.minAge ?? 18),
    escapeCSVValue(v.qualifications?.maxAge ?? 35),
    escapeCSVValue(v.qualifications?.fields?.join('; ') || 'Any General Field'),
    escapeCSVValue(v.syllabusPoints?.join('; ') || ''),
    escapeCSVValue(v.createdAt || new Date().toISOString())
  ]);

  // Prepend UTF-8 Byte Order Mark (\uFEFF) so Excel & spreadsheet apps properly display Nepali text
  const csvContent =
    '\uFEFF' +
    [
      headers.map((h) => `"${h}"`).join(','),
      ...rows.map((row) => row.join(','))
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const downloadUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');

  const timestamp = new Date().toISOString().slice(0, 10);
  downloadLink.href = downloadUrl;
  downloadLink.download = `${filenamePrefix}_${timestamp}.csv`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(downloadUrl);

  return true;
}
