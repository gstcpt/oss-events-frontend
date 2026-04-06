export interface Visitor {
  id: number;
  clientId: string;
  userId?: number;
  firstSeen: Date;
  lastSeen: Date;
  userAgent?: string;
  device?: string;
  os?: string;
  browser?: string;
  locale?: string;
  ipHash?: string;
  sessions?: Session[];
  pageViews?: PageView[];
}

export interface Session {
  id: number;
  visitorId: number;
  sessionUuid: string;
  startedAt: Date;
  endedAt?: Date;
  durationMs?: number;
  entryUrl?: string;
  entryResource?: string;
  entryResourceId?: number;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  pageViews?: PageView[];
  visitor?: Visitor;
}

export interface PageView {
  id: number;
  sessionId: number;
  visitorId: number;
  userId?: number;
  resourceType?: string;
  resourceId?: number;
  path: string;
  title?: string;
  query?: any;
  startedAt: Date;
  endedAt?: Date;
  durationMs?: number;
  scrollDepthPct?: number;
  interactions: number;
  isBounce?: boolean;
  meta?: any;
  events?: PageEvent[];
  session?: Session;
  visitor?: Visitor;
}

export interface PageEvent {
  id: number;
  pageViewId: number;
  type: string;
  name?: string;
  payload?: any;
  createdAt: Date;
  pageView?: PageView;
}

export interface DailyAggregate {
  id: number;
  day: Date;
  resourceType?: string;
  resourceId?: number;
  views: number;
  uniques: number;
  totalDurationMs: bigint;
  avgDurationMs?: number;
  interactions: number;
  createdAt: Date;
}

export interface AudienceStats {
  totalVisitors: number;
  activeSessions: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: { path: string; views: number }[];
  topResources: { type: string; id: number; views: number }[];
  deviceStats: { device: string; count: number }[];
  browserStats: { browser: string; count: number }[];
}

export interface AudienceResponse {
  success: boolean;
  data?: Visitor[] | Session[] | PageView[] | DailyAggregate[];
  stats?: AudienceStats;
  message?: string;
  error?: string;
}