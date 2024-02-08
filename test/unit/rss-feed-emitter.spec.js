import * as chai from 'chai';
import * as nock from 'nock';
import * as path from 'path';
import { RssFeedEmitter } from '../src/FeedEmitter';
import { RssFeedError } from '../src/FeedError';
import { Feed } from '../src/Feed';

process.env.NOCK_OFF = false;

const { expect } = chai;

let feeder: RssFeedEmitter;
const defaultUserAgent = 'Node/RssFeedEmitter (https://github.com/filipedeschamps/rss-feed-emitter)';

describe('RssFeedEmitter (unit)', () => {
  beforeEach(() => {
    feeder = new RssFeedEmitter();
  });

  // ... rest of code ...

  describe('storage Feed', () => {
    describe('#constructor', () => {
      it('should error when no url is provided', () => {
        expect(() => new Feed({ url: undefined })).to.throw(TypeError, 'missing required field `url`');
      });

      // ... rest of code ...

    });
  });
});