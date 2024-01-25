import { EventEmitter } from 'events';
import FeedError from './FeedError';
import FeedManager from './FeedManager';
import Feed from './Feed';

/**
 * Default UserAgent string
 * Since static stuff doesn't work in older versions, keep using global const
 */
const DEFAULT_UA: string = 'Node/RssFeedEmitter (https://github.com/filipedeschamps/rss-feed-emitter)';

/**
 * Class FeedEmitter.
 * 
 * This is where we extend from TinyEmitter and absorb
 * the #emit and #on methods to emit 'new-item' events
 * when we have new feed items.
 */
export default class FeedEmitter extends EventEmitter {
  feedList: any[];
  userAgent: string;
  skipFirstLoad: boolean;

  constructor(options: { userAgent: string; skipFirstLoad: boolean } = { userAgent: DEFAULT_UA, skipFirstLoad: false }) {
    super();
    this.feedList = [];
    this.userAgent = options.userAgent;
    this.skipFirstLoad = options.skipFirstLoad;
  }

  static validateFeedObject(feed: any, ua: string) {
    checkFeed(feed);
    checkUrl(feed);
    checkRefresh(feed);
    feed.userAgent = feed.userAgent || ua || DEFAULT_UA;
  }

  add(...userFeedConfig: any[]): any {
    if (userFeedConfig.length > 1) {
      userFeedConfig.forEach((f: any) => this.add(f));
      return this.feedList;
    }

    const config = userFeedConfig[0];

    FeedEmitter.validateFeedObject(config, this.userAgent);

    if (Array.isArray(config.url)) {
      config.url.forEach((url: any) => {
        this.add({
          ...config,
          url,
        });
      });
      return this.feedList;
    }

    const feed = new Feed(config);

    this.addOrUpdateFeedList(feed);

    return this.feedList;
  }

  remove(url: string) {
    if (typeof url !== 'string') {
      throw new FeedError('You must call #remove with a string containing the feed url', 'type_error');
    }

    const feed = this.findFeed({
      url,
    });

    return this.removeFromFeedList(feed);
  }

  get list() {
    return this.feedList;
  }

  destroy() {
    this.feedList.forEach((feed: any) => feed.destroy());
    delete this.feedList;
    this.feedList = [];
  }

  private addOrUpdateFeedList(feed: any) {
    const feedInList = this.findFeed(feed);
    if (feedInList) {
      this.removeFromFeedList(feedInList);
    }

    this.addToFeedList(feed);
  }

  private findFeed(feed: any) {
    return this.feedList.find((feedEntry: any) => feedEntry.url === feed.url);
  }

  private addToFeedList(feed: any) {
    feed.items = [];
    feed.interval = this.createSetInterval(feed);
    this.feedList.push(feed);
  }

  private createSetInterval(feed: any) {
    const feedManager = new FeedManager(this, feed);
    feedManager.getContent(true);
    return setInterval(feedManager.getContent.bind(feedManager), feed.refresh);
  }

  private removeFromFeedList(feed: any) {
    if (!feed) return;
    feed.destroy();
    const pos = this.feedList.findIndex((e: any) => e.url === feed.url);
    this.feedList.splice(pos, 1);
  }
}