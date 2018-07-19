(function($){
  var catalog = require('../caseable.catalog');
  var svgs = require('./svgs');

  function CaseChooser(container, device, selectionChangeCallback) {
    // use getter and setter instead
    this.device = device;
    this.productTypes = null;
    this.products = null;
    // Right now only smartphone hard cases
    this.selectedProductType = {
      "id": "smartphone-hard-case",
      "name": "Smartphone Hard Case",
      "sku": "HC"
    };
    this.selectedProducts = [];
    this.selectionChangeCallback = selectionChangeCallback;

    this.wrapper = $('<div/>');
    this.wrapper.addClass('csbl-wrapper');
    this.renderLogoSection();
    this.renderCategoriesSection();

    container.append(this.wrapper);
    //this.fetchProductTypes();
    this.fetchProducts(this.selectedProductType);
  }

  CaseChooser.prototype.fetchProductTypes = function() {
    var self = this;
    catalog.getProductTypes(function(error, types) {
      self.selectedProductType = types[0];
      self.productTypes = types;

      self.renderProductTypesSection();
      self.fetchProducts(self.selectedProductType);
    });
  };

  CaseChooser.prototype.fetchProducts = function(productType) {
    var self = this;
    catalog.getProducts(productType.id, [["device", self.device]], function(error, products) {
      self.products = products;
      self.renderProducts();
    });
  };

  CaseChooser.prototype.renderLogoSection = function() {
    var logoSection = $('<div/>');
    logoSection.addClass('csbl-logo');

    var header = $('<h4></h4>').text('Deine neue Huelle fuer dein Handy');
    logoSection.append(header);
    logoSection.append(svgs.caseableLogo);
    this.wrapper.append(logoSection);
  };

  CaseChooser.prototype.renderProductTypesSection = function() {
    var self = this;
    this.wrapper.find('.productTypes').remove();

    var productTypes = $('<div/>');
    productTypes.addClass('csbl-productTypes');

    this.productTypes.forEach(function(type) {
      var typeElement = $('<div/>').text(type.name);
      typeElement.addClass('csbl-productType');
      typeElement.on('click', function() {
        self.changeProductType(type);
      });

      productTypes.append(typeElement);
    });
    this.wrapper.append(productTypes);
  };

  CaseChooser.prototype.renderProducts = function() {
    var self = this;
    this.wrapper.find('.products').remove();
    var products = $('<div/>');

    products.addClass('csbl-products');
    this.products.forEach(function(product) {
      var isProductSelected = self.isProductSelected(product);
      var productElement = $('<div/>');
      productElement.addClass('csbl-product');

      var image = $('<img />');
      image.addClass('csbl-product-image');
      image.attr('src', product.thumbnailUrl);

      var button = $('<button/>').html(svgs.tick);
      button.addClass('csbl-select-product-button');
      if (isProductSelected) {
        button.addClass('selected');
      }

      button.on('click', function() {
        self.toggleProductSelection(product);
        button.toggleClass('selected');
      });

      productElement.append(image);
      productElement.append(button);

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
    this.selectedProductType = productType;
    this.fetchProducts(productType);
  };

  CaseChooser.prototype.toggleProductSelection = function(product) {
    if (this.isProductSelected(product)) {
      var index = this.selectedProducts.findIndex(function(p) {
        return p.sku === product.sku;
      });
      this.selectedProducts.splice(index, 1);
    } else {
      this.selectedProducts.push(product);
    }

    this.selectionChangeCallback(this.selectedProducts);
  };

  CaseChooser.prototype.isProductSelected = function(searchProduct) {
    return this.selectedProducts.findIndex(function(product) {
      return product.sku === searchProduct.sku;
    }) !== -1;
  };

  $.fn.caseableWidget = function(device, selectionChangeCallback) {
    catalog.initialize('http://catalog.caseable.com', 'partner-id', 'eu', 'de');
    new CaseChooser(this, device, selectionChangeCallback);
    return this;
  };

})(jQuery);
