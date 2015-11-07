var expect = require('chai').expect,
    timekeeper = require('timekeeper'),
    Tokenizer = require('./tokenizer');

describe('tokenizer', function() {
  it('tokenizes the same as the webapp', function() {
    tokenizer = new Tokenizer('sekrit');

    timekeeper.freeze(new Date('2015-10-17T14:00:01Z'));
    expect(tokenizer.tokenize('SomeUser__123456')).to.eq(
      '9DVSGqy850jtFRRWqQSomeUser__123456'
    );
  });
});
