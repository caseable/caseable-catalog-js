let rewire = require('rewire');
let $caseable = rewire('../../src/caseable.catalog.js');
let chai = require('chai');
let expect = chai.expect;

const baseApiUrl = 'http://catalog.caseable.com';

// mock the console to catch notices
const mockConsole = {
  nErrors: 0,
  error: function(arg1, arg2, arg3) {
    this.nErrors++;
  },
  reset: function() {
    this.nErrors = 0;
  },
};

// mock XMLHttpRequest

// a map from urls (defind as regular expressions) to data
const XMLHttpRequestData = {};

const URLS = {
  products: 'https?://[^/\\\s?!]+/products/smartphone-hard-case.*',
  productTypes: 'https?://[^/\\\s?!]+/products.*',
  devices: 'https?://[^/\\\s?!]+/devices.*',
  filters: 'https?://[^/\\\s?!]+/filters/?$',
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
    {
      id: 'apple-iphone-5',
      name: 'Apple iPhone 5',
      shortName: 'iPhone 5',
      brand: 'Apple',
      sku: 'APIP50'
    },
    {
      id: 'samsung-galaxy-9',
      name: 'Galaxy 9',
      shortName: 'Galaxy 9',
      brand: 'Samsung',
      sku: 'SAGX950'
    }
  ]
};

XMLHttpRequestData[URLS.filters] = {
  'filters': [
    {name: 'tags', multiValue: true, options: []},
    {name: 'artist', multiValue: false, options: []},
    {name: 'gender', multiValue: false, options: ['m', 'f']}
  ]
};

XMLHttpRequestData[URLS.filterGender] = XMLHttpRequestData[URLS.filters].filters[1];

