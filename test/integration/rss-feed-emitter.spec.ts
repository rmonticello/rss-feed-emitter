import chai from 'chai';
import RssFeedEmitter from '../../src/FeedEmitter';

const { expect } = chai;

interface Feed {
  name: string;
  url: string;
}

const expectedlength = 1;
const refresh = 1000;

process.env.NOCK_OFF = 'true';

const feeds: Feed[] = [
  {
    name: 'Nintendo Life',
    url: 'https://www.nintendolife.com/feeds/latest',
  },
  // ...Other feeds
];

describe('RssFeedEmitter (integration)', () => {
  describe('#on', () => {
    let feeder: any;

    beforeEach(() => { feeder = new RssFeedEmitter(); });

    afterEach(() => { feeder.destroy(); });

    feeds.forEach(({ name, url }) => {
      it(`should emit items from "${name}"`, (done) => {
        feeder.add({ url, refresh });

        let doneski = false;

        feeder.on('new-item', (item: any) => {
          if (!doneski) {
            doneski = true;
            expect(item.title).to.be.a('string');
            if (name !== 'CNN') {
              // apparently cnn doesn't support some nor
              expect(item.description).to.be.a('string');
              expect(item.date).to.be.a('date');
            }
            expect(item.meta).to.have.property('link', url);

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