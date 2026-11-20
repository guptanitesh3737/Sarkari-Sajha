# SarkariSajha - Gemini AI Engineering Architecture

## Models & Engine Usage
- **SDK**: `@google/genai` (Server-side initialization)
- **Primary Model**: `gemini-2.5-flash` for fast structured CV matching and vacancy parsing.

## AI Functionalities
1. **Resume / CV Qualification Parser**:
   - Analyzes candidate education (e.g., Master's in IT, Bachelor in Law), experience years, and skills.
   - Calculates percentage match scores against official Lok Sewa and Banking eligibility criteria.
2. **Government Notice Extractor**:
   - Structured JSON extraction from public notices (Position, seats, qualification, age limit, exam fee, application link).
   - Generates human-readable Nepali & English summaries.
3. **Quiz Explanation Generator**:
   - Generates context-aware explanations citing relevant Civil Service Acts or Nepal Rastra Bank directives.

## AI Safety Rules
- AI outputs are structured using JSON schemas.
- Hallucination safeguard: AI is prohibited from generating fictitious government vacancies or fake portal links. Human approval flag `verifiedByAdmin` is enforced.
