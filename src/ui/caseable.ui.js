(function($){
  var catalog = require('../caseable.catalog');
  var svgs = require('./svgs');

  catalog.initialize('http://catalog.caseable.com', 'partner-id', 'eu', 'de');

  function CaseChooser(container, device) {
    // use getter and setter instead
    this.device = device;
    this.productTypes = null;
    this.products = null;
    this.currentProductType = null;
    this.currentProducts = [];

    this.wrapper = $('<div/>');
    this.wrapper.addClass('wrapper');
    this.renderLogoSection();
    this.renderCategoriesSection();

    container.append(this.wrapper);
    this.fetchProductTypes();
  }

  CaseChooser.prototype.fetchProductTypes = function() {
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
      self.renderProductTypesSection();

      self.fetchProducts(self.currentProductType);
    });
  };

  CaseChooser.prototype.fetchProducts = function(productType) {
    var self = this;
    catalog.getProducts({type: productType.id, device: self.device}, function(error, products) {
      self.products = products;
      self.renderProducts();
    });
  };

  CaseChooser.prototype.renderLogoSection = function() {
    var logoSection = $('<div/>');
    logoSection.addClass('logo');

    var header = $('<h3></h3>').text('Deine neue Huelle fuer dein Handy');
    logoSection.append(header);
    logoSection.append(svgs.caseableLogo);
    this.wrapper.append(logoSection);
  };

  CaseChooser.prototype.renderProductTypesSection = function() {
    var self = this;
    this.wrapper.find('.productTypes').remove();

    var productTypes = $('<div/>');
    productTypes.addClass('productTypes');

    this.productTypes.forEach(function(type) {
      var typeElement = $('<div/>').text(type.name);
      typeElement.addClass('productType');
      typeElement.on('click', function() {
        self.changeProductType(type);
      });

      productTypes.append(typeElement);
    });
    this.wrapper.append(productTypes);
  };

  CaseChooser.prototype.renderProducts = function() {
    this.wrapper.find('.products').remove();
    var products = $('<div/>');

    products.addClass('products');
    this.products.forEach(function(product) {
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

    this.wrapper.append(products);
  };

  CaseChooser.prototype.renderCategoriesSection = function() {
    var categories = $('<div/>');
    this.wrapper.append(categories);
  };

  CaseChooser.prototype.changeProductType = function(productType) {
    this.currentProductType = productType;
    this.fetchProducts(productType);
  };

  $.fn.caseableWidget = function(device) {
    new CaseChooser(this, device);
    return this;
  };

})(jQuery);



