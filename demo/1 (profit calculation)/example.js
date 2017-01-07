'use strict';

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

var error_descr = {
    sold_more_produced: 'Error: You could not have sold more details than produced',
    negative_produced: 'Error: You could not have negative number of produced details',
    negative_sold: 'Error: You could not have negative number of sold details'
};

var logic = Registrino(function(r) {
    var errors = {
        sold_more_produced: r.var( false ),
        negative_produced: r.var( false ),
        negative_sold: r.var( false )
    };

    var
        details_produced = r.var( parseInt(elements.details_produced.value, 10) ),
        detail_cost = r.var( parseInt(elements.detail_cost.value, 10) ),

        details_sold = r.var( parseInt(elements.details_sold.value, 10) ),
        detail_price = r.var( parseInt(elements.detail_price.value, 10) ),

        filtered_details_produced = r.fun( details_produced ).is(function(produced) {
            console.log('Recalculating: filtered_details_produced');
            if(produced < 0) {
                errors.negative_produced.set( true );
                return 0;
            } else {
                errors.negative_produced.set( false );
                return produced;
            }
        }),

        filtered_details_sold = r.fun( filtered_details_produced, details_sold ).is(function(produced, sold) {
            console.log('Recalculating: filtered_details_sold');
            if(sold < 0) {
                errors.negative_sold.set( true );
                return 0;
            } else {
                errors.negative_sold.set( false );
                if(sold > produced) {
                    errors.sold_more_produced.set( true );
                    return produced;
                }
                else {
                    errors.sold_more_produced.set( false );
                    return sold;
                }
            }
        }),

        total_cost = r.fun( filtered_details_produced, detail_cost ).is(function(n, cost) {
            console.log('Recalculating: total_cost');
            return n * cost;
        }),

        total_revenue = r.fun( filtered_details_sold, detail_price ).is(function(n, price) {
            console.log('Recalculating: total_revenue');
            return n * price;
        }),

        profit = r.fun( total_cost, total_revenue ).is(function(c, r) {
            console.log('Recalculating: profit');
            return r - c;
        }),

        // Some error handling:

        error = r.fun( errors.sold_more_produced, errors.negative_produced, errors.negative_sold ).is(function(smp, np, ns) {
            console.log('Recalculating: error');
            return smp || np || ns; // Could potentially be automated. Hardcoded for simplicity.
        }),

        error_description = r.fun( errors.sold_more_produced, errors.negative_produced, errors.negative_sold ).is(function(smp, np, ns) {
            console.log('Recalculating: error_description');
            var errors = [];

            // Could potentially be automated. Hardcoded for simplicity.
            if(smp) errors.push( error_descr.sold_more_produced );
            if(np) errors.push( error_descr.negative_produced );
            if(ns) errors.push( error_descr.negative_sold );
            
            return errors;
        });

    return {
        details_produced: details_produced,
        detail_cost: detail_cost,

        details_sold: details_sold,
        detail_price: detail_price,

        total_cost: total_cost,
        total_revenue: total_revenue,

        profit: profit,

        error: error,
        error_description: error_description
    };
});

(function() {
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
})();

// UI dependencies
Registrino(logic, function(r) {
    r.fun(r.total_cost).is(function(cost) {
        elements.total_cost.textContent = cost;
    });

    r.fun(r.total_revenue).is(function(cost) {
        elements.total_revenue.textContent = cost;
    });

    r.fun(r.profit).is(function(cost) {
        elements.profit.textContent = cost;
    });

    r.fun(r.error).is(function(error) {
        if(error) {
            elements.error.style.display = "";
        }
        else {
            elements.error.style.display = "none";
        }
    });

    r.fun(r.error_description).is(function(descr) {
        elements.error.innerHTML = descr.map(function(error) {
            return "<p>" + error + "</p>";
        }).join('');
    });
});