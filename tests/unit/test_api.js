let rewire = require('rewire');
let $caseable = rewire('../../src/caseable-api.js');
let chai = require('chai');
let expect = chai.expect;

// mock the console to catch notices
let mockConsole = {
    nErrors: 0,
    error: function(arg1, arg2, arg3) {
        this.nErrors++;
    },
    reset: function() {
        this.nErrors = 0;
    },
};

// mock XMLHttpRequest

// a map from urls defind as regular expressions to data
var XMLHttpRequestData = {};

const URLS = {
    products: 'https?://[^/\\\s?!]+/products/smartphone-hard-case.*',
    productTypes: 'https?://[^/\\\s?!]+/products.*',
    devices: 'https?://[^/\\\s?!]+/devices.*',
    filters: 'https?://[^/\\\s?!]+/filters$',
    filterGender: 'https?://[^/\\\s?!]+/filters/gender',
    order1: 'https?://[^/\\\s?!]+/orders/1',
    order2: 'https?://[^/\\\s?!]+/order/.*'
};

XMLHttpRequestData[URLS.productTypes] = {
    'productTypes': [
        {
            'id': 'smartphone-flip-case',
            'name': 'Flip Case',
            'productionTime': {
                'max': 4,
                'min': 3
            },
            'sku': 'FC'
        },
        {
            'id': 'smartphone-hard-case',
            'name': 'Hard Case',
            'productionTime': {
                'max': 4,
                'min': 3
            },
            'sku': 'HC'
        },
        {
            'id': 'kletties',
            'name': 'kletties in English is still kletties',
            'productionTime': {
                'max': 4,
                'min': 3
            },
            'sku': 'KL'
        }
    ]
};

XMLHttpRequestData[URLS.products] = {
    products: [
        {
            sku: 'HCXX01210XXCH',
            artist: 'one cool artist',
            design: 'one cool design',
            type: 'TYPE1',
            device: 'Samsung',
            productionTime: {min: 3, max: 10},
            thumbnailUrl: 'http://path.to/thumbnail.png',
            price: 33,
            currency: 'EUR'
        },
        {
            sku: 'KLXX01210XXLK',
            artist: 'another cool artist',
            design: 'another cool design',
            type: 'TYPE2',
            device: 'HTC',
            productionTime: {min: 1, max: 3},
            thumbnailUrl: 'http://path.to/thumbnail2.png',
            price: 23,
            currency: 'USD'
        }
    ]
};

XMLHttpRequestData[URLS.devices] = {
    'devices': [
        {id: 'apple-iphone-5', name: 'Apple iPhone 5', shortName: 'iPhone 5', brand: 'Apple', sku: 'APIP50'},
        {id: 'samsung-galaxy-9', name: 'Galaxy 9', shortName: 'Galaxy 9', brand: 'Samsung', sku: 'SAGX950'}
    ]
};

XMLHttpRequestData[URLS.filters] = {
    'filters': [
        {name: 'artist', multiValue: true, options: []},
        {name: 'gender', multiValue: false, options: ['m', 'f']}
    ]
};

XMLHttpRequestData[URLS.filterGender] = XMLHttpRequestData[URLS.filters].filters[1];

XMLHttpRequestData[URLS.order1] = {
    'orders': [
        {
            id: 1,
            status: 'production',
            statusChanged: 123454321
        }
    ]
};

XMLHttpRequestData[URLS.order2] = XMLHttpRequestData[URLS.order1].orders[0];


let mockXMLHttpRequest = function() {
    var self = this;

    self.url = null;
    self.verb = null;
    self.loadHandler = null;
    self.status = 0;
    self.responseText = '{}';

    self.addEventListener = function(event, callback) {
        if (event === 'load') {
            self.loadHandler = callback;
        }
    };

    self.setRequestHeader = function(n, v) {};

    self.open = function(verb, url) {
        self.url = url;
        self.verb = verb;

        // find matching data

        const urlOrder = [
            'products',
            'productTypes',
            'filterGender',
            'filters',
            'order1',
            'order2',
            'devices'
        ];
        for (url of urlOrder) {
            var urlRegex = URLS[url];
            let regex = new RegExp(urlRegex);
            if (regex.test(self.url)) {
                self.responseText = JSON.stringify(XMLHttpRequestData[urlRegex]);
                break;
            }
        }
    };

    self.send = function(data) {
        if (self.loadHandler) {
            if (!self.responseText) {
                throw 'responseText not set before handler is called!';
            }
            self.status = 200;
            self.loadHandler();
        }
    };
};

// replace definitions with mock ones within the module under test
$caseable.__set__({
    btoa: (data) => '',
    console: mockConsole,
    XMLHttpRequest: mockXMLHttpRequest
});

