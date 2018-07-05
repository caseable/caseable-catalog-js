let rewire = require('rewire');
let $caseable = rewire('../../src/caseable.catalog.js');
let chai = require('chai');
let expect = chai.expect;

const baseApiUrl = 'http://catalog.caseable.com';

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
    filterGender: 'https?://[^/\\\s?!]+/filters/gender'
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
            $caseable.initialize(baseApiUrl, 'some-partner', 'invalid-language', 'eu');
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should warn on invalid region', function(done) {
            $caseable.initialize(baseApiUrl, 'some-partner', 'en', 'invalid-region');
            expect(mockConsole.nErrors).to.equal(1);
            done();
        });

        it('Should warn on invalid language and region', function(done) {
            $caseable.initialize(baseApiUrl, 'some-partner', 'invalid-language', 'invalid-region');
            expect(mockConsole.nErrors).to.equal(2);
            done();
        });

        it('Should be initialized successfully with proper parameters', function(done) {
            $caseable.initialize(baseApiUrl, 'some-partner', 'en', 'eu');
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
            $caseable.initialize(baseApiUrl, 'some-partner', 'en', 'eu');
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
            $caseable.initialize(baseApiUrl, 'some-partner', 'en', 'eu');
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
            $caseable.initialize(baseApiUrl, 'some-partner', 'en', 'eu');
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
            $caseable.initialize(baseApiUrl, 'some-partner', 'en', 'eu');
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
            $caseable.initialize(baseApiUrl, 'some-partner', 'en', 'eu');
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
});
