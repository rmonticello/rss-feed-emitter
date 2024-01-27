'We are strict';

import FeedEmitter from './FeedEmitter';
import Feed from './Feed';

const sortBy = (key: string) => (a: any, b: any) => ((a[key] > b[key]) ? 1 : ((b[key] > a[key]) ? -1 : 0));

class FeedManager {

  private instance: FeedEmitter;
  private feed: Feed;

  constructor(emitter: FeedEmitter, feed: Feed) {
    this.instance = emitter;
    this.feed = feed;

    this.feed.handler = {
      handle: this.onError.bind(this),
    };
  }

  private sortItemsByDate(data: any) {
    data.items.sort(sortBy('date'));
  }

  private identifyNewItems(data: any) {
    data.newItems = data.items.filter((fetchedItem: any) => {
      const foundItemInsideFeed = this.feed.findItem(fetchedItem);
      if (foundItemInsideFeed) {
        return false;
      }
      return fetchedItem;
    });
  }

  private populateNewItemsInFeed(data: any, firstload: boolean) {
    data.newItems.forEach((item: any) => {
      this.feed.addItem(item);
      if (!(firstload && this.instance.skipFirstLoad)) {
        this.instance.emit(this.feed.eventName, item);
      }
    });
  }

  private onError(error: any) {
    this.instance.emit('error', error);
  }

  public async getContent(firstload: boolean) {
    const items = await this.feed.fetchData();
    const data = {
      items,
      url: this.feed.url,
    };
    this.feed.updateHxLength(items);
    this.sortItemsByDate(data);
    this.identifyNewItems(data);
    this.populateNewItemsInFeed(data, firstload);
    if (firstload && !this.instance.skipFirstLoad) {
      this.instance.emit(`initial-load:${this.feed.url}`, { url: this.feed.url, items: this.feed.items });
    }
  }
}

export default FeedManager;