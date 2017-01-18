require('../lib/davclient.js/lib/client');  // exposes global `dav`

var baseUrl = 'https://HOST';  // replace HOST with actual host, e.g. example.com
var urlPath = '';  // e.g. '/nextcloud' if installed in subfolder
var requestToken = '';  // HTTP request header "requesttoken", get from inspecting request to webdav while using Nextcloud files app

var client = new dav.Client({
    baseUrl : baseUrl
});

client.xhrProvider = function() {
  var headers = {
    requesttoken: requestToken
  };
  var xhr = new XMLHttpRequest();
  var oldOpen = xhr.open;
  // override open() method to add headers
  xhr.open = function() {
    var result = oldOpen.apply(this, arguments);
    for (var key in headers) {
      var value = headers[key];
      xhr.setRequestHeader(key, value);
    }
    return result;
  };

  return xhr;
};

module.exports = function () {
  return (
    client.propFind(urlPath + '/remote.php/webdav/Notes/', null, 1)
    .then(function(result) {
      var hrefs = result.body.slice(1).map(function(response) {
        return response.href;
      });

      function getTitle(href) {
        var dir = '/Notes/';
        var filename = href.substring(href.indexOf(dir) + dir.length);
        var title = filename.substring(0, filename.length - 4);
        return decodeURIComponent(title);
      }

      function status(response) {
        if (response.status >= 200 && response.status < 300) {
          return Promise.resolve(response)
        } else {
          return Promise.reject(new Error(response.statusText))
        }
      }

      var headers = new Headers({
        requesttoken: requestToken
      });
      var fileRequests = hrefs.map(function(href) {
        return (
          fetch(href, {headers: headers, credentials: 'include'})
          .then(status)
          .then(function(response) {
            return response.text();
          })
          .then(function(text) {
            return {
              title: getTitle(href),
              text: text
            };
          })
        );
      });

      return Promise.all(fileRequests);
    })
  );
};
