/**
 * @file
 * @description This is the Javascript library to access the products catalog from browser and node.
 *
 * To include the library in your web app, copy caseable-api.min.js somewhere on the server,
 * then on your page's `head` or `body`, include
 * <code>
 *   <pre>
 *   &lt;script type="text/Javascript" src="{path.to}/caseable-api.min.js"&gt;&lt;/script&gt;
 *   </pre>
 * </code>
 * The only requirement on browser is to support
 * [JSON]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON}.
 * <br />
 * To include the library in your node app, add
 * <code>
 *   <pre>
 *   let $caseable = require('{path.to}/caseable-api.min.js');
 *   </pre>
 * </code>
 *
 * All classes and methods are provided in the {@link $caseable} namespace.
 * To get started, check out its [documentation]{@link $caseable}.
 * @author caseable GmbH
 */

/**
 * @namespace $caseable
 * @description
 *
 * This is the main (and only) name space provided by this library.
 * Interacting with caseable's catalog is as simple as initializing the library
 * then using the various methods provided in this namespace, e.g.
 *
 * <code>
 * <pre>
 *
 *  var inited = {@link $caseable.initialize}('', 'your-partner-id', 'eu', 'en');
 *
 *  if (!inited) {
 *    // some error handling
 *  }
 *
 *  {@link $caseable.getProducts}(
 *    {
 *      type: "smartphone-flip-case",
 *      "color": "red"
 *    },
 *    function(products) {
 *      // do something with the [Products]{@link $caseable.Product}
 *    }
 *  );
 * </pre>
 * </code>
 *
 * Details on each class and method provided by this namespace are provided below.
 *
 */