describe('Caseable API', function() {

    afterEach(
        function() {
            mockConsole.reset();
        }
    );

    describe('Initialization', function() {
        it('Should warn on invalid language', function(done) {
            $caseable.initialize('some-partner', 'invalid-language', 'eu');
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should warn on invalid region', function(done) {
            $caseable.initialize('some-partner', 'en', 'invalid-region');
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should warn on invalid language and region', function(done) {
            $caseable.initialize('some-partner', 'invalid-language', 'invalid-region');
            expect(mockConsole.nErrors).to.equal(2);
            done();
        });

        it('Should be initialized successfully with proper parameters', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            $caseable.getProductTypes(
                function(productTypes) {
                    productTypes = productTypes.map((cls) => cls.toObject());
                    expect(productTypes).to.deep.equal(
                        XMLHttpRequestData[URLS.productTypes].productTypes
                    );
                }
            );
            $caseable.getFilters(
                function(filters) {
                    filters = filters.map((cls) => cls.toObject());
                    expect(filters).to.deep.equal(
                        XMLHttpRequestData[URLS.filters].filters
                    );
                }
            );
            $caseable.getDevices(
                function(devices) {
                    devices = devices.map((cls) => cls.toObject());
                    expect(devices).to.deep.equal(
                        XMLHttpRequestData[URLS.devices].devices
                    );
                }
            );
            done();
        });
    });

    describe('Filter Options', function() {
        it('Should fail to retrieve an unkonwn filter options', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            $caseable.getFilterOptions(
                'invalid-filter-name',
                function(filterOptions) {
                    done(new Error('With an unknown filter, the callback should not be invoked.'));
                }
            );
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should retrieve correct filter options successfully', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            $caseable.getFilterOptions(
                'gender',
                function(filterOptions) {
                    expect(filterOptions).to.deep.equal(XMLHttpRequestData[URLS.filterGender]);
                }
            );
            done();
        });
    });

    describe('Product Search', function() {
        it('Should fail to search with undefined product type', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            $caseable.getProducts(
                {},
                function(products) {
                    done(new Error('With an undefined product type, the callback should not be invoked.'));
                }
            );
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should fail to search with unknown product type', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            $caseable.getProducts(
                {type: 'invalid-type'},
                function(products) {
                    done(new Error('With an unknown product type, the callback should not be invoked.'));
                }
            );
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should search products with proper product type successfully', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            $caseable.getProducts(
                {type: 'smartphone-hard-case'},
                function(products) {
                    products = products.map((p) => p.toObject());
                    expect(products).to.deep.equal(XMLHttpRequestData[URLS.products].products);
                }
            );
            done();
        });
    });

    describe('Retrieving Orders', function() {
        it('Should fail to retrieve orders without ids', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            $caseable.getOrders(
                undefined, undefined,
                function(orders) {
                    done(new Error('With undefined order ids, the callback should not be invoked.'));
                }
            );
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should fail to retrieve orders with undefined credentials', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            $caseable.getOrders(
                [1], undefined,
                function(orders) {
                    done(new Error('With undefined credentials, the callback should not be invoked.'));
                }
            );
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should fail to retrieve orders with undefined username', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            $caseable.getOrders(
                [1], {pass: '123'},
                function(orders) {
                    done(new Error('With undefined username, the callback should not be invoked.'));
                }
            );
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should fail to retrieve orders with undefined password', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            $caseable.getOrders(
                [1], {user: '123'},
                function(orders) {
                    done(new Error('With undefined password, the callback should not be invoked.'));
                }
            );
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should retrieve orders with proper parameters successfully', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            $caseable.getOrders(
                [1], {user: '123', pass: '123'},
                function(orders) {
                    orders = orders.map((o) => o.toObject());
                    expect(orders).to.deep.equal(XMLHttpRequestData[URLS.order1].orders);
                }
            );
            done();
        });
    });

    describe('Updating Orders', function() {
        it('Should fail to update orders with undefind id', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            $caseable.updateOrder(
                undefined, undefined, undefined,
                function(orders) {
                    done(new Error('With undefined order id, the callback should not be invoked.'));
                }
            );
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should fail to update orders with undefind status', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            $caseable.updateOrder(
                2, undefined, undefined,
                function(orders) {
                    done(new Error('With undefined order status, the callback should not be invoked.'));
                }
            );
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should fail to update orders with invalid status', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            $caseable.updateOrder(
                2, 'partially-paid', undefined,
                function(orders) {
                    done(new Error('With invalid order status, the callback should not be invoked.'));
                }
            );
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should fail to update order with undefined credentials', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            $caseable.updateOrder(
                2, 'paid', undefined,
                function(orders) {
                    done(new Error('With undefined credentials, the callback should not be invoked.'));
                }
            );
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should fail to update orders with undefined username', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            $caseable.updateOrder(
                2, 'paid', {pass: '123'},
                function(orders) {
                    done(new Error('With undefined username, the callback should not be invoked.'));
                }
            );
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should fail to update orders with undefined password', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            $caseable.updateOrder(
                2, 'paid', {user: '123'},
                function(orders) {
                    done(new Error('With undefined password, the callback should not be invoked.'));
                }
            );
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should update order with proper parameters successfully', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            $caseable.updateOrder(
                2, 'paid', {user: '123', pass: '123'},
                function(order) {
                    order = order.toObject();
                    expect(order).to.deep.equal(XMLHttpRequestData[URLS.order1].orders[0]);
                }
            );
            expect(mockConsole.nErrors).to.equal(0);
            done();
        });
    });

    describe('Placing Orders', function() {
        const clone = (obj) => JSON.parse(JSON.stringify(obj));
        const validOrderRequest = {
            address: {
                firstName: 'Hans',
                lastName: 'Mueller',
                company: undefined,
                street: 'Gaussstr. 81',
                postcode: '12321',
                city: 'Berlin',
                state: undefined,
                country: 'Germany'
            },
            customer: {
                firstName: 'Hans',
                lastName: 'Mueller',
                email: 'hans.mueller@mail.com',
                phone: undefined
            },
            items: [
                { sku: 'HCXX01210XXCH' }
            ]
        };

        it('Should fail to place an order with missing address first name', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            let request = new $caseable.OrderRequest(clone(validOrderRequest));
            request.address.firstName = undefined;
            $caseable.placeOrder(
                request,
                {user: '123', pass: '123'},
                function(orders) {
                    done(new Error('With undefined address field(s), the callback should not be invoked.'));
                }
            );
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should fail to place an order with missing address last name', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            let request = new $caseable.OrderRequest(clone(validOrderRequest));
            request.address.lastName = undefined;
            $caseable.placeOrder(
                request,
                {user: '123', pass: '123'},
                function(orders) {
                    done(new Error('With undefined address field(s), the callback should not be invoked.'));
                }
            );
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should fail to place an order with missing street address', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            let request = new $caseable.OrderRequest(clone(validOrderRequest));
            request.address.street = undefined;
            $caseable.placeOrder(
                request,
                {user: '123', pass: '123'},
                function(orders) {
                    done(new Error('With undefined address field(s), the callback should not be invoked.'));
                }
            );
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should fail to place an order with missing postcode', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            let request = new $caseable.OrderRequest(clone(validOrderRequest));
            request.address.postcode = undefined;
            $caseable.placeOrder(
                request,
                {user: '123', pass: '123'},
                function(orders) {
                    done(new Error('With undefined address field(s), the callback should not be invoked.'));
                }
            );
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should fail to place an order with missing city', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            let request = new $caseable.OrderRequest(clone(validOrderRequest));
            request.address.city = undefined;
            $caseable.placeOrder(
                request,
                {user: '123', pass: '123'},
                function(orders) {
                    done(new Error('With undefined address field(s), the callback should not be invoked.'));
                }
            );
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should fail to place an order with missing country', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            let request = new $caseable.OrderRequest(clone(validOrderRequest));
            request.address.country = undefined;
            $caseable.placeOrder(
                request,
                {user: '123', pass: '123'},
                function(orders) {
                    done(new Error('With undefined address field(s), the callback should not be invoked.'));
                }
            );
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should fail to place an order with missing customer first name', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            let request = new $caseable.OrderRequest(clone(validOrderRequest));
            request.customer.firstName = undefined;
            $caseable.placeOrder(
                request,
                {user: '123', pass: '123'},
                function(orders) {
                    done(new Error('With undefined customer field(s), the callback should not be invoked.'));
                }
            );
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should fail to place an order with missing customer last name', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            let request = new $caseable.OrderRequest(clone(validOrderRequest));
            request.customer.lastName = undefined;
            $caseable.placeOrder(
                request,
                {user: '123', pass: '123'},
                function(orders) {
                    done(new Error('With undefined customer field(s), the callback should not be invoked.'));
                }
            );
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should fail to place an order with missing customer email address', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            let request = new $caseable.OrderRequest(clone(validOrderRequest));
            request.customer.email = undefined;
            $caseable.placeOrder(
                request,
                {user: '123', pass: '123'},
                function(orders) {
                    done(new Error('With undefined customer field(s), the callback should not be invoked.'));
                }
            );
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should fail to place an order with invalid customer email address', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            let request = new $caseable.OrderRequest(clone(validOrderRequest));
            request.customer.email = 'hans.mueller@';
            $caseable.placeOrder(
                request,
                {user: '123', pass: '123'},
                function(orders) {
                    done(new Error('With undefined customer field(s), the callback should not be invoked.'));
                }
            );
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should fail to place an order with no items', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            let request = new $caseable.OrderRequest(clone(validOrderRequest));
            request.items = [];
            $caseable.placeOrder(
                request,
                {user: '123', pass: '123'},
                function(orders) {
                    done(new Error('With no items, the callback should not be invoked.'));
                }
            );
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should place an order with proper parameters successfully', function(done) {
            $caseable.initialize('some-partner', 'en', 'eu');
            expect(mockConsole.nErrors).to.equal(0);
            $caseable.placeOrder(
                new $caseable.OrderRequest(validOrderRequest),
                {user: '123', pass: '123'},
                function(order) {
                    order = order.toObject();
                    expect(order).to.deep.equal(XMLHttpRequestData[URLS.order1].orders[0]);
                }
            );
            done();
        });
    });
});
