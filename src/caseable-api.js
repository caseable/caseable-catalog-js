(function(scope, undefined) {
    'strict mode';

    // class definitions

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

    function OrderStatus(init) {
        var self = this;
        var attributeDefaults = {
            id: -1,
            status: '',
            statusChanged: -1
        };

        BaseClass.call(self, attributeDefaults, init);
    }

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
    var baseApiUrl = 'http://freyja.caseable.test';
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

    function getDevices(callback) {
        callback && callback(devices);
    }

    function getFilters(callback) {
        callback && callback(filters);
    }

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

    function getProductTypes(callback) {
        callback && callback(productTypes);
    }

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
