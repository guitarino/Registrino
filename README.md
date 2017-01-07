# Registrino
A library for incremental and reactive programming with an intuitive idea of using variables and functions.

## Gist
The idea behind `Registrino` is simple: we register some variables and functions that depend on *other* variables and/or functions.

For example,

```javascript
var logic = Registrino(function(r) {
  var
    revenue = r.var( 150 ), // Registring a variable with a value 150
    cost    = r.var( 100 ), // Registring a variable with a value 100
    
    // Registring a function that depdends on *revenue* and *cost*
    profit  = r.fun(revenue, cost).is(function(revenue, cost) {
      return revenue - cost;
    });

  return {
    revenue : revenue,
    cost    : cost,
    profit  : profit
  };
});
```

This example registers variables `revenue` and `cost`, and a function `profit`, which is automatically calculated as `revenue` minus `cost`. Every function and variable has a value that we can get with

```javascript
logic.profit.get(); // Returns 50
```

Or, set with

```javascript
logic.revenue.set( 150 );
```

When we set a variable or a function, then the functions that depend on it, will get recalculated. In the example above,

```javascript
logic.profit.get();        // Returns 50
logic.revenue.set( 250 );  // Setting the revenue to 350 instead of 150
logic.profit.get();        // Returns 250
```

