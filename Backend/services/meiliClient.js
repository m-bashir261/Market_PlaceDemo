const { MeiliSearch } = require('meilisearch');

const client = new MeiliSearch({
  host: process.env.MEILI_HOST || 'http://meilisearch:7700',
  apiKey: process.env.MEILI_MASTER_KEY || 'masterKey',
});

module.exports = client;
