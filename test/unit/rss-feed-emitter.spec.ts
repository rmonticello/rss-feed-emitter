'use strict';

import chai, { expect } from 'chai';
import nock from 'nock';
import * as path from 'path';
import { RssFeedEmitter } from '../../src/FeedEmitter';
import { RssFeedError } from '../../src/FeedError';
import { Feed } from '../../src/Feed';


process.env.NOCK_OFF = false;

let feeder: RssFeedEmitter;
const defaultUserAgent = 'Node/RssFeedEmitter (https://github.com/filipedeschamps/rss-feed-emitter)';

describe('RssFeedEmitter (unit)', () => {
  beforeEach(() => {
    feeder = new RssFeedEmitter();
  });

  afterEach(() => {
    if (feeder) {
      feeder.destroy();
      feeder = undefined;
    }
    nock.cleanAll();
  });

  // ...

  describe('storage Feed', () => {
    describe('#constructor', () => {
      it('should error when no url is provided', () => {
        expect(() => new Feed({ url: undefined })).to.throw(TypeError, 'missing required field `url`');
      });

      // ...
    });

    describe('#findItem', () => {
      it('should support matching on entry id', () => {
        const feed = new Feed({ url: 'https://npmjs.org', items: [{ id: '010' }] });
        const result = feed.findItem({ id: '010' });
        expect(result.id).to.eq('010');
      });

      // ...
    });

    describe('#handleError', () => {
      it('should handle errors if a handler is present', async () => {
        nock('https://www.nintendolife.com/')
          .get('/feeds/latest')
          .reply(500);

        const feed = new Feed({ url: 'https://www.nintendolife.com/feeds/latest', refresh: 100 });
        let numHandled = 0;
        const handler = {
          handle: () => {
            numHandled += 1;
          },
        };
        feed.handler = handler;
        await feed.fetchData();
        expect(numHandled).to.eq(2);
      });

      // ...
    });
  });
});