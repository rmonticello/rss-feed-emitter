import FeedParser from 'feedparser';
import request from 'request';
import FeedError from './FeedError';
import FeedItem from './FeedItem';

/**
 * Map of specially handled error codes
 */
const RESPONSE_CODES: { [key: string]: number } = {
  OK: 200,
  NOT_FOUND: 404,
  ISE: 500,
};

/**
 * This module manages automatically how many feed items
 * it will keep in memory, and basically it will have a
 * maximum history which is how many items the feed has
 * multiplied by this number below. So, if the feed have
 * 10 items, we will keep 30 items max in the history.
 */
const historyLengthMultiplier: number = 3;

/**
 * Default UserAgent string
 * Since static stuff doesn't work in older versions, keep using global const
 */
const DEFAULT_UA: string = 'Node/RssFeedEmitter (https://github.com/filipedeschamps/rss-feed-emitter)';

/**
 * Allowed mime types to allow fetching
 */
const ALLOWED_MIMES: string[] = ['text/html', 'application/xhtml+xml', 'application/xml', 'text/xml'];

class Feed {
  url: string;
  items: FeedItem[];
  refresh: number;
  userAgent: string;
  eventName: string;
  maxHistoryLength: number;
  interval: NodeJS.Timer;

  constructor(data: {url: string, items: FeedItem[], refresh: number, userAgent: string, eventName: string}) {
    this.items = data?.items ?? [];
    if (!data?.url) throw new TypeError('missing required field `url`');
    this.url = data.url;
    this.refresh = data?.refresh ?? 60000;
    this.userAgent = data?.userAgent ?? DEFAULT_UA;
    this.eventName = data?.eventName ?? 'new-item';
  }

  findItem(item: FeedItem): FeedItem | undefined {
    return this.items.find((entry: FeedItem) => {
      if (item.guid) return entry.guid === item.guid;
      if (item.id) return entry.id === item.id;
      return entry.link === item.link && entry.title === item.title;
    });
  }

  updateHxLength(newItems: FeedItem[]): void {
    this.maxHistoryLength = newItems.length * historyLengthMultiplier;
  }

  addItem(item: FeedItem): void {
    this.items.push(item);
    this.items = this.items.slice(this.items.length - this.maxHistoryLength, this.items.length);
  }

  fetchData(): Promise<FeedItem[]> {
    return new Promise(async (resolve) => {
      const items: FeedItem[] = [];
      const feedparser = new FeedParser();
      feedparser.on('readable', () => {
        const item = feedparser.read();
        item.meta.link = this.url;
        items.push(item);
      });
      feedparser.on('error', () => {
        this.handleError(new FeedError(`Cannot parse ${this.url} XML`, 'invalid_feed', this.url));
      });
      feedparser.on('end', () => {
        resolve(items);
      });

      this.get(feedparser);
    });
  }

  get(feedparser: any): void {
    request
      .get({
        url: this.url,
        headers: {
          'user-agent': this.userAgent,
          accept: ALLOWED_MIMES.join(','),
        },
      })
      .on('response', (res: any) => {
        if (res.statusCode !== RESPONSE_CODES.OK) {
          this.handleError(new FeedError(`This URL returned a ${res.statusCode} status code`, 'fetch_url_error', this.url));
        }
      })
      .on('error', () => {
        this.handleError(new FeedError(`Cannot connect to ${this.url}`, 'fetch_url_error', this.url));
      })
      .pipe(feedparser)
      .on('end', () => {});
  }

  handleError(error: Error): void {
    if (this.handler) {
      this.handler.handle(error);
    } else {
      throw error;
    }
  }

  destroy(): void {
    clearInterval(this.interval);
    delete this.interval;
  }
}

export default Feed;