(function(scope, undefined) {
  'use strict';

  function clone(obj) {
    if (typeof obj == 'object') {
      var isArray = typeof obj.indexOf == 'function';
      var objClone = isArray ? [] : {};
      for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
          if (isArray) objClone.push(clone(obj[i]));
          else objClone[i] = clone(obj[i]);
        }
      }
      return objClone;
    } else {
      return obj;
    }
  }

  function BaseClass(attributes, init) {
    var self = this;
    init = init || {};
    this.attributes = clone(attributes);
    this.attributes.forEach(function(attribute) {
      self[attribute] = init[attribute];
    });
  }

  BaseClass.prototype.toObject = function() {
    var obj = {};
    var self = this;

    this.attributes.forEach(function(attribute) {
      obj[attribute] = self[attribute];
    });
    return clone(obj);
  };

   /**
    * @constructor
    * @description represents a caseable product (e.g. hard case for samsung galaxy)
    * @memberof $caseable
    *
    * @param {Object} init
    * @param {string} init.sku the product's stock keeping number
    * @param {string} init.artist the author name
    * @param {string} init.design the design title
    * @param {string} init.type product's type (e.g. hard case, flip case, etc)
    * @param {string} init.device the device for which the product is designed
    * @param {Object} init.productionTime
    * @param {int} init.productionTime.min minimum production time in days
    * @param {int} init.productionTime.max maximum production time in days
    * @param {string} init.thumbnailUrl url to the thumbnail image
    * @param {integer} init.price product's price
    * @param {string} init.currency price currency
    */
  function Product(init) {
    var attributes = [
      'sku',
      'artist',
      'design',
      'type',
      'device',
      'productionTime',
      'thumbnailUrl',
      'price',
      'currency'
    ];

    BaseClass.call(this, attributes, init);
  }
  Product.prototype = Object.create(BaseClass.prototype);
  Product.prototype.constructor = Product;

  /**
   * @constructor
   * @description represents a caseable product type (e.g. flip case)
   *
   * @memberof $caseable
   *
   * @param {Object} init
   * @param {string} init.id the product type id
   * @param {string} init.name the product type name
   * @param {string} init.sku the product type's sku part
   * @param {Object} init.productionTime
   * @param {int} init.productionTime.min minimum production time in days
   * @param {int} init.productionTime.max maximum production time in days
   */
  function ProductType(init) {
    var attributes = [
      'id',
      'name',
      'sku',
      'productionTime'
    ];

    BaseClass.call(this, attributes, init);
  }
  ProductType.prototype = Object.create(BaseClass.prototype);
  ProductType.prototype.constructor = ProductType;

  /**
   * @constructor
   * @description represents a device (e.g. Apple Iphone 8)
   *
   * @memberof $caseable
   *
   * @param {Object} init
   * @param {string} init.id the device id
   * @param {string} init.name the device name
   * @param {string} init.shortName the device short name
   * @param {string} init.brand the device brand
   * @param {string} init.sku the device's sku part
   */
  function Device(init) {
    var attributes = [
      'id',
      'name',
      'shortName',
      'brand',
      'sku'
    ];

    BaseClass.call(this, attributes, init);
  }
  Device.prototype = Object.create(BaseClass.prototype);
  Device.prototype.constructor = Device;

  /**
   * @constructor
   * @description represents a product search filter
   *
   * @memberof $caseable
   *
   * @param {Object} init
   * @param {string} init.name the filter's name
   * @param {boolean} init.multiValue whether the filter accepts multiple values
   * @param {Array} init.options allowed filter options
   */
  function Filter(init) {
    var attributes = [
      'name',
      'multiValue',
      'options'
    ];

    BaseClass.call(this, attributes, init);
  }
  Filter.prototype = Object.create(BaseClass.prototype);
  Filter.prototype.constructor = Filter;

  // private attributes
  var baseApiUrl;
  var partner;
  var lang;
  var region;
  var initialized = false;

  // private methods

  function log(message) {
    console && console.info && console.info(message);
  }

  function logError(message) {
    console && console.error && console.error(message);
  }

  function getXhrInstance() {
    if (XMLHttpRequest) return new XMLHttpRequest();

    if (ActiveXObject) {
      try {
        return new ActiveXObject('Msxml3.XMLHTTP');
      } catch (e) {}
      try {
        return new ActiveXObject('Msxml2.XMLHTTP.6.0');
      } catch (e) {}
      try {
        return new ActiveXObject('Msxml2.XMLHTTP.3.0');
      } catch (e) {}
    }

    return null;
  }

  function ajaxRequest(method, endpoint, parameters, credentials, callback) {

    var xhr = getXhrInstance();
    var url;
    var query = '';
    callback = typeof callback === 'function' ? callback : function() {};

    if (!xhr) {
      logError('Failed to instiantiate XHR, quitting!');
      callback({connectionError: 'Failed to instiantiate XHR, quitting!'});
      return;
    }

    if (method === 'GET' && parameters) {
      var query = '?';
      parameters.forEach(function(pair) {
        var name = pair[0];
        var value = pair[1];
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
      });
      query = query.substring(0, query.length - 1);
    }

    url = baseApiUrl + endpoint + query;

    xhr.addEventListener('load', function() {
      var response;
      var error = {};
      try {
        response = JSON.parse(xhr.responseText);
      } catch (e) {
        response = xhr.responseText;
        error['parseError'] = e.toString();
        callback(error, response);
        return;
      }
      if (xhr.status === 200 || xhr.status === 201) {
        callback(undefined, response);
      } else {
        logError('Request failed. Returned status of ' + xhr.status);
        error['invalidStatus'] = xhr.status;
        callback(error, response);
      }
    });

    xhr.addEventListener('error', function() {
      var error = {
        error: 'transfer error occurred'
      };
      try {
        error.payload = JSON.parse(xhr.responseText);
      } catch (e) {
        error.payload = xhr.responseText;
        error['parseError'] = e.toString();
      }
      callback(error);
    });

    xhr.addEventListener('abort', function() {
      var error = {
        error: 'transfer aborted'
      };
      try {
        error.payload = JSON.parse(xhr.responseText);
      } catch (e) {
        error.payload = xhr.responseText;
        error['parseError'] = e.toString();
      }
      callback(error);
    });

    xhr.open(method, url);
    xhr.setRequestHeader('Accept', 'application/caseable.v1+json');
    if (credentials) {
      xhr.setRequestHeader(
        'Authorization',
        'Basic ' + btoa(credentials.user + ':' + credentials.pass)
      );
    }
    if (parameters && method !== 'GET') xhr.send(parameters);
    else xhr.send();
  }

  // public methods

  /**
   * @function
   *
   * @description initializes the API library for further requests, this method
   * should be called before performing any other operation.
   *
   * @memberof $caseable
   *
   * @param {string} baseApiUrl the base API URL
   * @param {string} partner the partner's id
   * @param {string} region the preferred region
   * @param {string} lang the preferred language
   * @return {boolean} whether initialization succeeded
   */
  function initialize(argBaseApiUrl, argPartner, argRegion, argLang) {
    // set private global parameters
    partner = argPartner;
    lang = argLang;
    region = argRegion;
    baseApiUrl = argBaseApiUrl;

    // validate

    if (!baseApiUrl || !/https?:\/\/\S+/.test(baseApiUrl)) {
      logError('baseApiUrl is mandatory, quitting');
      return false;
    }

    initialized = true;
    return true;
  }

  function reset() {
    partner = undefined;
    lang = undefined;
    region = undefined;
    baseApiUrl = undefined;
    initialized = false;
  }

  /**
   * @function
   *
   * @description retrieves avaialable devices.
   *
   * @memberof $caseable
   *
   * @param {Function} callback a callback which receives an array of {@link $caseable.Device}
   */
  function getDevices(callback) {
    callback = typeof callback === 'function' ? callback : function() {};

    if (!initialized) {
       callback({error: 'The API needs to be initialized successfully first'});
       return;
    }


    ajaxRequest(
      'GET',
      '/devices/',
      undefined,
      undefined,
      function(error, data) {
        if (error || !data.devices) {
          logError('failed to retrieve devices');
          log(data);
          callback(error, data);
          return;
        }
        callback(undefined, data.devices);

      }
    );

  }

  /**
   * @function
   *
   * @description retrieves supported filters.
   *
   * @memberof $caseable
   *
   * @param {Function} callback a callback which receives an array of {@link $caseable.Filter}
   */
  function getFilters(callback) {
    callback = typeof callback === 'function' ? callback : function() {};

    if (!initialized) {
       callback({error: 'The API needs to be initialized successfully first'});
       return;
    }

    ajaxRequest(
      'GET',
      '/filters/',
      undefined,
      undefined,
      function(error, data) {
        if (error || !data.filters) {
          logError('failed to retrieve filters');
          log(data);
          callback(error, data);
          return;
        }
        callback(undefined, data.filters);
      }
    );
  }

  /**
   * @function
   *
   * @description retrieves supported filter options for a specific filter.
   *
   * @memberof $caseable
   *
   * @param {string} filterName the filter's name
   * @param {Function} callback a callback which receives an array of strings
   */
  function getFilterOptions(filterName, callback) {
    callback = typeof callback === 'function' ? callback : function() {};

    if (!initialized) {
       callback({error: 'The API needs to be initialized successfully first'});
       return;
    }

    getFilters(function(error, filters) {
      if (error) {
        callback({error: 'failed to retrieve filters'});
        return;
      }
      var filterNames = filters.map(function(filter) {return filter.name});
      if (filterNames.indexOf(filterName) < 0) {
        callback(
          {
            message: '`' + filterName + '` not found in the supported filters,' +
              ' please use the list from $caseable.getFilters'
          }
        );
        return;
      }

      ajaxRequest(
          'GET', '/filters/' + filterName,
          [['partner', partner]],
          undefined,
          callback
      );
    });
  }

  /**
   * @function
   *
   * @description retrieves supported product types.
   *
   * @memberof $caseable
   *
   * @param {Function} callback a callback which receives an array of {@link $caseable.ProductType}
   */
  function getProductTypes(callback) {
    callback = typeof callback === 'function' ? callback : function() {};

    if (!initialized) {
       callback({error: 'The API needs to be initialized successfully first'});
       return;
    }

    ajaxRequest(
      'GET',
      '/products/',
      [
        ['partner', partner],
        ['lang', lang],
        ['region', region]
      ],
      undefined,
      function(error, data) {
        if (error || !data.productTypes) {
          logError('failed to retrieve product types');
          log(error);
          log(data);
          callback(error, data);
          return;
        }
        callback(undefined, data.productTypes);
      }
    );
  }
  /**
   * @typedef {Array<Array<string, string>>} PairsArray
   */
  /**
   * @function
   *
   * @description searches the catalog for products with the given parameters
   *
   * @memberof $caseable
   *
   *
   *
   * @param {string} params.type product type, this is the only mandatory parameter
   * @param {Object[]} params search parameters as an array of name-value pairs.
   *                possible parameters are documented below
   * @param {string} params[].0 one of {'artist', 'device', 'category',
   *                 'color', 'gender', 'tag', 'limit', 'page'}
   *
   * @param {string} params[].1 comma-separated list of ids, excluding the attributes: <br>
   *                 'gender': 'male' or 'female' <br>
   *                 'page' and 'limit': an integer
   * @param {Function} callback a callback which receives an array of {@link $caseable.Product}
   */
  function getProducts(type, params, callback) {
    callback = typeof callback === 'function' ? callback : function() {};

    if (!initialized) {
       callback({error: 'The API needs to be initialized successfully first'});
       return;
    }

    if (!type) {
      var typeRequiredMsg = '`type` parameter is required';
      logError(typeRequiredMsg);
      callback({error: typeRequiredMsg});
      return;
    }

    getFilters(function(error, filters) {
      if (error) {
        callback({error: 'failed to retrieve filters'});
        return;
      }

      var filterIsMultiValue = {};

      filters.forEach(function(filter) {
          filterIsMultiValue[filter.name] = filter.multiValue;
      });

      var errors = [];
      var seen = {};
      params.forEach(function(pair) {
        var name = pair[0];
        var value = pair[1];
        if (filterIsMultiValue[name] === undefined) {
            errors.push('undefined filter ' + name);
            return;
        }
        if (seen[name] && !filterIsMultiValue[name]) {
            errors.push('multiple values are not allowed for ' + name);
            return;
        }
        seen[name] = true;
      });

      if (errors.length > 0) {
        callback(
          {
            error: 'Params have the following issues:\n  ' + errors.join('\n  ')
          }
        );
        return;
      }

      var queryParams = params.concat([
          ['partner', partner],
          ['lang', lang],
          ['region', region]
      ]);
      ajaxRequest('GET', '/products/' + type, queryParams, undefined, function(error, data) {
        if (error || !data.products) {
          logError('failed to retrieve products');
          callback(error, data);
          return;
        }
        callback(undefined, data.products);
      });
    });
  }

  // public methods

  var publicApi = {
    initialize: initialize,
    reset: reset,
    getFilters: getFilters,
    getFilterOptions: getFilterOptions,
    getProductTypes: getProductTypes,
    getProducts: getProducts,
    getDevices: getDevices
  };

  if (typeof module != 'undefined' && typeof module.exports != 'undefined') {
    var prop;
    for (prop in publicApi) {
      module.exports[prop] = publicApi[prop];
    }
  }

  if (typeof window != 'undefined') {
    window.$caseable = window.$caseable || {};
    window.$caseable.catalog = publicApi;
  }

})();
