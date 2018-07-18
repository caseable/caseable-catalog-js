(function($){
  var catalog = require('../caseable.catalog');
  var svgs = require('./svgs');

  catalog.initialize('http://catalog.caseable.com', 'partner-id', 'eu', 'de');

  function CaseChooser(device) {
    this.device = device;
    this.productTypes = null;
    this.products = null;
    this.currentProductType = null;
    this.currentProducts = [];
  }

  CaseChooser.prototype.init = function(callback) {
    var self = this;
    self.fetchProductTypes(callback);
  };

  CaseChooser.prototype.fetchProductTypes = function(callback) {
    var self = this;
    catalog.getProductTypes(function(error, types) {
      self.currentProductType = {
        "id": "smartphone-hard-case",
        "name": "Smartphone Hard Case",
        "productionTime": {
          "max": 6,
          "min": 3
        },
        "sku": "HC"
      };//types[0];
      self.productTypes = types;

      self.fetchProducts(self.currentProductType, callback);
    });
  };

  CaseChooser.prototype.fetchProducts = function(productType, callback) {
    var self = this;
    catalog.getProducts({type: productType.id, device: self.device}, function(error, products) {
      self.products = products;
      callback();
    });
  };

  CaseChooser.prototype.changeProductType = function(productType, callback) {
    this.currentProductType = productType;
    this.fetchProducts(productType, callback);
  };

  $.fn.caseableWidget = function(device) {
    var self = this;
    var caseChooser = new CaseChooser(device);
    caseChooser.init(function() {
      var wrapper = $('<div/>');
      wrapper.addClass('wrapper');
      renderLogoSection(wrapper);
      renderCategoriesSection(wrapper);
      renderProductTypesSection(wrapper, caseChooser);
      renderProducts(wrapper, caseChooser);

      self.append(wrapper);
    });
    return this;
  };

  function renderLogoSection(wrapper) {
    var logoSection = $('<div/>');
    logoSection.addClass('logo');
    var header = $('<h3></h3>').text('Deine neue Huelle fuer dein Handy');
    logoSection.append(header);
    logoSection.append(svgs.caseableLogo);
    wrapper.append(logoSection);
  }

  function renderProductTypesSection(wrapper, caseChooser) {
    wrapper.find('.productTypes').remove();

    var productTypes = $('<div/>');
    productTypes.addClass('productTypes');

    caseChooser.productTypes.forEach(function(type) {
      var typeElement = $('<div/>').text(type.name);
      typeElement.addClass('productType');
      typeElement.on('click', function() {
        caseChooser.changeProductType(type, function() {
          renderProducts(wrapper, caseChooser);
        });
      });
      productTypes.append(typeElement);
    });
    wrapper.append(productTypes);
  }

  function renderProducts(wrapper, caseChooser) {
    wrapper.find('.products').remove();
    var products = $('<div/>');

    products.addClass('products');
    caseChooser.products.forEach(function(product) {
      var productElement = $('<div/>');
      productElement.addClass('product');
      var image = $('<img />');
      image.attr('src', product.thumbnailUrl);
      productElement.append(image);
      products.append(productElement);
    });

    // Postpone to the next tick so that dimensions calculated properly
    setTimeout(function() {
      products.slick({
        arrows: true,
        slidesToShow: 3,
        slidesToScroll: 3,
        prevArrow: svgs.slickPrevArrow,
        nextArrow: svgs.slickNextArrow
      });
    });

    wrapper.append(products);
  }

  function renderCategoriesSection(wrapper) {
    var categories = $('<div/>');
    wrapper.append(categories);
  }

})(jQuery);



