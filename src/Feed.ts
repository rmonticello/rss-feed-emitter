import FeedParser from 'feedparser';
import request from 'request';
import FeedError from './FeedError';
import FeedItem from './FeedItem';

const RESPONSE_CODES = {
  OK: 200,
  NOT_FOUND: 404,
  ISE: 500,
};

const historyLengthMultiplier = 3;
const DEFAULT_UA = 'Node/RssFeedEmitter (https://github.com/filipedeschamps/rss-feed-emitter)';
const ALLOWED_MIMES = ['text/html', 'application/xhtml+xml', 'application/xml', 'text/xml'];

export interface IFeedData {
  items?: FeedItem[],
  url: string,
  refresh?: number,
  userAgent?: string,
  eventName?: string
}

class Feed {
  items: FeedItem[];
  url: string;
  refresh: number;
  userAgent: string;
  eventName: string;
  maxHistoryLength: number;
  
  constructor(data: IFeedData) {
    this.items = data.items || [];
    this.url = data.url;
    this.refresh = data.refresh || 60000;
    this.userAgent = data.userAgent || DEFAULT_UA;
    this.eventName = data.eventName || 'new-item';
  }

  findItem(item: FeedItem): FeedItem | undefined {
    // similar implementation
  }

  updateHxLength(newItems: FeedItem[]): void {
    // similar implementation
  }

  addItem(item: FeedItem): void {
    // similar implementation
  }

  async fetchData(): Promise<FeedItem[]> {
    // similar implementation
  }

  get(feedparser: FeedParser): void {
    // similar implementation
  }

  handleError(error: Error) {
    // similar implementation
  }

  destroy() {
    // similar implementation
  }
}
export default Feed;