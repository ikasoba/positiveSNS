const { Provider } = require('oidc-provider');
//  oidc-provider

const configuration = {
  // ... see /docs for available configuration
  clients: [{
    client_id: 'foo',
    client_secret: 'bar',
    redirect_uris: ['http://lvh.me:8080/cb']
    // ... other client properties
  }]
};

const oidc = new Provider('http://127.0.0.1:', configuration);

module.exports = oidc.callback();
