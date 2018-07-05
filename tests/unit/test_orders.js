// a map from urls defind as regular expressions to data
var XMLHttpRequestData = {};

var URLS = {
    order1: 'https?://[^/\\\s?!]+/orders/1',
    order2: 'https?://[^/\\\s?!]+/order/.*'
};

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

describe('Caseable Orders', function() {
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
