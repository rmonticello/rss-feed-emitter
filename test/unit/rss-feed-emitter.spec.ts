import chai from 'chai';
import nock from 'nock';
import path from 'path';
import RssFeedEmitter from '../../src/FeedEmitter';
import RssFeedError from '../../src/FeedError';
import Feed from '../../src/Feed';

process.env.NOCK_OFF = false;

let expect = chai.expect;
let feeder: RssFeedEmitter;
const defaultUserAgent: string = 'Node/RssFeedEmitter (https://github.com/filipedeschamps/rss-feed-emitter)';

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

  describe('when instantiated', () => {
    it('should return an Object', () => {
      expect(feeder).to.be.an('object');
    });
  });

  // ... All your test cases go here ...

  describe('.list', () => {
    it('should be an Array', () => {
      expect(feeder.list).to.be.an('array');
    });

    // ... All your test cases go here ...
  });

  describe('#remove', () => {
    it('should be a Function', () => {
      expect(feeder.remove).toBeInstanceOf(Function);
    });

    // ... All your test cases go here ...
  });

  describe('#destroy', () => {
    it('should be a Function', () => {
      expect(feeder.destroy).toBeInstanceOf(Function);
    });

    // ... All your test cases go here ...
  });

  describe('storage Feed', () => {
    describe('#constructor', () => {
      // ... All your test cases go here ...
    });

    describe('#findItem', () => {
      // ... All your test cases go here ...
    });

    describe('#handleError', () => {
      // ... All your test cases go here ...
    });
  });
});