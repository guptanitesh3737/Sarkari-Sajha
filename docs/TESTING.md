# SarkariSajha - Quality Assurance & Testing Protocol

## Test Matrix
1. **Compilation & Build Checks**:
   - `lint_applet` (`tsc --noEmit` validation).
   - `compile_applet` (production Vite build & server bundling verification).

2. **Role Authorization Matrix**:
   - Guest User: View verified vacancies, run sample quizzes, view public salary charts.
   - Candidate User: Save applications, track deadlines, sync with Google Sheets.
   - Admin/Editor: Review AI-extracted vacancies, publish verified updates.

3. **Integration Scenarios**:
   - Google Workspace OAuth flow for Google Sheets import/export.
   - Recharts salary distribution rendering across device breakpoints.
   - Responsive modal overlays & mobile menu drawer toggles.
