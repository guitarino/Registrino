# Registrino
A simple and intuitive way of doing incremental and reactive programming

## Idea
In incremental or reactive programming, when a piece of data changes, only the outputs that depend on that piece of data will be recomputed and updated.

Standard libraries for reactive programming are powerful, but are more conceptually involved.

The idea behind `Registrino` is simple: we register some variables and functions that depend on *other* variables and/or functions.

For example,

```javascript
// This creates a registry `logic`
var logic = Registrino(function(r) {
  var
    revenue = r.var( 150 ), // Creates a variable `revenue` with a value 150
    cost    = r.var( 100 ), // Creates a variable `cost` with a value 100
    
    // Creates a function that depdends on `revenue` and `cost` and
    // will get recalculated every time `revenue` or `cost` changes
    profit  = r.fun(revenue, cost).is(function(revenue, cost) {
      return revenue - cost;
    })
  ;
  
  // We can create "hidden" functions that are not accessible for the
  // user, but will still update whenever their dependencies change,
  // for example, for DOM updates.
  r.fun(profit).is(function(profit) {
    console.log("Profit is", profit);
  });

  // By returning the properties, we ensure they will appear in registry `logic`.
  return {
    revenue : revenue,
    cost    : cost,
    profit  : profit
  };
});
```

This example registers variables `revenue` and `cost`, and a function `profit`, which is automatically calculated as `revenue` minus `cost`. Then, we register a hidden function, which will output `profit` whenever it changes.

Every function and variable has a value that we can get with

```javascript
logic.profit.get(); // Returns 50
```

Or, set with

```javascript
logic.revenue.set( 150 );
```

## What makes it powerful

When we set a variable or a function, then the functions that depend on it will get automatically recalculated. In the example above,

```javascript
logic.profit.get();        // Returns 50
logic.revenue.set( 350 );  // Setting the revenue to 350 instead of 150
logic.profit.get();        // Returns 250
```

This approach is similar to a spreadsheet-like functionality and can be especially useful for
* Specifying behaviour more declaratively
* Implementing reactive DOM and templating systems
* Working with changing app or component state
* Creating customization system for [Custom Elements](https://developers.google.com/web/fundamentals/getting-started/primers/customelements)
