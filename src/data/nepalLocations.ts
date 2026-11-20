import { Province } from '../types';

export interface DistrictInfo {
  name: string;
  nameNp: string;
  province: Province;
  headquarters: string;
}

export const NEPAL_PROVINCES: { id: Province; nameEn: string; nameNp: string }[] = [
  { id: 'All Nepal', nameEn: 'All Nepal (Federal / National)', nameNp: 'समग्र नेपाल (संघीय)' },
  { id: 'Koshi', nameEn: 'Koshi Province (Province 1)', nameNp: 'कोशी प्रदेश' },
  { id: 'Madhesh', nameEn: 'Madhesh Province (Province 2)', nameNp: 'मधेश प्रदेश' },
  { id: 'Bagmati', nameEn: 'Bagmati Province (Province 3)', nameNp: 'बागमती प्रदेश' },
  { id: 'Gandaki', nameEn: 'Gandaki Province (Province 4)', nameNp: 'गण्डकी प्रदेश' },
  { id: 'Lumbini', nameEn: 'Lumbini Province (Province 5)', nameNp: 'लुम्बिनी प्रदेश' },
  { id: 'Karnali', nameEn: 'Karnali Province (Province 6)', nameNp: 'कर्णाली प्रदेश' },
  { id: 'Sudurpashchim', nameEn: 'Sudurpashchim Province (Province 7)', nameNp: 'सुदूरपश्चिम प्रदेश' }
];

