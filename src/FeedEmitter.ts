import {  EventEmitter } from 'events';
import FeedError from './FeedError';
import FeedManager from './FeedManager';
import Feed from './Feed';

const DEFAULT_UA: string = 'Node/RssFeedEmitter (https://github.com/filipedeschamps/rss-feed-emitter)';


function checkFeed(feed: Feed): void {
  if (!feed) {
    throw new FeedError('You must call #add method with a feed configuration object.', 'type_error');
  }
}


function checkUrl(feed: Feed): void {
  if (!feed.url || !(typeof feed.url === 'string' || Array.isArray(feed.url))) {
    throw new FeedError('Your configuration object should have an "url" key with a string or array value', 'type_error');
  }
}

function checkRefresh(feed: Feed): void {
  if (feed.refresh && typeof feed.refresh !== 'number') {
    throw new FeedError('Your configuration object should have a "refresh" key with a number value', 'type_error');
  }
}


class FeedEmitter extends EventEmitter {

  static validateFeedObject(feed: any, ua?: string): void {
    checkFeed(feed);
    checkUrl(feed);
    checkRefresh(feed);
    feed.userAgent = feed.userAgent || ua || DEFAULT_UA;
  }

  feedList: Feed[];
  userAgent: string;
  skipFirstLoad: boolean;

  constructor(options: { userAgent?: string, skipFirstLoad?: boolean } = { userAgent: DEFAULT_UA, skipFirstLoad: false }) {
    
    super();
    this.feedList = [];
    this.userAgent = options.userAgent!;
    this.skipFirstLoad = options.skipFirstLoad!;
  }

  add(...userFeedConfig: any[]): Feed[] {
    if (userFeedConfig.length > 1) {
      userFeedConfig.forEach((f) => this.add(f));
      return this.feedList;
    }

    const config = userFeedConfig[0];
    
    FeedEmitter.validateFeedObject(config, this.userAgent);

    if (Array.isArray(config.url)) {
      config.url.forEach((url: string) => {
        this.add({
          ...config,
          url,
        });
      });
      return this.feedList;
    }

    const feed: Feed = new Feed(config);
    this.addOrUpdateFeedList(feed);

    return this.feedList;
  }

  remove(url: string): Feed | undefined {
    if (typeof url !== 'string') {
      throw new FeedError('You must call #remove with a string containing the feed url', 'type_error');
    }

    const feed: Feed | undefined = this.findFeed({
      url,
    });

    return this.removeFromFeedList(feed);
  }


  get list(): Feed[] {
    return this.feedList;
  }


  destroy(): void {
    this.feedList.forEach((feed) => feed.destroy());
    delete this.feedList;
    this.feedList = [];
  }

  private addOrUpdateFeedList(feed: Feed): void {
    const feedInList: Feed | undefined = this.findFeed(feed);
    if (feedInList) {
      this.removeFromFeedList(feedInList);
    }

    this.addToFeedList(feed);
  }


  private findFeed(feed: any): Feed | undefined {
    return this.feedList.find((feedEntry) => feedEntry.url === feed.url);
  }

  private addToFeedList(feed: Feed) {
    feed.items = [];
    feed.interval = this.createSetInterval(feed);

    this.feedList.push(feed);
  }

  private createSetInterval(feed: Feed): NodeJS.Timeout {

    const feedManager: FeedManager = new FeedManager(this, feed);
    feedManager.getContent(true);
    return setInterval(feedManager.getContent.bind(feedManager), feed.refresh);
  }

  private removeFromFeedList(feed?: Feed): void {
    if (!feed) return;

    feed.destroy();
    const pos: number = this.feedList.findIndex((e) => e.url === feed.url);
    this.feedList.splice(pos, 1);
  }
}

export default FeedEmitter;