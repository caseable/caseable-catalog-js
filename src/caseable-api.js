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
    'strict mode';

    function BaseClass(attributeDefaults, init) {
        var self = this;
        var attributeDefaults = attributeDefaults;
        Object.keys(attributeDefaults).forEach(
            function(attribute) {
                self[attribute] = init[attribute] || attributeDefaults[attribute];
            }
        );
        self.toObject = function() {
            var obj = {};

            Object.keys(attributeDefaults).forEach(
                function(attribute) {
                    obj[attribute] = self[attribute];
                }
            );
            return obj;
        };
    }

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
        var self = this;
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

        BaseClass.call(self, attributeDefaults, init);
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
        var self = this;
        var attributeDefaults = {
            id: '',
            name: '',
            sku: '',
            productionTime: {min: -1, max: -1}
        };

        BaseClass.call(self, attributeDefaults, init);
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
        var self = this;
        var attributeDefaults = {
            id: '',
            name: '',
            shortName: '',
            brand: '',
            sku: ''
        };

        BaseClass.call(self, attributeDefaults, init);
    }

   /**
     * @constructor
     * @description represents an order request
     *
     * @memberof $caseable
     *
     * @param {Object} init
     * @param {Object} init.address
     * @param {string} init.address.firstName The receiver's first name
     * @param {string} init.address.lastName The receiver's last name
     * @param {string} init.address.company The receiver's company (optional)
     * @param {string} init.address.street The receiver's street
     * @param {string} init.address.postcode The receiver's post code
     * @param {string} init.address.city The receiver's city
     * @param {string} init.address.state The receiver's state (optional)
     * @param {string} init.address.country The receiver's country
     * @param {Object} init.customer
     * @param {string} init.customer.firstName The customer's first name
     * @param {string} init.customer.lastName The customer's last name
     * @param {string} init.customer.email The customer's email address
     * @param {string} init.customer.phone The customer's phone number (optional)
     * @param {Array} init.items
     * @param {Object} init.items.#
     * @param {string} init.items.#.sku The product's sku
     * @param {int} init.items.#.quantity The product's quantity (optional, defaults to 1)
     */
    function OrderRequest(init) {
        var self = this;
        var attributeDefaults = {
            address: {
                firstName: '',
                lastName: '',
                company: '',
                street: '',
                postcode: '',
                city: '',
                state: '',
                country: ''
            },
            customer: {
                firstName: '',
                lastName: '',
                email: '',
                phone: ''
            },
            items: []
        };


        BaseClass.call(self, attributeDefaults, init);

        function isValidString(string) {
            return string && string.length > 1;
        }

       /**
         * @function
         *
         * @memberof $caseable.OrderRequest
         *
         * @return {boolean} whether the order request is valid
         */
        self.isValid = function() {
            if (!self.address) return false;
            if (!self.customer) return false;
            if (!self.items || self.items.length == 0) return false;

            if (!isValidString(self.address.firstName)) return false;
            if (!isValidString(self.address.lastName)) return false;
            if (!isValidString(self.address.street)) return false;
            if (!isValidString(self.address.postcode)) return false;
            if (!isValidString(self.address.city)) return false;
            if (!isValidString(self.address.country)) return false;

            if (!isValidString(self.customer.firstName)) return false;
            if (!isValidString(self.customer.lastName)) return false;
            if (!isValidString(self.customer.email)) return false;
            if (!/\S+@\S+\.\S+/.test(self.customer.email)) return false;

            for (var i = 0; i < self.items.length; i++) {
                if (!self.items[i].sku) return false;
            }

            return true;
        };
    }

    /**
      * @constructor
      * @description represents an order status
      *
      * @memberof $caseable
      *
      * @param {Object} init
      * @param {string} init.id the order's id
      * @param {string} init.status the order's status
      * @param {string} init.statusChanged the time stamp of the last status change
      */
    function OrderStatus(init) {
        var self = this;
        var attributeDefaults = {
            id: -1,
            status: '',
            statusChanged: -1
        };

        BaseClass.call(self, attributeDefaults, init);
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
        var self = this;
        var attributeDefaults = {
            name: '',
            multiValue: false,
            options: []
        };

        BaseClass.call(self, attributeDefaults, init);
    }

    // private attributes
    var baseApiUrl = 'http://catalog.caseable.com';
    var partner = undefined;
    var lang = undefined;
    var region = undefined;
    var productTypes = [];
    var filters = [];
    var devices = [];

    // private methods

    function log(message, type='info') {
        switch (type) {
            case 'error':
                (console && console.error) && console.error(message);
                break;
            case 'info':
                (console && console.info) && console.info(message);
                break;
        }
    }

    function ajaxRequest(endpoint, method, parameters, callback, credentials) {

        var xhr = new XMLHttpRequest();
        var url;
        var query = '';

        // filter invalid lang and region parameters

        if (parameters && !lang) {
            delete parameters['lang'];
        }

        if (parameters && !region) {
            delete parameters['region'];
        }

        if (method == 'GET' && parameters) {
            var query = '?';
            Object.keys(parameters).forEach(
                function(name) {
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(parameters[name]) + '&';
                }
            );
            query = query.replace(/\&$/, '');
        }

        url = baseApiUrl + endpoint + query;

        xhr.addEventListener('load',
            function() {
                if (xhr.status === 200 || xhr.status === 201) {
                    callback && callback(JSON.parse(xhr.responseText));
                }
                else {
                    log('Request failed. Returned status of ' + xhr.status, 'error');
                    callback && callback(JSON.parse(xhr.responseText));
                }
            }
        );

        xhr.open(method, url, true);
        xhr.setRequestHeader('Accept', 'application/caseable.v1+json');
        if (credentials) {
            xhr.setRequestHeader(
                'Authorization',
                'Basic ' + btoa(credentials.user + ':' + credentials.pass)
            );
        }
        if (parameters && method != 'GET') xhr.send(parameters);
        else xhr.send(null);
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
     * @param {string} lang the preferred language
     * @param {string} region the preferred region
     */
    function initialize(argPartner, argLang, argRegion) {
        // set private global parameters
        partner = argPartner;
        lang = argLang || 'en';
        region = argRegion || 'eu';

        // validate
        if ('de, en, es, fr, it, pl'.indexOf(lang) < 0) {
            log('invalid language `' + lang + '`, a default value will be used' , 'error');
        }

        if ('ca, ch, eu, gb, jp, oc, pl, us'.indexOf(region) < 0) {
            log('invalid region `' + region + '`, a default value will be used' , 'error');
        }

        // pre-fetch product types
        ajaxRequest(
            '/products',
            'GET',
            {
                partner: partner,
                lang: lang,
                region: region
            },
            function(data) {
                if (!data.productTypes) {
                    log('failed to retrieve product types', 'error');
                    log(data);
                    return;
                }
                productTypes = data.productTypes.map(
                    function(obj) {
                        return new ProductType(obj);
                    }
                );
            }
        );

        // pre-fetch devices
        ajaxRequest(
            '/devices',
            'GET',
            undefined,
            function(data) {
                if (!data.devices) {
                    log('failed to retrieve devices', 'error');
                    log(data);
                    return;
                }
                devices = data.devices.map(
                    function(obj) {
                        return new Device(obj);
                    }
                );
            }
        );

        // pre-fetch filters
        ajaxRequest(
            '/filters',
            'GET',
            undefined,
            function(data) {
                if (!data.filters) {
                    log('failed to retrieve filters', 'error');
                    log(data);
                    return;
                }
                filters = data.filters.map(
                    function(obj) {
                        return new Filter(obj);
                    }
                );
            }
        );
    }

    /**
     * @function
     *
     * @description retrieves avaialable devices. Note that this method is
     * synchronous (i.e. will execute your callback immediately)
     *
     * @memberof $caseable
     *
     * @param {Function} callback a callback which receives an array of {@link $caseable.Device}
     */
    function getDevices(callback) {
        callback && callback(devices);
    }

    /**
     * @function
     *
     * @description retrieves supported filters. Note that this method is
     * synchronous (i.e. will execute your callback immediately)
     *
     * @memberof $caseable
     *
     * @param {Function} callback a callback which receives an array of {@link $caseable.Filter}
     */
    function getFilters(callback) {
        callback && callback(filters);
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
        if (filters.map(function(d) {return d.name}).indexOf(filterName) < 0) {
            log(
                '`' + filterName + '` not found in the supported filters,' +
                ' please use the list from $caseable.getFilters',
                'error'
            );
            return;
        }

        ajaxRequest(
            '/filters/' + filterName,
            'GET',
            {partner: partner},
            function(data) {
                callback && callback(data);
            }
        );
    }

    /**
     * @function
     *
     * @description retrieves order statuses for given orders
     *
     * @memberof $caseable
     *
     * @param {Array} ids a list of order ids
     * @param {Object} credentials
     * @param {string} credentials.user user name
     * @param {string} credentials.pass password
     * @param {Function} callback a callback which receives an array of {@link $caseable.OrderStatus}
     */
    function getOrders(ids, credentials, callback) {

        if (!ids || !ids.join) {
            log('Please enter a list of order ids', 'error');
            return;
        }

        if (!credentials || !credentials.user || !credentials.pass) {
            log('Please provide valid credentials, e.g.: {user: "xxx", pass: "yyy"}', 'error');
            return;
        }

        ajaxRequest(
            '/orders/' + ids.join(','),
            'GET',
            undefined,
            function(data) {
                if (data.warning) {
                    log('warning on retrieving orders: ' + data.warning, 'error');
                }
                callback && callback(data.orders.map(function(obj) {return new OrderStatus(obj)}));
            },
            credentials
        );
    }

    /**
     * @function
     *
     * @description creates a new order
     *
     * @memberof $caseable
     *
     * @param {$caseable.OrderRequest} orderRequest a valid order request
     * @param {Object} credentials
     * @param {string} credentials.user user name
     * @param {string} credentials.pass password
     * @param {Function} callback a callback which receives the created {@link $caseable.OrderStatus}
     */
    function placeOrder(orderRequest, credentials, callback) {

        if (!orderRequest.isValid()) {
            log('Please provide a valid order request with all required parameters.', 'error');
            return;
        }

        if (!credentials || !credentials.user || !credentials.pass) {
            log('Please provide valid credentials, e.g.: {user: "xxx", pass: "yyy"}', 'error');
            return;
        }

        ajaxRequest(
            '/order/',
            'POST',
            JSON.stringify(orderRequest.toObject()),
            function(data) {
                callback && callback(new OrderStatus(data));
            },
            credentials
        );
    }

    /**
     * @function
     *
     * @description updates the status of a specific order
     *
     * @memberof $caseable
     *
     * @param {string} id order id
     * @param {string} status either "paid" or "cancelled"
     * @param {Object} credentials
     * @param {string} credentials.user user name
     * @param {string} credentials.pass password
     * @param {Function} callback a callback which receives the updated {@link $caseable.OrderStatus}
     */
    function updateOrder(id, status, credentials, callback) {

        if (!id) {
            log('Please provide a valid order id.', 'error');
            return;
        }

        if ('paid, cancelled'.indexOf(status) < 0) {
            log('Please provide a valid status (either paid or cancelled).', 'error');
            return;
        }

        if (!credentials || !credentials.user || !credentials.pass) {
            log('Please provide valid credentials, e.g.: {user: "xxx", pass: "yyy"}', 'error');
            return;
        }

        ajaxRequest(
            '/order/' + id,
            'PATCH',
            JSON.stringify({ status: status }),
            function(data) {
                callback && callback(new OrderStatus(data));
            },
            credentials
        );
    }

    /**
     * @function
     *
     * @description retrieves supported product types. Note that this method is
     * synchronous (i.e. will execute your callback immediately)
     *
     * @memberof $caseable
     *
     * @param {Function} callback a callback which receives an array of {@link $caseable.ProductType}
     */
    function getProductTypes(callback) {
        callback && callback(productTypes);
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
        if (!params['type']) {
            log('`type` parameter is required, please consult $caseable.getProductTypes', 'error');
            return;
        }

        if (productTypes.map(function(pt) {return pt.id}).indexOf(params.type) < 0) {
            log(
                '`' + params.type + '` not found in the supported product types,' +
                ' please use the list from $caseable.getProductTypes',
                'error'
            );
            return;
        }

        var allowedParams = ['device', 'artist', 'category', 'color', 'gender', 'tag', 'limit', 'page'];
        var queryParams = {};
        allowedParams.forEach(
            function(p) {
                if (params[p]) queryParams[p] = params[p];
            }
        );

        queryParams['partner'] = partner;
        queryParams['lang'] = lang;
        queryParams['region'] = region;

        ajaxRequest(
            '/products/' + params.type,
            'GET',
            queryParams,
            function(data) {
                if (!data.products) {
                    log('failed to retrieve products', 'error');
                    log(data);
                    return;
                }
                callback && callback(
                    data.products.map(
                        function(obj) {
                            return new Product(obj);
                        }
                    )
                );
            }
        );
    }

    // public methods

    var publicApi = {
        OrderRequest: OrderRequest,
        initialize: initialize,
        getFilters: getFilters,
        getFilterOptions: getFilterOptions,
        getProductTypes: getProductTypes,
        getProducts: getProducts,
        getOrders: getOrders,
        placeOrder: placeOrder,
        updateOrder: updateOrder,
        getDevices: getDevices
    };

    if (typeof module != 'undefined' && typeof module.exports != 'undefined') {
        for (var prop in publicApi) {
            module.exports[prop] = publicApi[prop];
        }
    }

    if (typeof window != 'undefined') {
        window.$caseable = publicApi;
    }

})();
