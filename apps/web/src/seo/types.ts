export interface SeoModel {
  path: string;
  title: string;
  description: string;
  /** Absolute canonical URL, or null for pages that must not be indexed. */
  canonical: string | null;
  robots: string;
  ogType: string;
  image: string;
  imageAlt: string;
  publishedTime?: string;
  modifiedTime?: string;
  jsonLd: object | null;
}
