import { Vacancy, SyllabusPost } from '../types';

export interface SeoConfig {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  keywords?: string[];
  author?: string;
  noIndex?: boolean;
}

const DEFAULT_SEO: SeoConfig = {
  title: 'SarkariSajha – Official Nepal Government Vacancies, Lok Sewa & Exam Preparation',
  description: 'Discover verified Nepal Government job vacancies from Lok Sewa Aayog (PSC), Teacher Service Commission (TSC), banking institutions, and provincial authorities. Daily syllabus mock tests and instant AI eligibility matching.',
  ogType: 'website',
  ogImage: '/og-banner.png',
  keywords: [
    'Lok Sewa Aayog',
    'Nepal Government Jobs',
    'PSC Vacancy 2026',
    'Teacher Service Commission TSC',
    'Sarkari Jagir Nepal',
    'Nepal Rastra Bank Vacancy',
    'Provincial Lok Sewa',
    'Section Officer Exam',
    'Nayab Subba Syllabus',
    'Lok Sewa Model Questions',
    'Nepal Job Portal'
  ],
  author: 'SarkariSajha Editorial Board'
};

/**
 * Dynamically updates document head metadata for SEO, Open Graph, and Twitter Cards
 */
export function setPageSEO(config: Partial<SeoConfig>) {
  if (typeof document === 'undefined') return;

  const finalConfig: SeoConfig = {
    ...DEFAULT_SEO,
    ...config
  };

  // 1. Page Title
  document.title = finalConfig.title;

  // 2. Standard Meta Description
  setMetaTag('description', finalConfig.description);

  // 3. Keywords
  if (finalConfig.keywords && finalConfig.keywords.length > 0) {
    setMetaTag('keywords', finalConfig.keywords.join(', '));
  }

  // 4. Author
  if (finalConfig.author) {
    setMetaTag('author', finalConfig.author);
  }

  // 5. Robots indexing
  setMetaTag('robots', finalConfig.noIndex ? 'noindex, nofollow' : 'index, follow');

  // 6. Canonical URL
  const origin = window.location.origin || 'https://sarkarisajha.gov.np';
  const canonicalHref = finalConfig.canonicalUrl || `${origin}${window.location.pathname}`;
  setCanonicalLink(canonicalHref);

  // 7. Open Graph Meta Tags
  setMetaProperty('og:title', finalConfig.title);
  setMetaProperty('og:description', finalConfig.description);
  setMetaProperty('og:url', canonicalHref);
  setMetaProperty('og:type', finalConfig.ogType || 'website');
  setMetaProperty('og:site_name', 'SarkariSajha');
  setMetaProperty('og:locale', 'ne_NP');
  setMetaProperty('og:locale:alternate', 'en_US');

  const fullImageUrl = finalConfig.ogImage
    ? (finalConfig.ogImage.startsWith('http') ? finalConfig.ogImage : `${origin}${finalConfig.ogImage}`)
    : `${origin}/og-banner.png`;

  setMetaProperty('og:image', fullImageUrl);

  // 8. Twitter Cards
  setMetaTag('twitter:card', 'summary_large_image');
  setMetaTag('twitter:title', finalConfig.title);
  setMetaTag('twitter:description', finalConfig.description);
  setMetaTag('twitter:image', fullImageUrl);
}

/**
 * Injects Google JobPosting Schema.org JSON-LD into the head
 */
