export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featuredImage?: string;
  authorName: string;
  status: NewsStatus;
  publishDate?: string;
  createdAt: string;
  updatedAt: string;
  viewsCount: number;
  categories: NewsCategory[];
}

export interface NewsArticleSummary {
  id: number;
  title: string;
  slug: string;
  summary: string;
  featuredImage?: string;
  authorName: string;
  status: NewsStatus;
  publishDate?: string;
  createdAt: string;
  viewsCount: number;
  categories: NewsCategory[];
}

export interface NewsCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface CreateNewsArticle {
  title: string;
  summary: string;
  content: string;
  featuredImage?: string;
  categoryIds?: number[];
}

export interface UpdateNewsArticle {
  title?: string;
  summary?: string;
  content?: string;
  featuredImage?: string;
  categoryIds?: number[];
}

export interface CreateNewsCategory {
  name: string;
  description?: string;
  color?: string;
}

export interface NewsImage {
  id: number;
  imageUrl: string;
  altText?: string;
  caption?: string;
  createdAt: string;
}

export interface NewsDistribution {
  id: number;
  articleId: number;
  articleTitle: string;
  sentAt?: string;
  sentByName: string;
  totalRecipients: number;
  status: DistributionStatus;
  filters: DistributionFilter[];
}

export interface DistributionFilter {
  filterType: string;
  filterValue?: string;
  filterDescription: string;
}

export interface CreateDistribution {
  filters: {
    filterType: FilterType;
    filterValue?: string;
  }[];
}

export enum NewsStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export enum DistributionStatus {
  PENDING = 'PENDING',
  SENDING = 'SENDING',
  SENT = 'SENT',
  FAILED = 'FAILED'
}

export enum FilterType {
  ALL = 'ALL',
  SECTION = 'SECTION',
  MEMBER_TYPE = 'MEMBER_TYPE',
  FAMILY_GROUP = 'FAMILY_GROUP'
}

export interface PaginatedNewsResponse {
  content: NewsArticleSummary[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}