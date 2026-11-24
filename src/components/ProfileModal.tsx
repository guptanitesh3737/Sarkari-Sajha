import React, { useState, useMemo } from 'react';
import {
  X,
  User,
  MapPin,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  Building,
  Check,
  AlertCircle,
  Shield,
  Sparkles
} from 'lucide-react';
import { UserProfile, QualificationLevel, Province, VacancyCategory, Language } from '../types';
import { NEPAL_DISTRICTS, NEPAL_PROVINCES } from '../data/nepalLocations';

interface ProfileModalProps {
  userProfile: UserProfile;
  lang: Language;
  onClose: () => void;
  onSave: (updated: UserProfile) => void;
}

const AVAILABLE_CATEGORIES: VacancyCategory[] = [
  'Lok Sewa (PSC)',
  'Banking & Finance',
  'Teacher Service (TSC)',
  'Security Forces',
  'Health Services',
  'Public Corporation',
  'IT & Engineering'
];

const EXAM_PREFERENCE_OPTIONS = [
  'Lok Sewa (PSC) - Gazetted Section Officer (Adhikrit)',
  'Lok Sewa (PSC) - Nayab Subba (Non-Gazetted 1st)',
  'Lok Sewa (PSC) - Kharidar (Non-Gazetted 2nd)',
  'Banking - Officer / Assistant Level (NRB, RBB, NBL, ADBL)',
  'Teacher Service Commission (TSC) - Secondary / Lower Secondary',
  'Nepal Police / Armed Police Force (APF) - Inspector / Sub-Inspector',
  'Public Corporation / NEA / NTC / Civil Aviation (CAAN)',
  'Health Services / Staff Nurse / Medical Officer',
  'Other Federal / Provincial Public Service Exams'
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  userProfile,
  lang,
  onClose,
  onSave
}) => {
  const [activeSection, setActiveSection] = useState<'personal' | 'location' | 'education' | 'career'>('personal');

  // Personal
  const [name, setName] = useState(userProfile.name || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState(userProfile.dateOfBirth || '');
  const [photoUrl, setPhotoUrl] = useState(userProfile.photoUrl || '');
  const [age, setAge] = useState<number>(userProfile.age || 25);

  // Location
  const [province, setProvince] = useState<Province>(userProfile.province || 'Bagmati');
  const [district, setDistrict] = useState(userProfile.district || '');
  const [municipality, setMunicipality] = useState(userProfile.municipality || '');
  const [ward, setWard] = useState<string | number>(userProfile.ward || '');

  // Education
  const [qualificationLevel, setQualificationLevel] = useState<QualificationLevel>(
    userProfile.qualificationLevel || 'Bachelor Degree'
  );
  const [fieldOfStudy, setFieldOfStudy] = useState(userProfile.fieldOfStudy || '');
  const [institution, setInstitution] = useState(userProfile.institution || '');
  const [graduationYear, setGraduationYear] = useState<string | number>(userProfile.graduationYear || '');

  // Career & Exam Preferences
  const [preferredExam, setPreferredExam] = useState(userProfile.preferredExam || 'Lok Sewa (PSC) - Gazetted Section Officer (Adhikrit)');
  const [preferredCategories, setPreferredCategories] = useState<VacancyCategory[]>(
    userProfile.preferredCategories || ['Lok Sewa (PSC)', 'Banking & Finance']
  );
  const [preferredOrganization, setPreferredOrganization] = useState(userProfile.preferredOrganization || '');
  const [preferredProvince, setPreferredProvince] = useState<Province>(
    userProfile.preferredProvince || userProfile.province || 'Bagmati'
  );
  const [preferredDistrict, setPreferredDistrict] = useState(userProfile.preferredDistrict || '');
  const [resumeText, setResumeText] = useState(userProfile.resumeText || '');

  // Dynamic Nepal Districts for selected province
  const availableDistricts = useMemo(() => {
    return NEPAL_DISTRICTS.filter((d) => d.province === province);
  }, [province]);

  const preferredAvailableDistricts = useMemo(() => {
    return NEPAL_DISTRICTS.filter((d) => d.province === preferredProvince);
  }, [preferredProvince]);

  const handleCategoryToggle = (cat: VacancyCategory) => {
    if (preferredCategories.includes(cat)) {
      if (preferredCategories.length > 1) {
        setPreferredCategories(preferredCategories.filter((c) => c !== cat));
      }
    } else {
      setPreferredCategories([...preferredCategories, cat]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...userProfile,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      dateOfBirth: dateOfBirth || undefined,
      photoUrl: photoUrl.trim() || undefined,
      age: Number(age) || 25,
      province,
      district: district || undefined,
      municipality: municipality.trim() || undefined,
      ward: ward ? String(ward).trim() : undefined,
      qualificationLevel,
      fieldOfStudy: fieldOfStudy.trim(),
      institution: institution.trim() || undefined,
      graduationYear: graduationYear ? String(graduationYear).trim() : undefined,
      preferredExam: preferredExam || undefined,
      preferredCategories,
      preferredOrganization: preferredOrganization.trim() || undefined,
      preferredProvince,
      preferredDistrict: preferredDistrict || undefined,
      resumeText: resumeText.trim() || undefined,
      updatedAt: new Date().toISOString()
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-ink/30 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl text-slate-900 overflow-hidden flex flex-col max-h-[90vh] shadow-soft ring-1 ring-black/[0.03] dark:ring-white/10">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={name}
                  className="w-full h-full object-cover rounded-2xl"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 font-sans">
                  {lang === 'np' ? 'उम्मेदवार प्रोफाइल तथा विवरण' : 'Candidate Profile & Preferences'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" />
                  Firebase Sync
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {lang === 'np'
                  ? 'सरकारी तथा बैंकिङ परीक्षा तयारी, योग्यता मिलान र सूचनाका लागि'
                  : 'Voluntary profile information stored in Firebase for exam matching and updates'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="px-6 pt-3 bg-white border-b border-slate-100 flex gap-2 overflow-x-auto text-xs font-semibold text-slate-500">
          <button
            type="button"
            onClick={() => setActiveSection('personal')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeSection === 'personal'
                ? 'border-rose-600 text-rose-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{lang === 'np' ? 'व्यक्तिगत विवरण' : '1. Personal'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('location')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeSection === 'location'
                ? 'border-rose-600 text-rose-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{lang === 'np' ? 'ठेगाना तथा स्थान' : '2. Location'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('education')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeSection === 'education'
                ? 'border-rose-600 text-rose-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{lang === 'np' ? 'शैक्षिक योग्यता' : '3. Education'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('career')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeSection === 'career'
                ? 'border-rose-600 text-rose-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{lang === 'np' ? 'परीक्षा प्राथमिकता' : '4. Exam & Career'}</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* 1. PERSONAL INFORMATION */}
          {activeSection === 'personal' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3 bg-sky-50/70 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-slate-800 font-bold text-xs">Firebase Account Identification</div>
                  <div className="text-[11px] text-slate-500 font-mono">UID: {userProfile.id}</div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                  {userProfile.status === 'suspended' ? 'SUSPENDED' : 'ACTIVE CANDIDATE'}
                </span>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  {lang === 'np' ? 'पूरा नाम *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Nitesh Gupta"
                  className="w-full bg-slate-50 border border-slate-200 rounded-full p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">
                    {lang === 'np' ? 'इमेल ठेगाना *' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-full p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">
                    {lang === 'np' ? 'सम्पर्क फोन नम्बर *' : 'Phone Number (+977) *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+977-98XXXXXXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-full p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">
                    {lang === 'np' ? 'जन्म मिति (Date of Birth)' : 'Date of Birth (Optional)'}
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => {
                      setDateOfBirth(e.target.value);
                      if (e.target.value) {
                        const birthYear = new Date(e.target.value).getFullYear();
                        const currentYear = new Date().getFullYear();
                        if (birthYear > 1940 && birthYear < currentYear) {
                          setAge(currentYear - birthYear);
                        }
                      }
                    }}
                    className="w-full bg-sky-50/70 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">
                    {lang === 'np' ? 'उमेर (वर्षमा)' : 'Age (Years)'}
                  </label>
                  <input
                    type="number"
                    min={16}
                    max={65}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-full p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  {lang === 'np' ? 'प्रोफाइल फोटो लिङ्क (Photo URL)' : 'Profile Photo URL (Optional)'}
                </label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full bg-slate-50 border border-slate-200 rounded-full p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-300 font-mono text-[11px]"
                />
              </div>
            </div>
          )}

          {/* 2. LOCATION */}
          {activeSection === 'location' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">
                    {lang === 'np' ? 'प्रदेश (Province) *' : 'Province Residence *'}
                  </label>
                  <select
                    value={province}
                    onChange={(e) => {
                      const newProv = e.target.value as Province;
                      setProvince(newProv);
                      // Clear district if not belonging to new province
                      const inNew = NEPAL_DISTRICTS.some((d) => d.province === newProv && d.name === district);
                      if (!inNew) setDistrict('');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-full p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-300 font-medium"
                  >
                    {NEPAL_PROVINCES.filter((p) => p.id !== 'All Nepal').map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nameEn} ({p.nameNp})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">
                    {lang === 'np' ? 'जिल्ला (District)' : 'District (77 Nepal Districts)'}
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-full p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-300 font-medium"
                  >
                    <option value="">-- Select District --</option>
                    {availableDistricts.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name} ({d.nameNp}) - HQ: {d.headquarters}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 mb-1 font-semibold">
                    {lang === 'np' ? 'नगरपालिका / गाउँपालिका' : 'Municipality / Rural Municipality'}
                  </label>
                  <input
                    type="text"
                    value={municipality}
                    onChange={(e) => setMunicipality(e.target.value)}
                    placeholder="e.g. Kathmandu Metropolitan City / Pokhara Lekhnath"
                    className="w-full bg-slate-50 border border-slate-200 rounded-full p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">
                    {lang === 'np' ? 'वडा नम्बर' : 'Ward No.'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={35}
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full bg-slate-50 border border-slate-200 rounded-full p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-300 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-2xl flex items-start gap-2.5 text-blue-900">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Provincial vacancies published by Pradesh Lok Sewa Aayog (Pradesh 1 to Sudurpashchim) prioritize
                  permanent residents of the respective province.
                </p>
              </div>
            </div>
          )}

          {/* 3. EDUCATION */}
          {activeSection === 'education' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">
                    {lang === 'np' ? 'उच्चतम शैक्षिक योग्यता *' : 'Highest Qualification Level *'}
                  </label>
                  <select
                    value={qualificationLevel}
                    onChange={(e) => setQualificationLevel(e.target.value as QualificationLevel)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-full p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-300 font-medium"
                  >
                    <option value="SEE/SLC">SEE/SLC (Class 10)</option>
                    <option value="+2 High School">+2 / Intermediate (Class 12)</option>
                    <option value="Bachelor Degree">Bachelor Degree (Graduate)</option>
                    <option value="Master Degree">Master Degree (Postgraduate)</option>
                    <option value="MPhil/PhD">MPhil / PhD (Doctorate)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">
                    {lang === 'np' ? 'उत्तीर्ण वर्ष (Graduation Year)' : 'Graduation Year'}
                  </label>
                  <input
                    type="text"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="e.g. 2024 A.D. / 2080 B.S."
                    className="w-full bg-slate-50 border border-slate-200 rounded-full p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  {lang === 'np' ? 'अध्ययनको विषय / संकाय (Field of Study) *' : 'Field / Stream of Study *'}
                </label>
                <input
                  type="text"
                  required
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  placeholder="e.g. Computer Science, Public Administration, Civil Engineering, Management, Law, General Science"
                  className="w-full bg-slate-50 border border-slate-200 rounded-full p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-300"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  {lang === 'np' ? 'शिक्षण संस्था / विश्वविद्यालय' : 'Institution / University / Board'}
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Tribhuvan University / Kathmandu University / NEB"
                  className="w-full bg-slate-50 border border-slate-200 rounded-full p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-300"
                />
              </div>
            </div>
          )}

          {/* 4. CAREER & EXAM PREFERENCES */}
          {activeSection === 'career' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  {lang === 'np' ? 'लक्षित परीक्षा (Target Exam Profile)' : 'Target Examination Focus'}
                </label>
                <select
                  value={preferredExam}
                  onChange={(e) => setPreferredExam(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-full p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-300 font-medium"
                >
                  {EXAM_PREFERENCE_OPTIONS.map((exam) => (
                    <option key={exam} value={exam}>
                      {exam}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  {lang === 'np' ? 'प्राथमिकता श्रेणीहरू (Preferred Sectors)' : 'Preferred Government Sectors'}
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {AVAILABLE_CATEGORIES.map((cat) => {
                    const selected = preferredCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategoryToggle(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                          selected
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {selected && <Check className="w-3.5 h-3.5" />}
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">
                    {lang === 'np' ? 'प्राथमिकता संस्था (Target Organization)' : 'Preferred Organization (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={preferredOrganization}
                    onChange={(e) => setPreferredOrganization(e.target.value)}
                    placeholder="e.g. Nepal Bank Limited / NEA / Ministry of Finance"
                    className="w-full bg-slate-50 border border-slate-200 rounded-full p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">
                    {lang === 'np' ? 'कार्यक्षेत्र प्रदेश' : 'Preferred Posting Province'}
                  </label>
                  <select
                    value={preferredProvince}
                    onChange={(e) => {
                      const newP = e.target.value as Province;
                      setPreferredProvince(newP);
                      setPreferredDistrict('');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-full p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-300 font-medium"
                  >
                    {NEPAL_PROVINCES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  {lang === 'np' ? 'बायोडाटा / संक्षिप्त परिचय (Short Resume / Bio)' : 'Voluntary Candidate Bio / Summary'}
                </label>
                <textarea
                  rows={3}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Summary of qualifications, public service aspirations, or exam history..."
                  className="w-full bg-sky-50/70 rounded-2xl p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-300 text-xs"
                />
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Real-time sync to Firebase Firestore collection</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full transition"
              >
                {lang === 'np' ? 'रद्द गर्नुहोस्' : 'Cancel'}
              </button>

              {activeSection !== 'career' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeSection === 'personal') setActiveSection('location');
                    else if (activeSection === 'location') setActiveSection('education');
                    else if (activeSection === 'education') setActiveSection('career');
                  }}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-full transition"
                >
                  {lang === 'np' ? 'अर्को खण्ड →' : 'Next Step →'}
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-full transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{lang === 'np' ? 'प्रोफाइल सेभ गर्नुहोस्' : 'Save Profile'}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
