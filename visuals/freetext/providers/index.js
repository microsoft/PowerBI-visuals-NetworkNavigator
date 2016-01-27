var req = require.context('./', true, /\.ts$/);
var reqs = {};
var path = require('path');
req.keys().forEach(function(key){
    var providerName = path.basename(key, '.ts');
    if (providerName[0] !== 'I') {
        var required = req(key);
        var provider = required.default || required[providerName];
        if (provider) {
            reqs[provider.name] = provider;
        }
    }
});
module.exports = reqs;