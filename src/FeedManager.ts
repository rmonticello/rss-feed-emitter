type FeedData = {
    items: FeedItem[];
    newItems?: FeedItem[];
    url: string;
};

type FeedItem = any; // TODO: Create an interface to represent FeedItem, replace any with actual type

class FeedManager {
    instance: any; // TODO: Replace any with actual type of instance
    feed: any; // TODO: Replace any with actual type of feed

    constructor(emitter: any, feed: any) {
        this.instance = emitter;
        this.feed = feed;

        this.feed.handler = {
            handle: this.onError.bind(this),
        };
    }

    sortItemsByDate(data: FeedData): void {
        data.items.sort(sortBy('date'));
    }

    identifyNewItems(data: FeedData): void {
        data.newItems = data.items.filter((fetchedItem) => {
            const foundItemInsideFeed = this.feed.findItem(fetchedItem);
            if (foundItemInsideFeed) {
                return false;
            }
            return fetchedItem;
        });
    }

    populateNewItemsInFeed(data: FeedData, firstload: boolean): void {
        data.newItems?.forEach((item) => {
            this.feed.addItem(item);
            if (!(firstload && this.instance.skipFirstLoad)) {
                this.instance.emit(this.feed.eventName, item);
            }
        });
    }

    onError(error: any) { // TODO: Replace any with actual type of error
        this.instance.emit('error', error);
    }

    async getContent(firstload: boolean): Promise<void> {
        const items = await this.feed.fetchData();
        const data : FeedData = {
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

export default FeedManager; // makes this class available for other files to import.