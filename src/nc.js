var NS_OWNCLOUD = 'http://owncloud.org/ns';
var NS_NEXTCLOUD = 'http://nextcloud.org/ns';
var NS_DAV = 'DAV:';

var PROPFIND_PROPERTIES = [
	/**
	 * Modified time
	 */
	[NS_DAV, 'getlastmodified'],
	/**
	 * Etag
	 */
	[NS_DAV, 'getetag'],
	/**
	 * Mime type
	 */
	[NS_DAV, 'getcontenttype'],
	/**
	 * Resource type "collection" for folders, empty otherwise
	 */
	[NS_DAV, 'resourcetype'],
	/**
	 * File id
	 */
	[NS_OWNCLOUD, 'fileid'],
	/**
	 * Letter-coded permissions
	 */
	[NS_OWNCLOUD, 'permissions'],
	//[Client.NS_OWNCLOUD, 'downloadURL'],
	/**
	 * Folder sizes
	 */
	[NS_OWNCLOUD, 'size'],
	/**
	 * File sizes
	 */
	[NS_DAV, 'getcontentlength'],
	/**
	 * Preview availability
	 */
	[NS_NEXTCLOUD, 'has-preview']
];

var propfindProperties = PROPFIND_PROPERTIES.map(function(propDef) {
	return '{' + propDef[0] + '}' + propDef[1];
});

var client = new dav.Client({
    baseUrl : 'XXX',
	xmlNamespaces: {
		'DAV:': 'd',
		'http://owncloud.org/ns': 'oc',
		'http://nextcloud.org/ns': 'nc'
	}
});

client.xhrProvider = function() {
	var headers = {
		requesttoken: 'XXX'
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
	return client.propFind('/owncloud/remote.php/webdav/Notes/', propfindProperties, 1).then(
	    function(result) {
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
	    		requesttoken: 'XXX'
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
	    },
	    function(err) {
	        console.error(err);
	    }
	);
};