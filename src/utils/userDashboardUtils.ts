import {
  Vacancy,
  UserProfile,
  QuizSet,
  RecentlyViewedItem,
  TopicAccuracyStat
} from '../types';

const RECENTLY_VIEWED_KEY = 'sarkarisajha_recently_viewed';

/**
 * Records a vacancy view in local storage
 */
export function recordRecentlyViewed(vacancyId: string): RecentlyViewedItem[] {
  if (!vacancyId) return getRecentlyViewed();
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    let list: RecentlyViewedItem[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) list = [];

    // Filter out previous entry if any and prepend to front
    list = list.filter(item => item.vacancyId !== vacancyId);
    list.unshift({
      vacancyId,
      viewedAt: new Date().toISOString()
    });

    // Cap at 30 items
    list = list.slice(0, 30);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(list));
    return list;
  } catch (e) {
    console.warn('Could not save recently viewed vacancy to localStorage:', e);
    return [];
  }
}

/**
 * Gets list of recently viewed vacancy items
 */
export function getRecentlyViewed(): RecentlyViewedItem[] {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    console.warn('Could not read recently viewed vacancies:', e);
    return [];
  }
}

/**
 * Clears recently viewed items
 */
export function clearRecentlyViewed(): void {
  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  } catch (e) {
    console.warn('Could not clear recently viewed items:', e);
  }
}

export interface ClosingSoonVacancyInfo {
  vacancy: Vacancy;
  daysRemaining: number;
  hoursRemaining: number;
  isUrgent: boolean; // < 48 hours
  isClosingToday: boolean;
  statusLabelEn: string;
  statusLabelNp: string;
}

/**
 * Filters and ranks vacancies with upcoming deadlines
 */
export function getClosingSoonVacancies(vacancies: Vacancy[], daysThreshold: number = 30): ClosingSoonVacancyInfo[] {
  const now = new Date();
  const closingList: ClosingSoonVacancyInfo[] = [];

  vacancies.forEach(v => {
    const deadlineStr = v.application_deadline || v.deadline || v.singleFeeDeadline;
    if (!deadlineStr) return;

    // Parse date at 23:59:59 of deadline date
    const dParts = deadlineStr.split('-');
    if (dParts.length < 3) return;

    const deadlineDate = new Date(Number(dParts[0]), Number(dParts[1]) - 1, Number(dParts[2]), 23, 59, 59);
    const diffMs = deadlineDate.getTime() - now.getTime();

    // If already passed or more than threshold days away, ignore
    if (diffMs < 0) return;

    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const totalDays = Math.floor(totalHours / 24);

    if (totalDays <= daysThreshold) {
      const isUrgent = totalHours <= 48;
      const isClosingToday = totalHours <= 24;

      let statusLabelEn = '';
      let statusLabelNp = '';

      if (totalHours <= 12) {
        statusLabelEn = `Closes in ${totalHours}h (Today)`;
        statusLabelNp = `आज बन्द हुँदै (${totalHours} घण्टा बाँकी)`;
      } else if (totalDays === 0) {
        statusLabelEn = 'Closing Today';
        statusLabelNp = 'आज अन्तिम दिन';
      } else if (totalDays === 1) {
        statusLabelEn = 'Closes Tomorrow (1 day left)';
        statusLabelNp = 'भोलि बन्द हुँदै (१ दिन बाँकी)';
      } else {
        statusLabelEn = `${totalDays} days remaining`;
        statusLabelNp = `${totalDays} दिन बाँकी`;
      }

      closingList.push({
        vacancy: v,
        daysRemaining: totalDays,
        hoursRemaining: totalHours,
        isUrgent,
        isClosingToday,
        statusLabelEn,
        statusLabelNp
      });
    }
  });

  // Sort soonest deadline first
  return closingList.sort((a, b) => a.hoursRemaining - b.hoursRemaining);
}

export interface RecommendedVacancyMatch {
  vacancy: Vacancy;
  matchScore: number;
  matchReasonsEn: string[];
  matchReasonsNp: string[];
  isTopMatch: boolean;
}

const QUALIFICATION_RANK: Record<string, number> = {
  'SEE/SLC': 1,
  '+2 High School': 2,
  'Bachelor Degree': 3,
  'Master Degree': 4,
  'MPhil/PhD': 5
};

/**
 * Matches vacancies tailored specifically to candidate profile
 */