export function setJobPostingSchema(vacancy: Vacancy) {
  if (typeof document === 'undefined') return;
  removeSchemaElement('job-posting-schema');

  const origin = window.location.origin || 'https://sarkarisajha.gov.np';
  const validThroughDate = vacancy.application_deadline ? `${vacancy.application_deadline}T23:59:59+05:45` : undefined;
  const datePosted = vacancy.published_at || vacancy.createdAt || '2026-08-15T00:00:00+05:45';

  const jobLocationDistrict = vacancy.district || 'Kathmandu';
  const jobLocationProvince = vacancy.province || 'Bagmati';

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: vacancy.title,
    description: `Official Nepal Government Vacancy Notice for ${vacancy.position || vacancy.title} at ${vacancy.organization || vacancy.org}. Minimum qualification: ${vacancy.qualification || vacancy.qualifications?.minLevel || 'Bachelor Degree'}. Application deadline: ${vacancy.application_deadline || vacancy.deadline || 'Active'}. Verified source: ${vacancy.official_source_name || 'Official Nepal Gazette'}.`,
    datePosted: datePosted,
    validThrough: validThroughDate,
    employmentType: vacancy.employment_type === 'Contract' ? 'CONTRACTOR' : 'FULL_TIME',
    hiringOrganization: {
      '@type': 'GovernmentOrganization',
      name: vacancy.organization || vacancy.org || 'Government of Nepal',
      sameAs: vacancy.official_source_url || origin,
      logo: `${origin}/favicon.svg`
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: jobLocationDistrict,
        addressRegion: jobLocationProvince,
        addressCountry: 'NP'
      }
    },
    educationRequirements: vacancy.qualification || vacancy.qualifications?.minLevel || 'Bachelor Degree',
    qualifications: vacancy.required_field ? `Field of study: ${vacancy.required_field}` : undefined,
    baseSalary: vacancy.salary ? {
      '@type': 'MonetaryAmount',
      currency: 'NPR',
      value: {
        '@type': 'QuantitativeValue',
        unitText: 'MONTH',
        value: vacancy.salary
      }
    } : undefined,
    totalJobOpenings: vacancy.number_of_posts || vacancy.posts || 1,
    industry: vacancy.category || 'Government & Public Administration',
    directApply: true,
    url: `${origin}/vacancies/${vacancy.slug || vacancy.id}`
  };

  injectSchema('job-posting-schema', schemaData);
}

/**
 * Injects BreadcrumbList Schema.org JSON-LD
 */
export function setBreadcrumbSchema(items: { name: string; path: string }[]) {
  if (typeof document === 'undefined') return;
  removeSchemaElement('breadcrumb-schema');

  const origin = window.location.origin || 'https://sarkarisajha.gov.np';
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path.startsWith('http') ? item.path : `${origin}${item.path}`
    }))
  };

  injectSchema('breadcrumb-schema', schemaData);
}

/**
 * Injects Syllabus / Educational Course Schema.org JSON-LD
 */
export function setSyllabusSchema(post: SyllabusPost) {
  if (typeof document === 'undefined') return;
  removeSchemaElement('syllabus-course-schema');

  const origin = window.location.origin || 'https://sarkarisajha.gov.np';
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: `${post.name} (${post.nameNp}) Syllabus & Exam Guide`,
    description: `Official Nepal Public Service Commission curriculum for ${post.name} (${post.level}). Includes subject breakdowns, syllabus notes, and exam blueprint.`,
    provider: {
      '@type': 'Organization',
      name: 'SarkariSajha',
      sameAs: origin
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Online',
      courseWorkload: `${post.papers?.length || 3} Examination Papers`
    },
    educationalCredentialAwarded: post.level,
    url: `${origin}/syllabus/${post.id}`
  };

  injectSchema('syllabus-course-schema', schemaData);
}

/**
 * Injects FAQPage Schema.org JSON-LD
 */
export function setFaqSchema(faqs: { question: string; answer: string }[]) {
  if (typeof document === 'undefined') return;
  removeSchemaElement('faq-schema');

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  injectSchema('faq-schema', schemaData);
}

/**
 * Injects Search / WebSite Schema.org JSON-LD
 */
export function setWebSiteSearchSchema() {
  if (typeof document === 'undefined') return;
  removeSchemaElement('website-search-schema');

  const origin = window.location.origin || 'https://sarkarisajha.gov.np';
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SarkariSajha',
    alternateName: 'सरकारी साझा',
    url: origin,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${origin}/?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  injectSchema('website-search-schema', schemaData);
}

function injectSchema(id: string, data: object) {
  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data, null, 2);
  document.head.appendChild(script);
}

export function removeSchemaElement(id: string) {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }
}

// Helpers
function setMetaTag(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setMetaProperty(property: string, content: string) {
  let element = document.querySelector(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonicalLink(href: string) {
  let element = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}