const mockXMLHttpRequest = function() {
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

  self.open = function(verb, argUrl) {
    self.url = argUrl;
    self.verb = verb;

    // find matching data

    const urlOrder = [
      'products',
      'productTypes',
      'filterGender',
      'filters',
      'devices'
    ];
    for (const url of urlOrder) {
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
      $caseable.reset();
    }
  );

  describe('Initialization', function() {
    it('Should fail on invalid API Url', function(done) {
      let inited = $caseable.initialize('httb/invalid-url', 'some-partner', 'eu', 'en');
      expect(inited).to.be.false;
      expect(mockConsole.nErrors).to.equal(1);
      done();
    });

    it('Should be initialized with no warnings with proper parameters', function(done) {
      let inited = $caseable.initialize(baseApiUrl, 'some-partner', 'eu', 'en');
      expect(inited).to.be.true;
      expect(mockConsole.nErrors).to.equal(0);
      done();
    });
  });

  describe('Devices', function() {
    it('Should fail to retrieve devices without initialization', function(done) {
      $caseable.getDevices(function(err, devices) {
        expect(err).to.be.an('object');
        expect(err).to.have.property('error');
        expect(devices).to.be.undefined;
        done();
      });
    });

    it('Should retrieve correct devices successfully after initialization', function(done) {
      $caseable.initialize(baseApiUrl, 'some-partner', 'eu', 'en');
      $caseable.getDevices(function(err, devices) {
        expect(err).to.be.undefined;
        expect(mockConsole.nErrors).to.equal(0);
        expect(devices).to.be.an('array');
        const modelDevice = XMLHttpRequestData[URLS.devices].devices[0];
        devices.forEach(function(device) {
            var prop;
            for (prop in modelDevice) {
                expect(device).to.have.property(prop);
            }
        });
        done();
      });
    });
  });

  describe('Filters', function() {
    it('Should fail to retrieve filters without initialization', function(done) {
      $caseable.getDevices(function(err, filters) {
        expect(err).to.be.an('object');
        expect(err).to.have.property('error');
        expect(filters).to.be.undefined;
        done();
      });
    });

    it('Should retrieve correct filters successfully after initialization', function(done) {
      $caseable.initialize(baseApiUrl, 'some-partner', 'eu', 'en');
      $caseable.getFilters(function(err, filters) {
        expect(err).to.be.undefined;
        expect(mockConsole.nErrors).to.equal(0);
        expect(filters).to.be.an('array');
        const modelFilter = XMLHttpRequestData[URLS.filters].filters[0];
        filters.forEach(function(filter) {
            var prop;
            for (prop in modelFilter) {
                expect(filter).to.have.property(prop);
            }
        });
        done();
      });
    });

    it('Should fail to retrieve filter options without initialization', function(done) {
      $caseable.getDevices(function(err, filterOptions) {
        expect(err).to.be.an('object');
        expect(err).to.have.property('error');
        expect(filterOptions).to.be.undefined;
        done();
      });
    });

    it('Should retrieve filter options after initialization', function(done) {
      $caseable.initialize(baseApiUrl, 'some-partner', 'eu', 'en');
      $caseable.getFilterOptions('gender', function(err, filterOptions) {
        expect(err).to.be.undefined;
        expect(mockConsole.nErrors).to.equal(0);
        expect(filterOptions).to.be.a('object');
        expect(filterOptions).to.deep.equal(XMLHttpRequestData[URLS.filterGender]);
        done();
      });
    });
  });

  describe('Products', function() {
    it('Should fail to retrieve product types without initialization', function(done) {
      $caseable.getProductTypes(function(err, productTypes) {
        expect(err).to.be.an('object');
        expect(err).to.have.property('error');
        expect(productTypes).to.be.undefined;
        done();
      });
    });

    it('Should retrieve correct product types successfully after initialization', function(done) {
      $caseable.initialize(baseApiUrl, 'some-partner', 'eu', 'en');
      $caseable.getProductTypes(function(err, productTypes) {
        expect(err).to.be.undefined;
        expect(mockConsole.nErrors).to.equal(0);
        expect(productTypes).to.be.an('array');
        const modelProductType = XMLHttpRequestData[URLS.productTypes].productTypes[0];
        productTypes.forEach(function(productType) {
            var prop;
            for (prop in modelProductType) {
                expect(productType).to.have.property(prop);
            }
        });
        done();
      });
    });

    it('Should fail to retrieve products without initialization', function(done) {
      $caseable.getProducts(undefined, [], function(err, products) {
        expect(err).to.be.an('object');
        expect(err).to.have.property('error');
        expect(products).to.be.undefined;
        done();
      });
    });

    it('Should fail to retrieve products without product type', function(done) {
      $caseable.initialize(baseApiUrl, 'some-partner', 'eu', 'en');
      $caseable.getProducts(undefined, [], function(err, products) {
        expect(err).to.be.an('object');
        expect(err).to.have.property('error');
        expect(products).to.be.undefined;
        done();
      });
    });

    it('Should fail to retrieve products with unknown filter', function(done) {
      $caseable.initialize(baseApiUrl, 'some-partner', 'eu', 'en');
      let params = [['invalid-filter', 'value']];
      $caseable.getProducts('smartphone-hard-case', params, function(err, products) {
        expect(err).to.be.an('object');
        expect(err).to.have.property('error');
        expect(products).to.be.undefined;
        done();
      });
    });

    it('Should fail to retrieve products with multi values for a single filter', function(done) {
      $caseable.initialize(baseApiUrl, 'some-partner', 'eu', 'en');
      let params = [['artist', 'amy-sia'], ['artist', 'bioworkz']];
      $caseable.getProducts('smartphone-hard-case', params, function(err, products) {
        expect(err).to.be.an('object');
        expect(err).to.have.property('error');
        expect(products).to.be.undefined;
        done();
      });
    });

    it('Should search products with proper product type successfully', function(done) {
      $caseable.initialize(baseApiUrl, 'some-partner', 'eu', 'en');
      let params = [['artist', 'amy-sia'], ['tags', 'rock'], ['tags', 'fun']];
      $caseable.getProducts('smartphone-hard-case', params, function(err, products) {
        expect(err).to.be.undefined;
        expect(mockConsole.nErrors).to.equal(0);
        expect(products).to.be.an('array');
        const modelProduct = XMLHttpRequestData[URLS.products].products[0];
        products.forEach(function(product) {
            var prop;
            for (prop in modelProduct) {
                expect(product).to.have.property(prop);
            }
        });
        done();
      });
    });
  });
});
