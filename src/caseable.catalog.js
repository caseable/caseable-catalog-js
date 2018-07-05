/**
 * @file
 * @description This is the Javascript library to access the products catalog from browser and node.
 *
 * To include the library in your web app, copy caseable-api.min.js somewhere on the server,
 * then on your page's `head` or `body`, include
 * <code>
 *   <pre>
 *     &lt;script type="text/Javascript" src="{path.to}/caseable-api.min.js"&gt;&lt;/script&gt;
 *   </pre>
 * </code>
 * The only requirement on browser is to support
 * [JSON]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON}.
 * <br />
 * To include the library in your node app, add
 * <code>
 *   <pre>
 *     let $caseable = require('{path.to}/caseable-api.min.js');
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
 *  {@link $caseable.initialize}('your-partner-id', 'en', 'eu');
 *
 *  // some time later (e.g. using setTimeout)
 *
 *  {@link $caseable.getProducts}(
 *    {
 *      type: "smartphone-flip-case",
 *      "color": "red"
 *    },
 *    { user: "xxx", pass: "xxx" },
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

    var clone = (obj) => JSON.parse(JSON.stringify(obj));

    function BaseClass(argAttributeDefaults, init) {
        var self = this;
        var attributeDefaults = clone(argAttributeDefaults);
        this.attributeDefaults = attributeDefaults;
        Object.keys(attributeDefaults).forEach(function(attribute) {
            self[attribute] = (attribute in init) ? init[attribute] : attributeDefaults[attribute];
        });
    }

    BaseClass.prototype.toObject = function() {
        var obj = {};

        Object.keys(this.attributeDefaults).forEach(function(attribute) {
            obj[attribute] = this[attribute];
        });
        return obj;
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
        var attributeDefaults = {
            sku: '',
            artist: '',
            design: '',
            type: '',
            device: '',
            productionTime: {min: -1, max: -1},
            thumbnailUrl: '',
            price: -1,
            currency: ''
        };

        BaseClass.call(this, attributeDefaults, init);
    }

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
        var attributeDefaults = {
            id: '',
            name: '',
            sku: '',
            productionTime: {min: -1, max: -1}
        };

        BaseClass.call(this, attributeDefaults, init);
    }

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
        var attributeDefaults = {
            id: '',
            name: '',
            shortName: '',
            brand: '',
            sku: ''
        };

        BaseClass.call(this, attributeDefaults, init);
    }

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
        var attributeDefaults = {
            name: '',
            multiValue: false,
            options: []
        };

        BaseClass.call(this, attributeDefaults, init);
    }

    // private attributes
    var baseApiUrl;
    var partner;
    var lang;
    var region;
    var initialized = false;

    // private methods

    function log(message) {
        (console && console.info) && console.info(message);
    }

    function logError(message) {
        (console && console.error) && console.error(message);
    }

    function ensureInitialized(callback) {
        if (!initialized) {
            callback({error: 'The module needs to be initialized successfully first'}, undefined);
            return false;
        }
        return true;
    }

    function getXhrInstance() {
        try {
            return new XMLHttpRequest();
        } catch (e) {}
        try {
            return new ActiveXObject('Msxml3.XMLHTTP');
        } catch (e) {}
        try {
            return new ActiveXObject('Msxml2.XMLHTTP.6.0');
        } catch (e) {}
        try {
            return new ActiveXObject('Msxml2.XMLHTTP.3.0');
        } catch (e) {}
        try {
            return new ActiveXObject('Msxml2.XMLHTTP');
        } catch (e) {}
        try {
            return new ActiveXObject('Microsoft.XMLHTTP');
        } catch (e) {}
        return null;
    }

    function ajaxRequest(endpoint, method, parameters, credentials, callback) {

        var xhr = getXhrInstance();
        var url;
        var query = '';

        if (!xhr) {
            logError('Failed to instiantiate XHR, quitting!');
            return;
        }

        // filter invalid lang and region parameters

        if (parameters && !lang) {
            delete parameters['lang'];
        }

        if (parameters && !region) {
            delete parameters['region'];
        }

        if (method === 'GET' && parameters) {
            var query = '?';
            Object.keys(parameters).forEach(function(name) {
                query += encodeURIComponent(name) + '=' + encodeURIComponent(parameters[name]) + '&';
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
            }
            if (xhr.status === 200 || xhr.status === 201) {
                callback && callback(
                    Object.keys(error).length ? error : undefined,
                    response
                );
            } else {
                logError('Request failed. Returned status of ' + xhr.status);
                error['invalidStatus'] = xhr.status;
                callback && callback(error, response);
            }
        });

        xhr.addEventListener('error', function() {
            var response;
            var error = {
                error: 'transfer error occurred'
            };
            try {
                response = JSON.parse(xhr.responseText);
            } catch (e) {
                response = xhr.responseText;
                error['parseError'] = e.toString();
            }
            callback && callback(error, response);
        });

        xhr.addEventListener('abort', function() {
            var response;
            var error = {
                error: 'transfer aborted'
            };
            try {
                response = JSON.parse(xhr.responseText);
            } catch (e) {
                response = xhr.responseText;
                error['parseError'] = e.toString();
            }
            callback && callback(error, response);
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
     * @param {string} partner the partner's id
     * @param {string} region the preferred region
     * @param {string} lang the preferred language
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
            return;
        }

        if ('de, en, es, fr, it, pl'.indexOf(lang) < 0) {
            logError('invalid language `' + lang + '`, a default value will be used');
        }

        if ('ca, ch, eu, gb, jp, oc, pl, us'.indexOf(region) < 0) {
            logError('invalid region `' + region + '`, quitting');
            return;
        }

        initialized = true;

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

        if (!ensureInitialized(callback)) return;

        ajaxRequest(
            '/devices/',
            'GET',
            undefined,
            undefined,
            function(error, data) {
                if (error || !data.devices) {
                    logError('failed to retrieve devices');
                    log(data);
                    callback && callback(error, data);
                    return;
                }
                callback && callback(undefined, data.devices.map(function(obj) {
                    return new Device(obj);
                }));

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

        if (!ensureInitialized(callback)) return;

        ajaxRequest(
            '/filters/',
            'GET',
            undefined,
            undefined,
            function(error, data) {
                if (error || !data.filters) {
                    logError('failed to retrieve filters');
                    log(data);
                    callback && callback(error, data);
                    return;
                }
                callback && callback(undefined, data.filters.map(function(obj) {
                    return new Filter(obj);
                }));
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

        if (!ensureInitialized(callback)) return;

        getFilters(function(error, filters) {
            if (error) {
                callback && callback({error: 'failed to retrieve filters'}, undefined);
                return;
            }
            if (filters.map(function(d) {return d.name}).indexOf(filterName) < 0) {
                callback && callback(
                    {
                        message: '`' + filterName + '` not found in the supported filters,' +
                            ' please use the list from $caseable.getFilters'
                    },
                    undefined
                );
                return;
            }

            ajaxRequest('/filters/' + filterName, 'GET', {partner: partner}, undefined, callback);
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

        if (!ensureInitialized(callback)) return;

        // pre-fetch product types
        ajaxRequest(
            '/products/',
            'GET',
            {
                partner: partner,
                lang: lang,
                region: region
            },
            undefined,
            function(error, data) {
                if (error || !data.productTypes) {
                    logError('failed to retrieve product types');
                    log(error);
                    log(data);
                    callback && callback(error, data);
                    return;
                }
                callback && callback(undefined, data.productTypes.map(function(obj) {
                    return new ProductType(obj);
                }));
            }
        );
    }

    /**
     * @function
     *
     * @description searches the catalog for products with the given parameters
     *
     * @memberof $caseable
     *
     * @param {Object} params search parameters
     * @param {string} params.type product type, this is the only mandatory parameter
     * @param {string} params.device comma-separated list of device ids
     * @param {string} params.artist comma-separated list of artist ids
     * @param {string} params.category comma-separated list of category ids
     * @param {string} params.color comma-separated list of colors ids
     * @param {string} params.gender either "male" or "female"
     * @param {string} params.tag comma-separated list of tags
     * @param {int} params.device maximum number of products returned
     * @param {int} params.device page number
     * @param {Function} callback a callback which receives an array of {@link $caseable.Product}
     */
    function getProducts(params, callback) {

        if (!ensureInitialized(callback)) return;

        if (!params['type']) {
            logError('`type` parameter is required, please consult $caseable.getProductTypes', 'error');
            return;
        }

        getProductTypes(function(error, productTypes) {

            if (error) {
                callback && callback({error: 'failed to retrieve product types'}, undefined);
                return;
            }

            if (productTypes.map(function(pt) {return pt.id}).indexOf(params.type) < 0) {
                callback && callback(
                    {
                        error: '`' + params.type + '` not found in the supported product types',
                        productTypes: productTypes
                    },
                    undefined
                );
                return;
            }

            // TODO also check the device if defined

            var allowedParams = ['device', 'artist', 'category', 'color', 'gender', 'tag', 'limit', 'page'];
            var queryParams = {};
            allowedParams.forEach(function(param) {
                if (param in params) queryParams[param] = params[param];
            });

            queryParams['partner'] = partner;
            queryParams['lang'] = lang;
            queryParams['region'] = region;

            ajaxRequest('/products/' + params.type, 'GET', queryParams, undefined, function(error, data) {
                if (error || !data.products) {
                    logError('failed to retrieve products');
                    callback(error, data);
                    return;
                }
                callback && callback(
                    undefined,
                    data.products.map(
                        function(obj) {
                            return new Product(obj);
                        }
                    )
                );
            });
        });
    }

    // public methods

    var publicApi = {
        initialize: initialize,
        getFilters: getFilters,
        getFilterOptions: getFilterOptions,
        getProductTypes: getProductTypes,
        getProducts: getProducts,
        getDevices: getDevices
    };

    if (typeof module != 'undefined' && typeof module.exports != 'undefined') {
        for (var prop in publicApi) {
            module.exports[prop] = publicApi[prop];
        }
    }

    if (typeof window != 'undefined') {
        window.$caseable = window.$caseable || {};
        window.$caseable.catalog = publicApi;
    }

})();
