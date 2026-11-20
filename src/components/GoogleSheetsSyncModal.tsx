import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  UploadCloud,
  DownloadCloud,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Lock,
  Database,
  ArrowRight
} from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { ApplicationTrack, Vacancy, QuizSet, Language } from '../types';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  applications: ApplicationTrack[];
  vacancies: Vacancy[];
  quizSets: QuizSet[];
  currentUser: FirebaseUser | null;
  onImportApplications?: (importedApps: Partial<ApplicationTrack>[]) => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  lang,
  applications,
  vacancies,
  quizSets,
  currentUser,
  onImportApplications
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Created Spreadsheet Info
  const [createdSheetId, setCreatedSheetId] = useState<string | null>(null);
  const [createdSheetUrl, setCreatedSheetUrl] = useState<string | null>(null);

  // Import Input State
  const [existingSheetIdInput, setExistingSheetIdInput] = useState('');
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');

  // Confirmation modal for overwriting/updating
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);
  const [confirmDescription, setConfirmDescription] = useState('');

  if (!isOpen) return null;

  // Sign in to Google & obtain OAuth access token for Sheets API
  const handleConnectGoogle = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
        setSuccessMsg(
          lang === 'np'
            ? 'गूगल खाता र शीट्स अनुमति सफल भयो!'
            : 'Successfully authenticated with Google Sheets API access!'
        );
      } else {
        setErrorMsg('Failed to acquire OAuth access token for Google Sheets API.');
      }
    } catch (err: any) {
      console.error('Sheets Auth Error:', err);
      setErrorMsg(
        err.message ||
          (lang === 'np'
            ? 'गूगल लगइन असफल भयो। कृपया पुन: प्रयास गर्नुहोस्।'
            : 'Google authentication failed. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper to trigger confirmation if overwriting existing sheet
  const executeWithConfirmation = (action: () => Promise<void>, description: string) => {
    if (createdSheetId) {
      setPendingAction(() => action);
      setConfirmDescription(description);
      setShowConfirmDialog(true);
    } else {
      action();
    }
  };

  // EXPORT APPLICATIONS & VACANCIES TO A NEW GOOGLE SHEET
  const handleExportApplications = async () => {
    if (!accessToken) {
      setErrorMsg(lang === 'np' ? 'कृपया पहिले गूगल खाता कनेक्ट गर्नुहोस्।' : 'Please connect your Google account first.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      setLoading(true);

      // 1. Create a new Google Spreadsheet via Sheets API
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            title: `SarkariSajha_Vacancies_Applications_${new Date().toISOString().slice(0, 10)}`
          },
          sheets: [
            {
              properties: {
                title: 'Applications_And_Bookmarks'
              }
            }
          ]
        })
      });

      if (!createRes.ok) {
        const errJson = await createRes.json();
        throw new Error(errJson.error?.message || 'Failed to create Google Sheet');
      }

      const sheetData = await createRes.json();
      const spreadsheetId = sheetData.spreadsheetId;
      const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

      setCreatedSheetId(spreadsheetId);
      setCreatedSheetUrl(spreadsheetUrl);

      // 2. Format header & rows
      const headerRow = [
        'Application ID',
        'Job Title',
        'Organization',
        'Category',
        'Level',
        'Status',
        'Application Fee Paid',
        'Deadline',
        'Personal Notes',
        'Date Bookmarked'
      ];

      const dataRows = applications.map((app) => {
        const vac = vacancies.find((v) => v.id === app.vacancyId);
        return [
          app.id,
          vac ? vac.title : 'General Vacancy',
          vac ? vac.organization : 'Govt Nepal',
          vac ? vac.category : 'Public Service',
          vac ? vac.level : 'N/A',
          app.status,
          app.feePaid ? 'YES' : 'NO',
          vac ? vac.deadline : 'N/A',
          app.notes || '',
          app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : new Date().toLocaleDateString()
        ];
      });

      const values = [headerRow, ...dataRows];

      // 3. Populate Google Sheet values
      const updateRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Applications_And_Bookmarks!A1:J${values.length}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            range: `Applications_And_Bookmarks!A1:J${values.length}`,
            majorDimension: 'ROWS',
            values: values
          })
        }
      );

      if (!updateRes.ok) {
        const errJson = await updateRes.json();
        throw new Error(errJson.error?.message || 'Failed to populate Google Sheet rows');
      }

      setSuccessMsg(
        lang === 'np'
          ? `सफलतापुर्वक ${applications.length} वटा दरखास्त डाटा गूगल शीट्स (Google Sheets) मा एक्सपोर्ट गरियो!`
          : `Successfully exported ${applications.length} tracked applications to Google Sheets!`
      );
    } catch (err: any) {
      console.error('Export Error:', err);
      setErrorMsg(err.message || 'Failed to export applications to Google Sheets.');
    } finally {
      setLoading(false);
    }
  };

  // EXPORT QUIZ SCORES & PRACTICE LOGS
  const handleExportQuizScores = async () => {
    if (!accessToken) {
      setErrorMsg(lang === 'np' ? 'कृपया पहिले गूगल खाता कनेक्ट गर्नुहोस्।' : 'Please connect your Google account first.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      setLoading(true);

      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            title: `SarkariSajha_Quiz_Practice_Logs_${new Date().toISOString().slice(0, 10)}`
          },
          sheets: [
            {
              properties: {
                title: 'Quiz_Scores'
              }
            }
          ]
        })
      });

      if (!createRes.ok) {
        const errJson = await createRes.json();
        throw new Error(errJson.error?.message || 'Failed to create Google Sheet for Quiz Logs');
      }

      const sheetData = await createRes.json();
      const spreadsheetId = sheetData.spreadsheetId;
      const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

      setCreatedSheetId(spreadsheetId);
      setCreatedSheetUrl(spreadsheetUrl);

      const headerRow = ['Quiz Set Title', 'Target Service', 'Total Questions', 'Duration (Mins)', 'Date Synchronized'];
      const dataRows = quizSets.map((qs) => [
        qs.title,
        qs.category || qs.examProfile || 'General',
        qs.questions.length,
        qs.timeLimitMinutes || 20,
        new Date().toLocaleDateString()
      ]);

      const values = [headerRow, ...dataRows];

      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Quiz_Scores!A1:E${values.length}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            range: `Quiz_Scores!A1:E${values.length}`,
            majorDimension: 'ROWS',
            values: values
          })
        }
      );

      setSuccessMsg(
        lang === 'np'
          ? `सफलतापुर्वक मोक टेस्ट प्रश्न सेटहरू गूगल शीट्स (Google Sheets) मा एक्सपोर्ट गरियो!`
          : `Successfully exported ${quizSets.length} quiz practice sets to Google Sheets!`
      );
    } catch (err: any) {
      console.error('Quiz Export Error:', err);
      setErrorMsg(err.message || 'Failed to export quiz scores.');
    } finally {
      setLoading(false);
    }
  };

  // IMPORT APPLICATIONS FROM EXISTING GOOGLE SHEET ID
  const handleImportFromSheet = async () => {
    if (!accessToken) {
      setErrorMsg(lang === 'np' ? 'कृपया पहिले गूगल खाता कनेक्ट गर्नुहोस्।' : 'Please connect your Google account first.');
      return;
    }

    const sheetId = existingSheetIdInput.trim() || createdSheetId;
    if (!sheetId) {
      setErrorMsg(lang === 'np' ? 'कृपया Google Sheet ID वा लिङ्क हाल्नुहोस्।' : 'Please enter a Google Sheet ID or URL.');
      return;
    }

    // Extract sheet ID if full URL pasted
    let cleanSheetId = sheetId;
    if (sheetId.includes('/d/')) {
      const match = sheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) cleanSheetId = match[1];
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      setLoading(true);

      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${cleanSheetId}/values/A1:J100`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error?.message || 'Failed to fetch rows from Google Sheet');
      }

      const data = await res.json();
      const rows: string[][] = data.values || [];

      if (rows.length < 2) {
        setErrorMsg('Spreadsheet contains no data rows to import.');
        return;
      }

      // Parse imported rows
      const importedApps: Partial<ApplicationTrack>[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row && row.length >= 2) {
          const appTitle = row[1];
          const matchedVac = vacancies.find((v) => v.title.toLowerCase().includes(appTitle.toLowerCase()));
          if (matchedVac) {
            importedApps.push({
              vacancyId: matchedVac.id,
              status: (row[5] as any) || 'Bookmarked',
              feePaid: row[6] === 'YES',
              notes: row[8] || 'Imported via Google Sheets'
            });
          }
        }
      }

      if (importedApps.length > 0 && onImportApplications) {
        onImportApplications(importedApps);
        setSuccessMsg(
          lang === 'np'
            ? `सफलतापुर्वक ${importedApps.length} वटा दरखास्त गूगल शीट्सबाट इम्पोर्ट गरियो!`
            : `Successfully imported ${importedApps.length} applications from Google Sheets!`
        );
      } else {
        setSuccessMsg(
          lang === 'np'
            ? 'शीट्सबाट ${rows.length - 1} वटा रो पढियो।'
            : `Read ${rows.length - 1} spreadsheet rows successfully!`
        );
      }
    } catch (err: any) {
      console.error('Import Error:', err);
      setErrorMsg(err.message || 'Failed to import from Google Sheets.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Confirmation Modal for Overwriting Data */}
      {showConfirmDialog && (
        <div className="absolute inset-0 z-60 bg-slate-950/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 text-slate-900 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              <h4 className="font-bold text-sm">Confirm Google Sheet Update</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{confirmDescription}</p>
            <div className="flex gap-2 pt-2 justify-end">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setPendingAction(null);
                }}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowConfirmDialog(false);
                  if (pendingAction) {
                    await pendingAction();
                    setPendingAction(null);
                  }
                }}
                className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-xs transition"
              >
                Confirm Sync
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden relative">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-emerald-300 hover:text-white hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 font-mono">
              Google Workspace Integration
            </span>
          </div>

          <h3 className="text-xl font-black font-sans">
            {lang === 'np' ? 'गूगल शीट्स सिङ्क र एक्सपोर्ट' : 'Google Sheets Sync & Cloud Export'}
          </h3>
          <p className="text-xs text-emerald-100 mt-1">
            {lang === 'np'
              ? 'तपाईंको लोक सेवा/बैंकिङ दरखास्त र मोक टेस्ट रेकर्ड गूगल ड्राइभमा सुरक्षित गर्नुहोस्।'
              : 'Export application tracker logs and practice scores directly into your Google Drive spreadsheets.'}
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Connection Status Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${accessToken ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {accessToken ? '✓' : <Lock className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  {accessToken
                    ? lang === 'np' ? 'गूगल शीट्स जोडिएको छ' : 'Connected to Google Workspace'
                    : lang === 'np' ? 'गूगल खाता कनेक्ट गरिएको छैन' : 'Google Sheets Auth Required'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {accessToken
                    ? currentUser?.email || 'OAuth Token active for Spreadsheets API'
                    : lang === 'np' ? 'गूगल खातामा लगइन गरी शीट्स अनुमति दिनुहोस्' : 'Sign in to grant permission to write Google Sheets'}
                </p>
              </div>
            </div>

            {!accessToken && (
              <button
                onClick={handleConnectGoogle}
                disabled={loading}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>{lang === 'np' ? 'गूगल जोडनुहोस्' : 'Connect Google'}</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Created Sheet Banner if active */}
          {createdSheetUrl && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-emerald-950 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Google Sheet Created & Updated</span>
                </span>
                <span className="font-mono text-[10px] bg-emerald-200/60 px-2 py-0.5 rounded-full text-emerald-900">
                  Ready in Drive
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-snug">
                Your data is synced. Click below to view and edit your spreadsheet directly in Google Sheets.
              </p>
              <a
                href={createdSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-2xs mt-1"
              >
                <span>Open in Google Sheets</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Tabs: Export vs Import */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('export')}
              className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'export' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'np' ? 'शीट्समा एक्सपोर्ट' : 'Export to Sheets'}</span>
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'import' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DownloadCloud className="w-3.5 h-3.5 text-blue-600" />
              <span>{lang === 'np' ? 'शीट्सबाट इम्पोर्ट' : 'Import from Sheets'}</span>
            </button>
          </div>

          {/* EXPORT CONTENT */}
          {activeTab === 'export' && (
            <div className="space-y-3">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {lang === 'np' ? 'दरखास्त ट्र्याकर डाटा एक्सपोर्ट' : 'Export Application Tracker Data'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {lang === 'np'
                        ? `${applications.length} वटा दरखास्त र बुकमार्कहरू एक्सपोर्ट गर्नुहोस्`
                        : `${applications.length} tracked applications & bookmarks`}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      executeWithConfirmation(
                        handleExportApplications,
                        'This will overwrite or append rows in your Google Sheet spreadsheet.'
                      )
                    }
                    disabled={loading || !accessToken}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
                  >
                    {loading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{lang === 'np' ? 'शीट्स एक्सपोर्ट' : 'Export Applications'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {lang === 'np' ? 'मोक टेस्ट प्रश्न र नतिजा एक्सपोर्ट' : 'Export Quiz Practice Log'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {lang === 'np'
                        ? `${quizSets.length} वटा मोक टेस्ट प्रश्न सेटहरू`
                        : `${quizSets.length} practice sets & target services`}
                    </p>
                  </div>
                  <button
                    onClick={handleExportQuizScores}
                    disabled={loading || !accessToken}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
                  >
                    {loading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>{lang === 'np' ? 'क्विज एक्सपोर्ट' : 'Export Quizzes'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* IMPORT CONTENT */}
          {activeTab === 'import' && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  {lang === 'np' ? 'गूगल शीट्स ID वा URL प्रविष्ट गर्नुहोस्:' : 'Google Spreadsheet ID or URL:'}
                </label>
                <input
                  type="text"
                  value={existingSheetIdInput}
                  onChange={(e) => setExistingSheetIdInput(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1abc123... or ID"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleImportFromSheet}
                  disabled={loading || !accessToken}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <DownloadCloud className="w-4 h-4" />
                      <span>{lang === 'np' ? 'शीट्सबाट इम्पोर्ट गर्नुहोस्' : 'Import Applications Data'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