export const NEPAL_DISTRICTS: DistrictInfo[] = [
  // Koshi Province (14 districts)
  { name: 'Bhojpur', nameNp: 'भोजपुर', province: 'Koshi', headquarters: 'Bhojpur' },
  { name: 'Dhankuta', nameNp: 'धनकुटा', province: 'Koshi', headquarters: 'Dhankuta' },
  { name: 'Ilam', nameNp: 'इलाम', province: 'Koshi', headquarters: 'Ilam' },
  { name: 'Jhapa', nameNp: 'झापा', province: 'Koshi', headquarters: 'Bhadrapur' },
  { name: 'Khotang', nameNp: 'खोटाङ', province: 'Koshi', headquarters: 'Diktel' },
  { name: 'Morang', nameNp: 'मोरङ', province: 'Koshi', headquarters: 'Biratnagar' },
  { name: 'Okhaldhunga', nameNp: 'ओखलढुङ्गा', province: 'Koshi', headquarters: 'Siddhicharan' },
  { name: 'Panchthar', nameNp: 'पाँचथर', province: 'Koshi', headquarters: 'Phidim' },
  { name: 'Sankhuwasabha', nameNp: 'सङ्खुवासभा', province: 'Koshi', headquarters: 'Khandbari' },
  { name: 'Solukhumbu', nameNp: 'सोलुखुम्बु', province: 'Koshi', headquarters: 'Salleri' },
  { name: 'Sunsari', nameNp: 'सुनसरी', province: 'Koshi', headquarters: 'Inaruwa' },
  { name: 'Taplejung', nameNp: 'ताप्लेजुङ', province: 'Koshi', headquarters: 'Phungling' },
  { name: 'Terhathum', nameNp: 'तेह्रथुम', province: 'Koshi', headquarters: 'Myanglung' },
  { name: 'Udayapur', nameNp: 'उदयपुर', province: 'Koshi', headquarters: 'Gaighat' },

  // Madhesh Province (8 districts)
  { name: 'Bara', nameNp: 'बारा', province: 'Madhesh', headquarters: 'Kalaiya' },
  { name: 'Dhanusha', nameNp: 'धनुषा', province: 'Madhesh', headquarters: 'Janakpur' },
  { name: 'Mahottari', nameNp: 'महोत्तरी', province: 'Madhesh', headquarters: 'Jaleshwar' },
  { name: 'Parsa', nameNp: 'पर्सा', province: 'Madhesh', headquarters: 'Birgunj' },
  { name: 'Rautahat', nameNp: 'रौतहट', province: 'Madhesh', headquarters: 'Gaur' },
  { name: 'Saptari', nameNp: 'सप्तरी', province: 'Madhesh', headquarters: 'Rajbiraj' },
  { name: 'Sarlahi', nameNp: 'सर्लाही', province: 'Madhesh', headquarters: 'Malangwa' },
  { name: 'Siraha', nameNp: 'सिराहा', province: 'Madhesh', headquarters: 'Siraha' },

  // Bagmati Province (13 districts)
  { name: 'Bhaktapur', nameNp: 'भक्तपुर', province: 'Bagmati', headquarters: 'Bhaktapur' },
  { name: 'Chitwan', nameNp: 'चितवन', province: 'Bagmati', headquarters: 'Bharatpur' },
  { name: 'Dhading', nameNp: 'धादिङ', province: 'Bagmati', headquarters: 'Nilkantha' },
  { name: 'Dolakha', nameNp: 'दोलखा', province: 'Bagmati', headquarters: 'Charikot' },
  { name: 'Kathmandu', nameNp: 'काठमाडौँ', province: 'Bagmati', headquarters: 'Kathmandu' },
  { name: 'Kavrepalanchok', nameNp: 'काभ्रेपलाञ्चोक', province: 'Bagmati', headquarters: 'Dhulikhel' },
  { name: 'Lalitpur', nameNp: 'ललितपुर', province: 'Bagmati', headquarters: 'Lalitpur' },
  { name: 'Makwanpur', nameNp: 'मकवानपुर', province: 'Bagmati', headquarters: 'Hetauda' },
  { name: 'Nuwakot', nameNp: 'नुवाकोट', province: 'Bagmati', headquarters: 'Bidur' },
  { name: 'Ramechhap', nameNp: 'रामेछाप', province: 'Bagmati', headquarters: 'Manthali' },
  { name: 'Rasuwa', nameNp: 'रसुवा', province: 'Bagmati', headquarters: 'Dhunche' },
  { name: 'Sindhuli', nameNp: 'सिन्धुली', province: 'Bagmati', headquarters: 'Kamalamai' },
  { name: 'Sindhupalchok', nameNp: 'सिन्धुपाल्चोक', province: 'Bagmati', headquarters: 'Chautara' },

  // Gandaki Province (11 districts)
  { name: 'Baglung', nameNp: 'बागलुङ', province: 'Gandaki', headquarters: 'Baglung' },
  { name: 'Gorkha', nameNp: 'गोरखा', province: 'Gandaki', headquarters: 'Gorkha' },
  { name: 'Kaski', nameNp: 'कास्की', province: 'Gandaki', headquarters: 'Pokhara' },
  { name: 'Lamjung', nameNp: 'लमजुङ', province: 'Gandaki', headquarters: 'Besisahar' },
  { name: 'Manang', nameNp: 'मनाङ', province: 'Gandaki', headquarters: 'Chame' },
  { name: 'Mustang', nameNp: 'मुस्ताङ', province: 'Gandaki', headquarters: 'Jomsom' },
  { name: 'Myagdi', nameNp: 'म्याग्दी', province: 'Gandaki', headquarters: 'Beni' },
  { name: 'Nawalpur (Nawalparasi East)', nameNp: 'नवलपुर (नवलपरासी पूर्व)', province: 'Gandaki', headquarters: 'Kawasoti' },
  { name: 'Parbat', nameNp: 'पर्वत', province: 'Gandaki', headquarters: 'Kusma' },
  { name: 'Syangja', nameNp: 'स्याङ्जा', province: 'Gandaki', headquarters: 'Putalibazar' },
  { name: 'Tanahun', nameNp: 'तनहुँ', province: 'Gandaki', headquarters: 'Damauli' },

  // Lumbini Province (12 districts)
  { name: 'Arghakhanchi', nameNp: 'अर्घाखाँची', province: 'Lumbini', headquarters: 'Sandhikharka' },
  { name: 'Banke', nameNp: 'बाँके', province: 'Lumbini', headquarters: 'Nepalgunj' },
  { name: 'Bardiya', nameNp: 'बर्दिया', province: 'Lumbini', headquarters: 'Gulariya' },
  { name: 'Dang', nameNp: 'दाङ', province: 'Lumbini', headquarters: 'Ghorahi' },
  { name: 'Eastern Rukum', nameNp: 'पूर्वी रुकुम', province: 'Lumbini', headquarters: 'Rukumkot' },
  { name: 'Gulmi', nameNp: 'गुल्मी', province: 'Lumbini', headquarters: 'Tamghas' },
  { name: 'Kapilvastu', nameNp: 'कपिलवस्तु', province: 'Lumbini', headquarters: 'Taulihawa' },
  { name: 'Parasi (Nawalparasi West)', nameNp: 'परासी (नवलपरासी पश्चिम)', province: 'Lumbini', headquarters: 'Ramgram' },
  { name: 'Palpa', nameNp: 'पाल्पा', province: 'Lumbini', headquarters: 'Tansen' },
  { name: 'Pyuthan', nameNp: 'प्युठान', province: 'Lumbini', headquarters: 'Pyuthan' },
  { name: 'Rolpa', nameNp: 'रोल्पा', province: 'Lumbini', headquarters: 'Liwang' },
  { name: 'Rupandehi', nameNp: 'रुपन्देही', province: 'Lumbini', headquarters: 'Siddharthanagar' },

  // Karnali Province (10 districts)
  { name: 'Dailekh', nameNp: 'दैलेख', province: 'Karnali', headquarters: 'Narayan' },
  { name: 'Dolpa', nameNp: 'डोल्पा', province: 'Karnali', headquarters: 'Dunai' },
  { name: 'Humla', nameNp: 'हुम्ला', province: 'Karnali', headquarters: 'Simikot' },
  { name: 'Jajarkot', nameNp: 'जाजरकोट', province: 'Karnali', headquarters: 'Khalanga' },
  { name: 'Jumla', nameNp: 'जुम्ला', province: 'Karnali', headquarters: 'Chandannath' },
  { name: 'Kalikot', nameNp: 'कालिकोट', province: 'Karnali', headquarters: 'Manma' },
  { name: 'Mugu', nameNp: 'मुगु', province: 'Karnali', headquarters: 'Gamgadhi' },
  { name: 'Salyan', nameNp: 'सल्यान', province: 'Karnali', headquarters: 'Salyan' },
  { name: 'Surkhet', nameNp: 'सुर्खेत', province: 'Karnali', headquarters: 'Birendranagar' },
  { name: 'Western Rukum', nameNp: 'पश्चिमी रुकुम', province: 'Karnali', headquarters: 'Musikot' },

  // Sudurpashchim Province (9 districts)
  { name: 'Achham', nameNp: 'अछाम', province: 'Sudurpashchim', headquarters: 'Mangalsen' },
  { name: 'Baitadi', nameNp: 'बैतडी', province: 'Sudurpashchim', headquarters: 'Dasharathchand' },
  { name: 'Bajhang', nameNp: 'बझाङ', province: 'Sudurpashchim', headquarters: 'Jayaprithvi' },
  { name: 'Bajura', nameNp: 'बाजुरा', province: 'Sudurpashchim', headquarters: 'Martadi' },
  { name: 'Dadeldhura', nameNp: 'डडेल्धुरा', province: 'Sudurpashchim', headquarters: 'Amargadhi' },
  { name: 'Darchula', nameNp: 'दार्चुला', province: 'Sudurpashchim', headquarters: 'Khalanga' },
  { name: 'Doti', nameNp: 'डोटी', province: 'Sudurpashchim', headquarters: 'Dipayal Silgadhi' },
  { name: 'Kailali', nameNp: 'कैलाली', province: 'Sudurpashchim', headquarters: 'Dhangadhi' },
  { name: 'Kanchanpur', nameNp: 'कञ्चनपुर', province: 'Sudurpashchim', headquarters: 'Bhimdatta' }
];

