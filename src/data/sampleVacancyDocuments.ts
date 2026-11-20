import { ExtractedVacancyDocument } from '../types';

export interface SampleVacancyDocumentItem {
  id: string;
  title: string;
  titleNp: string;
  organization: string;
  category: string;
  fileName: string;
  fileSize: string;
  rawText: string;
}

export const SAMPLE_VACANCY_DOCUMENTS: SampleVacancyDocumentItem[] = [
  {
    id: 'sample_doc_01',
    title: 'PSC Gazette: Section Officer (General Admin & Foreign Affairs) Notice No. 542/081-82',
    titleNp: 'लोक सेवा आयोग: शाखा अधिकृत (प्रशासन तथा परराष्ट्र) सूचना नं. ५४२/०८१-८२',
    organization: 'Public Service Commission (Lok Sewa Aayog)',
    category: 'Lok Sewa (PSC)',
    fileName: 'PSC_Section_Officer_Notice_542_081_82.pdf',
    fileSize: '1.4 MB',
    rawText: `लोक सेवा आयोग, केन्द्रीय कार्यालय
सूचना तथा विज्ञापन शाखा, कमलपोखरी, काठमाडौँ
सूचना नं. ५४२/०८१-८२, विज्ञापन नं. १७२०१-१७२०७/०८१-८२
प्रकाशन मिति: २०८१/०८/२६

नेपाल सरकारका विभिन्न मन्त्रालय तथा निकायहरूमा रिक्त रहेका राजपत्रांकित तृतीय श्रेणी (अप्राविधिक) पदहरूमा खुला तथा समावेशी प्रतियोगितात्मक परीक्षाद्वारा स्थायी पदपूर्ति गर्नुपर्ने भएकोले देहाय बमोजिम योग्यता पुगेका नेपाली नागरिकहरूबाट दरखास्त आह्वान गरिन्छ।

१. पद, सेवा र समूह विवरण:
पद: शाखा अधिकृत (Section Officer)
श्रेणी/तह: राजपत्रांकित तृतीय श्रेणी (Gazetted Class III, Officer Level 7)
सेवा: नेपाल प्रशासन सेवा (सामान्य प्रशासन, लेखा, राजस्व) तथा नेपाल परराष्ट्र सेवा

२. जम्मा माग पद सङ्ख्या तथा कोटा विभाजन:
कुल माग पद सङ्ख्या: ४८ (अठचालीस) जना
- खुला प्रतियोगिता: २६ पद
- महिला: ०७ पद
- आदिवासी/जनजाति: ०६ पद
- मधेसी: ०५ पद
- दलित: ०२ पद
- अपाङ्गता भएका व्यक्ति: ०१ पद
- पिछडिएको क्षेत्र: ०१ पद

३. आवश्यक न्यूनतम शैक्षिक योग्यता:
मान्यता प्राप्त शिक्षण संस्थाबाट कुनै पनि विषयमा कम्तीमा स्नातक तह (Bachelor's Degree) वा सो सरहको उपाधि हासिल गरेको हुनुपर्नेछ। परराष्ट्र सेवाको हकमा अंग्रेजी विषय सहित स्नातक तह उत्तीर्ण गरेको वा अंग्रेजीमा विशेष दक्षता भएको हुनुपर्नेछ।

४. अनुभव सम्बन्धी व्यवस्था:
खुला प्रतिस्पर्धात्मक प्रवेश पद भएकाले पूर्व सरकारी कार्य अनुभव अनिवार्य गरिएको छैन।

५. उमेरको हद:
दरखास्त दिने अन्तिम मिति २०८३/०५/३१ सम्ममा २१ वर्ष पूरा भई ३५ वर्ष ननाघेको हुनुपर्नेछ। महिला तथा अपाङ्गता भएका उम्मेदवारहरूको हकमा ४० वर्ष ननाघेको हुनुपर्नेछ। बहालवाला स्थायी निजामती कर्मचारीहरूको हकमा उमेरको हद लाग्ने छैन।

६. दरखास्त दस्तुर:
- राजपत्रांकित तृतीय श्रेणीका लागि परीक्षा दस्तुर रु. १,२००/- (एक हजार दुई सय रुपैयाँ)।
- एकभन्दा बढी समावेशी समूहमा दरखास्त दिने उम्मेदवारले प्रत्येक थप समूहका लागि रु. ४००/- (चार सय रुपैयाँ) का दरले थप दस्तुर बुझाउनुपर्नेछ।

७. दरखास्त पेश गर्ने मिति र म्याद:
- सिङ्गल दस्तुरमा दरखास्त दिने अन्तिम मिति: २०८३/०५/३१ सम्म।
- दोब्बर दस्तुर तिरी दरखास्त दिने अन्तिम मिति: २०८३/०६/०७ सम्म।

८. लिखित परीक्षा संचालन मिति र समय:
- प्रथम चरण (प्रशासनिक अभिरुचि परीक्षण - GK & IQ): मिति २०८३/०७/१० बिहान ११:०० बजे।
- द्वितीय चरण (समसामयिक मामिला तथा शासन प्रणाली): २०८३/०८/०५ देखि।
- परीक्षा केन्द्रहरू: आयोगका धनकुटा, जलेश्वर, काठमाडौँ, पोखरा, बुटवल, सुर्खेत र दिपायल कार्यालयहरू।

९. तलब तथा सेवा सुविधाहरू:
नेपाल सरकारको राजपत्रांकित तृतीय श्रेणीको सुरु तलब स्केल रु. ४३,६८९/- प्रतिमहिना, ग्रेड तथा महँगी भत्ता, पोशाक भत्ता र नागरिक लगानी कोष/कर्मचारी सञ्चय कोष सुविधा।

१०. पेश गर्नुपर्ने आवश्यक कागजातहरू:
(क) नेपाली नागरिकताको प्रमाणपत्रको प्रतिलिपि।
(ख) न्यूनतम शैक्षिक योग्यताको लब्धाङ्क पत्र (Transcript), चारित्रिक प्रमाणपत्र तथा विदेशी विश्वविद्यालय भए समकक्षता निर्धारण (Equivalence) प्रमाणपत्र।
(ग) समावेशी समूह खुल्ने आधिकारिक निकाय (जिल्ला प्रशासन कार्यालय / राष्ट्रिय महिला आयोग / आदिवासी जनजाति प्रतिष्ठान / राष्ट्रिय दलित आयोग / मधेसी आयोग) बाट जारी सिफारिस पत्र।
(घ) हालसालै खिचिएको पासपोर्ट साइजको फोटो तथा डिजिटल हस्ताक्षर।

११. दरखास्त दिने विधि तथा प्रक्रिया:
आयोगको आधिकारिक अनलाइन दरखास्त पोर्टल https://psconline.psc.gov.np मार्फत फाराम भरी अनलाइन पेमेन्ट (eSewa, Khalti, ConnectIPS) वा बैंक भौचर प्रिन्ट गरी तोकिएको बैंकमा दस्तुर बुझाउन सकिनेछ।`
  },
  {
    id: 'sample_doc_02',
    title: 'Nepal Rastra Bank: Assistant Director (Officer Level 3) Gazette Ad No. 12/2081-82',
    titleNp: 'नेपाल राष्ट्र बैंक: सहायक निर्देशक (अधिकृत तृतीय) विज्ञापन नं. १२/२०८१-८२',
    organization: 'Nepal Rastra Bank (Central Bank of Nepal)',
    category: 'Banking & Finance',
    fileName: 'NRB_Assistant_Director_Ad_12_2081.pdf',
    fileSize: '980 KB',
    rawText: `नेपाल राष्ट्र बैंक, केन्द्रीय कार्यालय
जनशक्ति व्यवस्थापन विभाग, बालुवाटार, काठमाडौँ
कर्मचारी आवश्यकता सम्बन्धी सूचना
विज्ञापन नं. १२/२०८१-८२ (खुला तथा समावेशी प्रतियोगिता)
प्रकाशन मिति: २०८१/०९/०५

नेपाल राष्ट्र बैंकमा रिक्त रहेको देहायको अधिकृत पदमा खुला प्रतियोगितात्मक परीक्षाद्वारा पदपूर्ति गर्न योग्यता पुगेका योग्य नेपाली नागरिकहरूबाट दरखास्त आह्वान गरिन्छ।

१. पद: सहायक निर्देशक (Assistant Director)
२. श्रेणी/तह: अधिकृत तृतीय (Officer Class III)
३. सेवा: प्रशासन सेवा

४. माग पद सङ्ख्या र आरक्षण कोटा:
कुल माग पद: २५ (पच्चीस) जना
- खुला: १४ जना
- महिला: ०४ जना
- आदिवासी जनजाति: ०३ जना
- मधेसी: ०२ जना
- दलित: ०१ जना
- अपाङ्ग: ०१ जना

५. आवश्यक न्यूनतम योग्यता:
मान्यता प्राप्त विश्वविद्यालयबाट अर्थशास्त्र (Economics), वाणिज्यशास्त्र (Commerce), व्यवस्थापन (Management), व्यापार प्रशासन (MBA/MBS) वा जनप्रशासन (MPA) विषयमा कम्तीमा स्नातकोत्तर तह (Master's Degree) प्रथम श्रेणी वा न्यूनतम CGPA 3.0 सहित उत्तीर्ण गरेको।

६. अनुभव:
यस पदका लागि पूर्व अनुभव अनिवार्य गरिएको छैन।

७. उमेरको हद:
दरखास्त दिने अन्तिम मितिसम्ममा २१ वर्ष पूरा भई ३५ वर्ष ननाघेको (महिला उम्मेदवारको हकमा ४० वर्ष ननाघेको)। बैंकका बहालवाला कर्मचारीको हकमा उमेरको हद लाग्ने छैन।

८. दरखास्त दस्तुर:
रु. १,०००/- (एक हजार रुपैयाँ)। समावेशी समूहका उम्मेदवारले थप समूहका लागि प्रति समूह रु. ३००/- थप दस्तुर बुझाउनुपर्नेछ।

९. दरखास्त पेश गर्ने मिति:
- साधारण म्याद: २०८३/०६/०१ देखि २०८३/०६/२१ सम्म।
- दोब्बर दस्तुर म्याद: २०८३/०६/२२ देखि २०८३/०६/२८ सम्म।

१०. लिखित परीक्षा मिति:
प्रथम चरणको लिखित पूर्व-योग्यता परीक्षा (Pre-qualifying Objective Exam) मिति २०८३/०७/२५ गते दिउँसो १:०० बजे काठमाडौँमा संचालन हुनेछ।

११. पारिश्रमिक तथा सेवा सुविधा:
बैंकको कर्मचारी सेवा विनियमावली अनुसार सुरु मासिक तलब स्केल रु. ५४,०००/-, बैंक अलाउन्स, प्रोभिडेन्ट फण्ड, उपदान, आवास कर्जा तथा वार्षिक बोनस सुविधा।

१२. आवश्यक कागजात:
नागरिकताको प्रमाणपत्र, स्नातकोत्तर तहको ट्रान्सक्रिप्ट र क्यारेक्टर सर्टिफिकेट, समकक्षता प्रमाणपत्र (आवश्यक भएमा), समावेशी समूहको प्रमाण।

१३. दरखास्त दिने प्रक्रिया:
बैंकको अनलाइन रिक्रुटमेन्ट पोर्टल https://jobs.nrb.org.np मार्फत अनलाइन फाराम भर्नुपर्नेछ। दस्तुर कनेक्ट आईपीएस वा इसेवा मार्फत सिधै अनलाइन भुक्तानी गर्न सकिनेछ।`
  },
  {
    id: 'sample_doc_03',
    title: 'Teachers Service Commission: Secondary Level Science Teacher Ad No. 34/081-82',
    titleNp: 'शिक्षक सेवा आयोग: माध्यमिक तह विज्ञान शिक्षक विज्ञापन नं. ३४/०८१-८२',
    organization: 'Teachers Service Commission (TSC Nepal)',
    category: 'Teacher Service (TSC)',
    fileName: 'TSC_Secondary_Science_Teacher_34_081.pdf',
    fileSize: '1.1 MB',
    rawText: `शिक्षक सेवा आयोग, सानोठिमी, भक्तपुर
सामुदायिक विद्यालयहरूमा रिक्त माध्यमिक तह, तृतीय श्रेणी, शिक्षक पदको खुला तथा समावेशी प्रतियोगितात्मक परीक्षाको विज्ञापन
विज्ञापन नं. ३४/०८१-८२
प्रकाशन मिति: २०८१/०८/१५

सामुदायिक विद्यालयहरूमा रिक्त रहेको देहाय बमोजिमको माध्यमिक तह तृतीय श्रेणी शिक्षक पदमा स्थायी पदपूर्ति गर्नुपर्ने भएकोले न्यूनतम योग्यता पुगेका उम्मेदवारहरूबाट दरखास्त आह्वान गरिन्छ।

१. पद: माध्यमिक तह शिक्षक (Secondary Level Teacher - Science & Mathematics)
२. श्रेणी/तह: माध्यमिक तह, तृतीय श्रेणी
३. सेवा: नेपाल शिक्षक सेवा

४. माग पद सङ्ख्या:
कुल माग पद: ६५ (पैंसठ्ठी) जना
- खुला: ३६ जना
- महिला: १० जना
- आदिवासी जनजाति: ०९ जना
- मधेसी: ०७ जना
- दलित: ०२ जना
- अपाङ्गता: ०१ जना

५. आवश्यक न्यूनतम योग्यता:
(क) मान्यता प्राप्त शिक्षण संस्थाबाट सम्बन्धित विषयमा विज्ञान (B.Sc) वा गणित विषयमा कम्तीमा स्नातक तह उत्तीर्ण गरेको।
(ख) कम्तीमा १० महिने शिक्षक तालिम प्राप्त गरेको वा शिक्षा शास्त्रमा स्नातक (B.Ed) उत्तीर्ण।
(ग) माध्यमिक तहको स्थायी अध्यापन अनुमति पत्र (Permanent Teaching License) प्राप्त गरेको अनिवार्य।

६. उमेरको हद:
दरखास्त दिने अन्तिम मितिसम्ममा १८ वर्ष पूरा भई ४० वर्ष ननाघेको हुनुपर्नेछ। बहालवाला स्थायी शिक्षकहरूको हकमा उमेरको हद लाग्ने छैन।

७. परीक्षा दस्तुर:
परीक्षा दस्तुर रु. १,०००/- (एक हजार रुपैयाँ)। समावेशी समूहका लागि थप दस्तुर रु. ५००/- प्रति समूह।

८. दरखास्त दिने म्याद:
- सिङ्गल दस्तुरमा: २०८३/०५/१५ सम्म।
- दोब्बर दस्तुरमा: २०८३/०५/२२ सम्म।

९. परीक्षा संचालन मिति:
सामान्य परीक्षा (प्रथम पत्र): २०८३/०६/२० गते दिउँसो १:०० बजे। विषयगत परीक्षा प्रथम पत्र उत्तीर्ण भएपछि प्रकाशित गरिनेछ।

१०. पारिश्रमिक:
नेपाल सरकारले तोकेको माध्यमिक तह तृतीय श्रेणी शिक्षकको प्रचलित तलबमान (रु. ४३,६८९/- तथा महँगी भत्ता)।

११. दरखास्त प्रक्रिया:
आयोगको अनलाइन दरखास्त प्रणाली https://online.tsc.gov.np मार्फत फाराम भर्नुपर्नेछ। राष्ट्रिय वाणिज्य बैंक वा नेपाल बैंकमा भौचर बुझाई वा अनलाइन भुक्तानी गर्न सकिनेछ।

१२. कागजातहरू:
नागरिकता, अध्यापन अनुमति पत्र (Teaching License), शैक्षिक योग्यताका प्रमाणपत्रहरू, तालिम प्रमाणपत्र र समावेशी समूह प्रमाणित कागजात।`
  },
  {
    id: 'sample_doc_04',
    title: 'Nepal Police HQ: Assistant Sub Inspector (ASI) Open Competition Notice No. 04/081-82',
    titleNp: 'नेपाल प्रहरी: प्रहरी सहायक निरीक्षक (ASI) विज्ञापन नं. ०४/०८१-८२',
    organization: 'Nepal Police Headquarters (Naxal, Kathmandu)',
    category: 'Security Forces',
    fileName: 'Nepal_Police_ASI_Open_Notice_04_081.pdf',
    fileSize: '1.8 MB',
    rawText: `नेपाल प्रहरी प्रधान कार्यालय, भर्ना छनौट शाखा, नक्साल, काठमाडौँ
प्रहरी सहायक निरीक्षक (ASI - जनपद) पदमा खुला प्रतियोगिताद्वारा समावेशी प्रावधान अनुसार पदपूर्ति गर्ने सम्बन्धी विज्ञापन
विज्ञापन नं. ०४/०८१-८२
प्रकाशन मिति: २०८१/०७/१०

नेपाल प्रहरीमा रिक्त रहेको प्रहरी सहायक निरीक्षक (जनपद) पदमा खुला प्रतियोगितात्मक परीक्षाद्वारा पदपूर्ति गर्न देहाय बमोजिम योग्यता पुगेका नेपाली नागरिकहरूबाट दरखास्त फाराम आह्वान गरिन्छ।

१. पद: प्रहरी सहायक निरीक्षक (Assistant Sub Inspector - ASI)
२. श्रेणी/तह: राजपत्र अनंकित प्रथम श्रेणी (Non-Gazetted 1st Class)
३. सेवा: नेपाल प्रहरी सेवा (जनपद)

४. माग पद सङ्ख्या र आरक्षण विवरण:
कुल पद सङ्ख्या: १३५ (एक सय पैंतीस) जना
- खुला: ७३ जना
- अमर/अशक्त प्रहरी परिवार: ०३ जना
- महिला: १२ जना
- आदिवासी जनजाति: १९ जना
- मधेसी: १७ जना
- दलित: ०९ जना
- पिछडिएको क्षेत्र: ०२ जना

५. आवश्यक न्यूनतम शैक्षिक योग्यता:
मान्यता प्राप्त शिक्षण संस्थाबाट प्रवीणता प्रमाणपत्र तह (Intermediate / +2 High School) वा सो सरह उत्तीर्ण गरेको।

६. शारीरिक मापदण्ड तथा तन्दुरुस्ती:
- पुरुष: उचाइ कम्तीमा ५ फिट २ इन्च, छाती ३१-३३ इन्च, तौल कम्तीमा ५० केजी, आँखा +2 वा -2 भन्दा कमजोर नभएको।
- महिला: उचाइ कम्तीमा ५ फिट, तौल कम्तीमा ४२ केजी।

७. उमेरको हद:
दरखास्त दिने अन्तिम मितिसम्ममा १८ वर्ष पूरा भई २४ वर्ष ननाघेको (बहालवाला प्रहरी जवान/हवल्दारको हकमा २५ वर्ष ननाघेको)।

८. परीक्षा दस्तुर:
दरखास्त फाराम दस्तुर रु. ५००/- (प्रत्येक समावेशी समूहका लागि रु. १००/- थप दस्तुर)।

९. दरखास्त पेश गर्ने अवधि:
मिति २०८३/०६/०५ देखि २०८३/०७/०४ सम्म।

१०. परीक्षाका चरणहरू:
(१) प्रारम्भिक स्वास्थ्य परीक्षण तथा शारीरिक तन्दुरुस्ती परीक्षा (Physical Fitness Test - 1.6 km run, pushups, situps)
(२) विस्तृत स्वास्थ्य परीक्षण (Detailed Medical Checkup)
(३) लिखित परीक्षा (लोक सेवा आयोगद्वारा संचालन हुने: नेपाली, अंग्रेजी, सामान्य ज्ञान, गणित तथा पेशागत अभिबृद्धि)
(४) विशेष स्वास्थ्य परीक्षण
(५) सक्षमता मूल्याङ्कन तथा अन्तर्वार्ता।

११. तलब तथा राशन सुविधा:
नेपाल प्रहरीको राजपत्र अनंकित प्रथम श्रेणीको मासिक तलबमान (रु. ३२,९०२/-), निशुल्क राशन, युनिफर्म तथा प्रहरी कल्याणकारी कोष सुविधा।

१२. दरखास्त बुझाउने स्थानहरू:
सातै प्रदेश प्रहरी तालिम केन्द्रहरू (विराटनगर, जनकपुर, दुधौली, पोखरा, बुटवल, सुर्खेत, दिपायल) तथा काठमाडौँ उपत्यका प्रहरी शिक्षालय महाराजगञ्ज।`
  },
  {
    id: 'sample_doc_05',
    title: 'Bagmati Province PSC: Staff Nurse / Health Assistant Level 5 Gazette No. 822/081-82',
    titleNp: 'बागमती प्रदेश लोक सेवा आयोग: स्टाफ नर्स / हेल्थ असिस्टेन्ट पाँचौँ तह सूचना नं. ८२२/०८१-८२',
    organization: 'Province Public Service Commission, Bagmati Province',
    category: 'Provincial Lok Sewa',
    fileName: 'Bagmati_PPSC_Staff_Nurse_HA_Level5_822.pdf',
    fileSize: '1.2 MB',
    rawText: `प्रदेश लोक सेवा आयोग, बागमती प्रदेश, हेटौँडा
सूचना तथा विज्ञापन शाखा
प्राविधिक तर्फ स्वास्थ्य सेवाका पाँचौँ तहका पदहरूको खुला तथा समावेशी प्रतियोगितात्मक लिखित परीक्षाको विज्ञापन
विज्ञापन नं. ८२२-८२८/०८१-८२
प्रकाशन मिति: २०८१/०९/१०

बागमती प्रदेश तथा अन्तर्गतका स्थानीय तहहरूमा रिक्त रहेका स्वास्थ्य सेवा तर्फका पाँचौँ तहका पदहरूमा स्थायी पदपूर्ति गर्न देहाय बमोजिम योग्यता पुगेका उम्मेदवारहरूबाट दरखास्त आह्वान गरिन्छ।

१. पद: स्टाफ नर्स (Staff Nurse) / हेल्थ असिस्टेन्ट (Health Assistant - HA)
२. श्रेणी/तह: सहायक स्तर पाँचौँ तह (Level 5 Technical)
३. सेवा: नेपाल स्वास्थ्य सेवा (जनरल नर्सिङ / पब्लिक हेल्थ)

४. कुल माग पद सङ्ख्या:
जम्मा पद: ३२ (बत्तीस) जना
- खुला: १८ जना
- महिला: ०५ जना
- आदिवासी जनजाति: ०४ जना
- मधेसी: ०३ जना
- दलित: ०१ जना
- अपाङ्ग: ०१ जना

५. आवश्यक न्यूनतम शैक्षिक योग्यता:
मान्यता प्राप्त शिक्षण संस्थाबाट नर्सिङ वा सामान्य चिकित्सा (General Medicine) विषयमा प्रमाणपत्र तह (PCL Nursing / HA) उत्तीर्ण गरी सम्बन्धित काउन्सिल (नेपाल नर्सिङ काउन्सिल वा नेपाल स्वास्थ्य व्यवसायी परिषद् - NHPC) मा स्थायी/अद्यावधिक दर्ता भएको।

६. उमेरको हद:
दरखास्त दिने अन्तिम मितिसम्ममा १८ वर्ष पूरा भई ४० वर्ष ननाघेको (स्वास्थ्य सेवा तर्फ उमेरको अधिकतम हद ४० वर्ष रहने कानुनी व्यवस्था अनुसार)।

७. परीक्षा दस्तुर:
रु. ७००/- (प्रत्येक थप समावेशी समूहका लागि रु. २००/- का दरले थप दस्तुर)।

८. दरखास्त म्याद:
- सिङ्गल दस्तुरमा: २०८३/०६/१५ सम्म।
- दोब्बर दस्तुरमा: २०८३/०६/२२ सम्म।

९. लिखित परीक्षा मिति:
प्रथम पत्र (स्वास्थ्य सेवा सामान्य ज्ञान र प्राविधिक विषय): २०८३/०७/१८ बिहान ८:०० बजे हेटौँडामा।

१०. तलब तथा सेवा सुविधा:
प्रदेश निजामती तथा स्थानीय सेवाको पाँचौँ तहको प्रचलित तलबमान (रु. ३४,७३०/- तथा स्थानीय स्वास्थ्य भत्ता)।

११. दरखास्त दिने माध्यम:
प्रदेश लोक सेवा आयोगको अनलाइन पोर्टल https://ppsconline.bagamati.gov.np मार्फत पेश गर्नुपर्नेछ।

१२. आवश्यक कागजात:
नागरिकता, PCL ट्रान्सक्रिप्ट र क्यारेक्टर सर्टिफिकेट, नेपाल नर्सिङ काउन्सिल/NHPC दर्ता प्रमाणपत्र, समावेशी सिफारिस।`
  }
];

