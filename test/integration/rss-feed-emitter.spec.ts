import chai from 'chai';
import RssFeedEmitter from '../../src/FeedEmitter';

const { expect } = chai;

const expectedlength: number = 1;
const refresh: number = 1000;

process.env.NOCK_OFF = "true";

interface Feed {
    name: string;
    url: string;
}

const feeds: Feed[] = [
    {
        name: 'Nintendo Life',
        url: 'https://www.nintendolife.com/feeds/latest',
    },
    // More feeds...
]

describe('RssFeedEmitter (integration)', function () {
    describe('#on', function () {
        let feeder!: RssFeedEmitter;

        beforeEach(() => {
            feeder = new RssFeedEmitter();
        });

        afterEach(() => {
            feeder.destroy();
        });

        feeds.forEach(({ name, url }) => {
            it(`should emit items from "${name}"`, (done) => {
                feeder.add({ url, refresh });

                let doneski: boolean = false;

                feeder.on('new-item', (item) => {
                    if (!doneski) {
                        doneski = true;
                        expect(item.title).to.be.a('string');
                        // More expects...
        
                        done();
                    }
                });
            });
        });

        afterEach(() => {
            feeder.destroy();
        });
    });
});