export const POPULAR_PSC_FIELDS = [
  'General Administration (सामान्य प्रशासन)',
  'Computer Science / IT (कम्प्युटर / सूचना प्रविधि)',
  'Civil Engineering (सिभिल इन्जिनियरिङ)',
  'Electrical / Mechanical (विद्युतीय तथा मेकानिकल)',
  'Banking & Finance (बैंकिङ तथा वित्तीय)',
  'Health & Nursing (स्वास्थ्य तथा नर्सिङ)',
  'Agriculture & Veterinary (कृषि तथा पशुसेवा)',
  'Law & Judiciary (कानुन तथा न्याय सेवा)',
  'Accounting & Auditing (लेखा तथा लेखापरीक्षण)',
  'Education & Pedagogy (शिक्षा तथा अध्यापन)',
  'Forestry & Environment (वन तथा वातावरण)',
  'Statistics & Economics (तथ्याङ्क तथा अर्थशास्त्र)'
];

export const PSC_JOB_LEVELS = [
  'All Levels (सबै तह)',
  'Officer Level 9 / Under Secretary (सहसचिव / नवौँ तह)',
  'Officer Level 7 / Section Officer (शाखा अधिकृत / सातौँ तह)',
  'Officer Level 6 / Assistant Officer (छैटौँ तह)',
  'Nayab Subba - NaSu (नायब सुब्बा / पाँचौँ तह)',
  'Kharidar (खरिदार / चौथोँ तह)',
  'Assistant Level 4 / 5 (सहायक तह)',
  'Managerial / Executive Level (व्यवस्थापकीय तह)',
  'Technical Assistant / Overseer (प्राविधिक सहायक)'
];

export const REPUTED_ORGANIZATIONS = [
  'Any Organization (कुनै पनि निकाय)',
  'Public Service Commission (Lok Sewa Aayog)',
  'Teachers Service Commission (TSC - शिक्षक सेवा आयोग)',
  'Nepal Rastra Bank (नेपाल राष्ट्र बैंक)',
  'Nepal Electricity Authority (NEA - नेपाल विद्युत प्राधिकरण)',
  'Nepal Telecom (NTC - नेपाल टेलिकम)',
  'Agricultural Development Bank (कृषि विकास बैंक)',
  'Rastriya Banijya Bank (राष्ट्रिय वाणिज्य बैंक)',
  'Nepal Police & APF (नेपाल प्रहरी तथा सशस्त्र प्रहरी)',
  'Provincial Public Service Commissions (प्रदेश लोक सेवा आयोगहरू)',
  'Civil Aviation Authority of Nepal (CAAN)',
  'Employees Provident Fund (कञ्चय कोष)'
];

export const POPULAR_PSC_SUBJECTS = [
  'General Knowledge (GK / सामान्य ज्ञान)',
  'Constitution & Law (संविधान तथा कानुन)',
  'Public Administration & Governance (शासन प्रणाली)',
  'Contemporary Issues (समसामयिक मामिला)',
  'Computer & ICT (कम्प्युटर तथा प्रविधि)',
  'Economics & Planning (अर्थशास्त्र तथा योजना)',
  'Mathematics & Mental Ability (IQ / बौद्धिक परीक्षण)',
  'Civil Engineering Fundamentals',
  'Banking, Accounting & Auditing',
  'Nepali & English Language Proficiency'
];