export const INITIAL_EXTRACTED_VACANCY_DOCUMENTS: ExtractedVacancyDocument[] = [
  {
    id: 'ext_doc_001',
    fileName: 'PSC_Section_Officer_Notice_542_081_82.pdf',
    fileSize: '1.4 MB',
    documentType: 'pdf',
    rawDocumentText: SAMPLE_VACANCY_DOCUMENTS[0].rawText,
    extractedAt: '2026-08-18 16:30:00',
    status: 'PENDING_REVIEW',
    adminNotes: 'Awaiting final administrative sign-off on quota breakdown and fee deadline validation.',

    organization: {
      value: 'Public Service Commission (Lok Sewa Aayog)',
      sourceReference: "Heading: 'लोक सेवा आयोग, केन्द्रीय कार्यालय सूचना तथा विज्ञापन शाखा, कमलपोखरी'",
      confidenceScore: 99
    },
    shortOrg: {
      value: 'Lok Sewa Aayog',
      sourceReference: "Header: 'लोक सेवा आयोग'",
      confidenceScore: 98
    },
    organizationNp: {
      value: 'लोक सेवा आयोग, केन्द्रीय कार्यालय',
      sourceReference: "Heading line 1: 'लोक सेवा आयोग, केन्द्रीय कार्यालय'",
      confidenceScore: 99
    },

    position: {
      value: 'Section Officer (Gazetted Class III)',
      sourceReference: "Section 1: 'पद: शाखा अधिकृत (Section Officer) श्रेणी/तह: राजपत्रांकित तृतीय श्रेणी'",
      confidenceScore: 98
    },
    positionNp: {
      value: 'शाखा अधिकृत (रा.प.तृतीय श्रेणी)',
      sourceReference: "Section 1: 'पद: शाखा अधिकृत (रा.प.तृतीय श्रेणी, अप्राविधिक)'",
      confidenceScore: 98
    },
    serviceGroup: {
      value: 'Nepal Administration Service (General Admin, Accounts) & Foreign Affairs',
      sourceReference: "Section 1: 'सेवा: नेपाल प्रशासन सेवा (सामान्य प्रशासन, लेखा, राजस्व) तथा नेपाल परराष्ट्र सेवा'",
      confidenceScore: 96
    },
    level: {
      value: 'Gazetted Class III (Officer Level 7)',
      sourceReference: "Section 1: 'राजपत्रांकित तृतीय श्रेणी'",
      confidenceScore: 97
    },
    category: {
      value: 'Lok Sewa (PSC)',
      sourceReference: "Header & Title: 'लोक सेवा आयोग केन्द्रीय कार्यालय'",
      confidenceScore: 99
    },
    province: {
      value: 'All Nepal',
      sourceReference: "Section 8: 'परीक्षा केन्द्रहरू: आयोगका धनकुटा, जलेश्वर, काठमाडौँ, पोखरा, बुटवल, सुर्खेत र दिपायल कार्यालयहरू'",
      confidenceScore: 95
    },

    numberOfPosts: {
      value: 48,
      sourceReference: "Section 2: 'कुल माग पद सङ्ख्या: ४८ (अठचालीस) जना'",
      confidenceScore: 99
    },
    quotaBreakdown: {
      value: {
        open: 26,
        female: 7,
        janajati: 6,
        madhesi: 5,
        dalit: 2,
        apanga: 1,
        pichhadiye: 1
      },
      sourceReference: "Section 2: 'खुला: २६, महिला: ०७, आदिवासी/जनजाति: ०६, मधेसी: ०५, दलित: ०२, अपाङ्गता: ०१, पिछडिएको क्षेत्र: ०१'",
      confidenceScore: 98
    },

    qualification: {
      value: "Bachelor's Degree in any recognized discipline from a recognized university",
      sourceReference: "Section 3: 'मान्यता प्राप्त शिक्षण संस्थाबाट कुनै पनि विषयमा कम्तीमा स्नातक तह (Bachelor's Degree) वा सो सरहको उपाधि हासिल गरेको'",
      confidenceScore: 98
    },
    qualificationLevel: {
      value: 'Bachelor Degree',
      sourceReference: "Section 3: 'स्नातक तह (Bachelor's Degree)'",
      confidenceScore: 99
    },

    requiredField: {
      value: ['All Disciplines Recognized for Administration', 'English for Foreign Affairs', 'Management / Commerce / Economics'],
      sourceReference: "Section 3: 'कुनै पनि विषयमा कम्तीमा स्नातक तह... परराष्ट्र सेवाको हकमा अंग्रेजी विषय सहित स्नातक'",
      confidenceScore: 95
    },

    experience: {
      value: 'No prior government experience required for open entry-level competition.',
      sourceReference: "Section 4: 'खुला प्रतिस्पर्धात्मक प्रवेश पद भएकाले पूर्व सरकारी कार्य अनुभव अनिवार्य गरिएको छैन।'",
      confidenceScore: 96
    },
    minimumExperienceYears: {
      value: 0,
      sourceReference: "Section 4: 'अनुभव अनिवार्य गरिएको छैन'",
      confidenceScore: 98
    },

    age: {
      value: {
        minAge: 21,
        maxAgeMale: 35,
        maxAgeFemaleDisabled: 40
      },
      sourceReference: "Section 5: '२१ वर्ष पूरा भई ३५ वर्ष ननाघेको... महिला तथा अपाङ्गता भएका उम्मेदवारहरूको हकमा ४० वर्ष ननाघेको'",
      confidenceScore: 98
    },

    fee: {
      value: {
        singleFee: 1200,
        doubleFee: 2400,
        inclusiveGroupExtraFee: 400
      },
      sourceReference: "Section 6 & 7: 'परीक्षा दस्तुर रु. १,२००/-... थप समूहका लागि रु. ४००/-... दोब्बर दस्तुर तिरी'",
      confidenceScore: 97
    },

    applicationDates: {
      value: {
        startDate: '2026-08-15',
        singleFeeDeadline: '2026-09-15',
        doubleFeeDeadline: '2026-09-22'
      },
      sourceReference: "Section 7: 'सिङ्गल दस्तुरमा २०८३/०५/३१ सम्म। दोब्बर दस्तुर तिरी २०८३/०६/०७ सम्म।'",
      confidenceScore: 98
    },

    deadline: {
      value: '2026-09-15',
      sourceReference: "Section 7: 'सिङ्गल दस्तुरमा दरखास्त दिने अन्तिम मिति: २०८३/०५/३१ सम्म'",
      confidenceScore: 99
    },

    examDate: {
      value: '2026-10-26',
      sourceReference: "Section 8: 'प्रथम चरण (GK & IQ): मिति २०८३/०७/१० बिहान ११:०० बजे'",
      confidenceScore: 96
    },
    examCenter: {
      value: 'PSC Examination Centers Nationwide (Kathmandu, Pokhara, Dhankuta, Butwal, Surkhet, Dipayal, Jaleshwor)',
      sourceReference: "Section 8: 'धनकुटा, जलेश्वर, काठमाडौँ, पोखरा, बुटवल, सुर्खेत र दिपायल कार्यालयहरू'",
      confidenceScore: 95
    },

    salary: {
      value: 'NPR 43,689/month base scale + statutory grade, dearness allowance, and Provident Fund',
      sourceReference: "Section 9: 'राजपत्रांकित तृतीय श्रेणीको सुरु तलब स्केल रु. ४३,६८९/- प्रतिमहिना, ग्रेड तथा महँगी भत्ता'",
      confidenceScore: 96
    },
    payScaleGrade: {
      value: 'Gazetted Class III Pay Scale (Level 7)',
      sourceReference: "Section 9: 'राजपत्रांकित तृतीय श्रेणीको सुरु तलब स्केल'",
      confidenceScore: 95
    },

    requiredDocuments: {
      value: [
        'Nepali Citizenship Certificate (नागरिकताको प्रमाणपत्र)',
        "Bachelor's Degree Academic Transcript & Character Certificate",
        'Equivalence Certificate from Tribhuvan University (if foreign degree)',
        'Inclusive Group Official Certification (महिला/जनजाति/मधेसी/दलित/अपाङ्ग/पिछडिएको सिफारिस पत्र)',
        'Recent Passport Size Photograph & Digital Signature'
      ],
      sourceReference: "Section 10: 'नागरिकताको प्रतिलिपि, लब्धाङ्क पत्र, चारित्रिक प्रमाणपत्र, समकक्षता, समावेशी सिफारिस, पासपोर्ट फोटो'",
      confidenceScore: 98
    },

    applicationProcedure: {
      value: 'Apply strictly via the official Public Service Commission web portal (https://psconline.psc.gov.np). Pay online through ConnectIPS, eSewa, Khalti, or print voucher for designated banks.',
      sourceReference: "Section 11: 'आयोगको आधिकारिक अनलाइन दरखास्त पोर्टल https://psconline.psc.gov.np मार्फत फाराम भरी अनलाइन पेमेन्ट (eSewa, Khalti, ConnectIPS)'",
      confidenceScore: 97
    },
    applyUrl: {
      value: 'https://psconline.psc.gov.np',
      sourceReference: "Section 11: 'https://psconline.psc.gov.np'",
      confidenceScore: 99
    },
    noticeNumber: {
      value: '५४२/०८१-८२ (वि.नं. १७२०१-१७२०७/०८१-८२)',
      sourceReference: "Heading: 'सूचना नं. ५४२/०८१-८२, विज्ञापन नं. १७२०१-१७२०७/०८१-८२'",
      confidenceScore: 99
    },

    description: {
      value: 'Official open and inclusive competitive examination for Section Officer (Gazetted Class III) under Nepal Administration Service and Foreign Affairs.',
      sourceReference: "Introductory Paragraph: 'राजपत्रांकित तृतीय श्रेणी (अप्राविधिक) पदहरूमा खुला तथा समावेशी प्रतियोगितात्मक परीक्षा'",
      confidenceScore: 96
    },

    validationReport: {
      overallScore: 98,
      quotaMathCheck: {
        passed: true,
        score: 100,
        label: 'Quota Mathematical Consistency',
        feedback: 'Sub-quota categories (26+7+6+5+2+1+1) sum exactly to the declared total of 48 posts.',
        details: '26 Open + 7 Female + 6 Janajati + 5 Madhesi + 2 Dalit + 1 Disabled + 1 Backward = 48'
      },
      dateChronometryCheck: {
        passed: true,
        score: 100,
        label: 'Date Chronometry & Sequencing',
        feedback: 'Valid logical sequence: Start Date < Single Fee Deadline < Double Fee Deadline < Exam Date.',
        details: '2026-08-15 <= 2026-09-15 <= 2026-09-22 < 2026-10-26'
      },
      ageBoundsCheck: {
        passed: true,
        score: 98,
        label: 'Age Eligibility Constraints',
        feedback: 'Adheres strictly to Civil Service Act 2049 (21 to 35 years for male, 40 years for female/disabled).',
        details: 'Min: 21, Max Male: 35, Max Female/Disabled: 40'
      },
      feeSanityCheck: {
        passed: true,
        score: 96,
        label: 'Fee Structure Sanity',
        feedback: 'Single fee NPR 1,200 with NPR 400 inclusive increments conforms to standard Gazetted Class III fee schedules.',
        details: 'Base: NPR 1,200, Double: NPR 2,400, Inclusive: NPR 400'
      },
      groundingCitationCheck: {
        passed: true,
        score: 98,
        label: 'Zero-Hallucination Grounding Audit',
        feedback: 'All 14 extracted fields have verifiable verbatim citation excerpts matching source document text.',
        details: '14 of 14 fields cited with high confidence'
      },
      completenessCheck: {
        passed: true,
        score: 100,
        label: 'Field Completeness',
        feedback: 'All 14 essential recruitment fields extracted without omission.',
        details: 'Organization, Position, Quota, Qualifications, Age, Fees, Deadlines, Exams, Documents, Procedure present.'
      },
      flags: []
    }
  }
];
