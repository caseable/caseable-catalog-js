(function(scope, undefined) {
    'use strict';

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



})();