export function getRecommendedVacanciesForUser(
  vacancies: Vacancy[],
  userProfile: UserProfile
): RecommendedVacancyMatch[] {
  const userQualRank = QUALIFICATION_RANK[userProfile.qualificationLevel] || 3;
  const userProvince = userProfile.province;
  const userAge = userProfile.age || 25;
  const preferredCats = userProfile.preferredCategories || [];
  const fieldOfStudyLower = (userProfile.fieldOfStudy || '').toLowerCase();

  const now = new Date().toISOString().split('T')[0];

  const matches: RecommendedVacancyMatch[] = [];

  vacancies.forEach(v => {
    // Skip expired vacancies
    const deadline = v.application_deadline || v.deadline;
    if (deadline && deadline < now) return;

    let score = 50; // baseline
    const reasonsEn: string[] = [];
    const reasonsNp: string[] = [];

    // 1. Qualification match
    const vacQual = v.qualification || v.minQualification || 'Bachelor Degree';
    const vacQualRank = QUALIFICATION_RANK[vacQual] || 2;

    if (userQualRank >= vacQualRank) {
      score += 20;
      reasonsEn.push(`Meets minimum qualification requirement (${vacQual})`);
      reasonsNp.push(`आवश्यक न्यूनतम योग्यता (${vacQual}) पुगेको`);
    } else {
      score -= 30;
    }

    // 2. Preferred Category match
    if (preferredCats.includes(v.category)) {
      score += 15;
      reasonsEn.push(`Matches your preferred sector (${v.category})`);
      reasonsNp.push(`तपाईंको रोजाइको क्षेत्र (${v.category}) सँग मेल खाने`);
    }

    // 3. Province match
    if (v.province === 'All Nepal' || v.province === userProvince || !v.province) {
      score += 10;
      if (v.province === userProvince) {
        reasonsEn.push(`Located in your home province (${userProvince})`);
        reasonsNp.push(`तपाईंको प्रदेश (${userProvince}) अन्तर्गतको पद`);
      } else {
        reasonsEn.push('Nationwide open competition');
        reasonsNp.push('देशभर खुला प्रतिस्पर्धा');
      }
    }

    // 4. Field of study keyword match
    const reqField = (v.required_field || '').toLowerCase();
    const pos = (v.position || '').toLowerCase();
    const title = (v.title || '').toLowerCase();

    if (
      fieldOfStudyLower &&
      (reqField.includes(fieldOfStudyLower) ||
        pos.includes(fieldOfStudyLower) ||
        title.includes(fieldOfStudyLower) ||
        (fieldOfStudyLower.includes('management') && (reqField.includes('management') || reqField.includes('commerce') || reqField.includes('bba') || reqField.includes('bbs'))) ||
        (fieldOfStudyLower.includes('it') && (reqField.includes('computer') || reqField.includes('it') || reqField.includes('software'))) ||
        (fieldOfStudyLower.includes('law') && (reqField.includes('law') || reqField.includes('justice'))))
    ) {
      score += 15;
      reasonsEn.push('Aligns with your academic field of study');
      reasonsNp.push('तपाईंको अध्ययन विषयसँग प्रत्यक्ष सम्बन्धित');
    }

    // 5. Age eligibility check
    const minAge = v.age_requirement?.min ?? v.ageLimits?.min ?? 18;
    const maxAge = v.age_requirement?.maxMale ?? v.ageLimits?.maxMale ?? 35;

    if (userAge >= minAge && userAge <= maxAge) {
      score += 5;
    } else {
      score -= 25;
    }

    const finalScore = Math.min(99, Math.max(20, score));

    if (finalScore >= 55) {
      matches.push({
        vacancy: v,
        matchScore: finalScore,
        matchReasonsEn: reasonsEn,
        matchReasonsNp: reasonsNp,
        isTopMatch: finalScore >= 80
      });
    }
  });

  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Recommends quiz sets based on user's weak topics and profile
 */
export function getRecommendedQuizzes(
  quizSets: QuizSet[],
  weakTopics: TopicAccuracyStat[],
  userProfile?: UserProfile
): { quizSet: QuizSet; rationaleEn: string; rationaleNp: string }[] {
  if (!quizSets || quizSets.length === 0) return [];

  const results: { quizSet: QuizSet; rationaleEn: string; rationaleNp: string }[] = [];
  const weakTopicNames = weakTopics.map(w => w.topic.toLowerCase());

  quizSets.forEach(qs => {
    const catLower = (qs.category || '').toLowerCase();
    const titleLower = (qs.title || '').toLowerCase();

    // Check if category or title matches any weak topic
    const matchedWeak = weakTopics.find(w =>
      catLower.includes(w.topic.toLowerCase()) ||
      titleLower.includes(w.topic.toLowerCase()) ||
      w.topic.toLowerCase().includes(catLower)
    );

    if (matchedWeak) {
      results.push({
        quizSet: qs,
        rationaleEn: `Recommended to boost your ${matchedWeak.accuracy}% accuracy in ${matchedWeak.topic}`,
        rationaleNp: `${matchedWeak.topic} मा तपाईंको ${matchedWeak.accuracy}% शुद्धता सुधार्न सिफारिस गरिएको`
      });
    } else if (qs.isDailyQuiz) {
      results.push({
        quizSet: qs,
        rationaleEn: 'Daily Lok Sewa practice challenge to maintain your streak',
        rationaleNp: 'तपाईंको दैनिक अभ्यास शृङ्खला (Streak) कायम राख्न'
      });
    } else if (userProfile && userProfile.preferredCategories.some(c => catLower.includes(c.toLowerCase().split(' ')[0]))) {
      results.push({
        quizSet: qs,
        rationaleEn: `Core syllabus revision for ${qs.category}`,
        rationaleNp: `${qs.category} पाठ्यक्रमको पूर्ण तयारीका लागि`
      });
    }
  });

  // If none matched, provide default quiz sets
  if (results.length === 0) {
    quizSets.slice(0, 3).forEach(qs => {
      results.push({
        quizSet: qs,
        rationaleEn: 'Essential PSC & Lok Sewa foundation mock test',
        rationaleNp: 'लोक सेवा आधारभूत नमुना परीक्षा'
      });
    });
  }

  // Deduplicate and return top 4
  const seen = new Set<string>();
  return results.filter(r => {
    if (seen.has(r.quizSet.id)) return false;
    seen.add(r.quizSet.id);
    return true;
  }).slice(0, 4);
}
