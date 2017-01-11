(function() {
    var elements = {
        details_produced: document.getElementById("details_produced"),
        detail_cost: document.getElementById("detail_cost"),

        details_sold: document.getElementById("details_sold"),
        detail_price: document.getElementById("detail_price"),

        total_cost: document.getElementById("total_cost"),
        total_revenue: document.getElementById("total_revenue"),

        profit: document.getElementById("profit"),

        error: document.getElementById("error")
    };
    
    // Creating registry `logic`. An alternative way of defining a registry.
    // It is recommended to define the registry through a function call instead.
    var logic = Registrino({
        // Variables for produced amount, cost and sold amount and cost,
        // taking input's `value` attribute as initial value.
        'details_produced': parseInt(elements.details_produced.value, 10),
        'detail_cost': parseInt(elements.detail_cost.value, 10),
        'details_sold': parseInt(elements.details_sold.value, 10),
        'detail_price': parseInt(elements.detail_price.value, 10),
        // Function for total cost depending on number of details produced and cost per detail
        'total_cost': {
            dependencies: ['details_produced', 'detail_cost'],
            is: function(n, cost) {
                console.log('`logic.total_cost` update');
                return n * cost;
            }
        },
        // Function for total revenue depending on number of details sold and price per detail
        'total_revenue': {
            dependencies: ['details_sold', 'detail_price'],
            is: function(n, price) {
                console.log('`logic.total_revenue` update');
                return n * price;
            }
        },
        // Function that will be recalculated every time total_cost or total_revenue change
        'profit': {
            dependencies: ['total_revenue', 'total_cost'],
            is: function(revenue, cost) {
                console.log('`logic.profit` update');
                return revenue - cost;
            }
        }
    });

    // Creating registry `errors` through a function (preferred way).
    var errors = Registrino(function(r) {
        var
            sold_more_produced = r.fun(logic.details_produced, logic.details_sold).is(function(produced, sold) {
                console.log('`error.sold_more_produced` update');
                return sold > produced;
            }),

            negative_produced = r.fun(logic.details_produced).is(function(produced) {
                console.log('`error.negative_produced` update');
                return produced < 0;
            }),

            negative_sold = r.fun(logic.details_sold).is(function(sold) {
                console.log('`error.negative_sold` update');
                return sold < 0;
            })
        ;

        return {
            sold_more_produced: sold_more_produced,
            negative_produced: negative_produced,
            negative_sold: negative_sold
        };
    });

    var error_descr = {
        sold_more_produced: 'Error: You could not have sold more details than produced',
        negative_produced: 'Error: You could not have negative number of produced details',
        negative_sold: 'Error: You could not have negative number of sold details'
    };

    // Array of error keys ('sold_more_produced', etc)
    var error_keys = Object.keys(errors);
    // Array of error variables (errors.sold_more_produced, etc)
    var error_variables = error_keys.map(function(key) {
        return errors[key];
    });

    // This will create a function that automatically depends on all error variables. It will
    // update the list of error descriptions any time a variable changes.
    // Note: we're using `Registrino.fun` the same way we would use `r.fun`.
    // You can also use `Registrino.var` to replace `r.var` (Refer to API Ref).
    var error_list = Registrino.fun.apply(null, error_variables).is(function() {
        console.log('`error_list` update');
        // Because arguments consist of both new and previous values, the number of error variables is half
        var variables = arguments.length / 2;
        // The following removes the second half of arguments (prev. values)
        var values = Array.prototype.slice.call(arguments, 0, variables);
        // `current_error_keys` will contain those error keys (e.g., 'sold_more_produced', etc)
        // that are currently true (i.e. the error is taking place)
        var current_error_keys = [];
        values.forEach(function(val, id) {
            if(val) current_error_keys.push( error_keys[id] );
        });
        // returning an array of error descriptions by looping through
        // `current_error_keys` and returning suitable descriptions
        return current_error_keys.map(function(key) {
            return error_descr[ key ];
        });
    });

    // This just registers event handlers to set the values

    elements.details_produced.addEventListener('input', function(e) {
        var value = parseInt(e.currentTarget.value, 10);
        logic.details_produced.set(value);
    });

    elements.detail_cost.addEventListener('input', function(e) {
        var value = parseInt(e.currentTarget.value, 10);
        logic.detail_cost.set(value);
    });

    elements.details_sold.addEventListener('input', function(e) {
        var value = parseInt(e.currentTarget.value, 10);
        logic.details_sold.set(value);
    });

    elements.detail_price.addEventListener('input', function(e) {
        var value = parseInt(e.currentTarget.value, 10);
        logic.detail_price.set(value);
    });

    // Now the UI functions.

    Registrino.fun(logic.total_cost).is(function(cost) {
        elements.total_cost.textContent = cost;
    });

    Registrino.fun(logic.total_revenue).is(function(cost) {
        elements.total_revenue.textContent = cost;
    });

    Registrino.fun(logic.profit).is(function(cost) {
        elements.profit.textContent = cost;
    });

    Registrino.fun(error_list).is(function(descr) {
        elements.error.innerHTML = descr.map(function(error) {
            return "<p>" + error + "</p>";
        }).join('');
    });
})();