# revalue (Reactive Value)
A simple and intuitive way of doing incremental and reactive programming

## Idea
In incremental or reactive programming, when a piece of data changes, only the outputs that depend on that piece of data will be recomputed and updated.

Standard libraries for reactive programming are powerful, but are more conceptually involved.

The idea behind `revalue` is simple: we register some variables and functions that depend on *other* variables and/or functions.

For example,

```javascript
// This creates a registry `logic`
var logic = revalue(function(r) {
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
When we change a variable or a function, then the functions that depend on it will get automatically recalculated. In the example above,

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

## How to (TL;DR)
You can see commented examples under **[/demo](https://github.com/guitarino/revalue/tree/master/demo)** folder for extra practice. The following is just an overview of all available features.

### Working with registries
We can create registry in 2 different ways:

1. Preferred way, through a function call
   ```javascript
   var r1 = revalue(function(r) {
       // Note: r === revalue. We use it in an argument as a shortcut.
       var
           a = r.var( 1 ), // Creates variable `a` with a value 1
           b = r.var( 2 ), // Creates variable `b` with a value 2
           // Creates a function `x` that will always have a value `a + b`
           x = r.fun( a, b ).is(function(a,b) {
               return a + b;
           })
       ;
       // The returned properties will appear in `r1` registry
       return {a:a, b:b, x:x}
   });
   ```

2. Alternative way, through an object:
   ```javascript
   var r2 = revalue({
       'a' : 1,
       'b' : 2,
       'x' : {
           dependencies: ['a','b'],
           is: function(a,b) {
               return a + b;
           }
       }
   });
   ```

We can also add some variables to an existing registry by using the registry as the first argument:

```javascript
revalue(r1, function(r) {
    var c = r.var( 3 );
    return {c: c};
});
// Alternatively,
revalue(r2, {
    c: 3
});
```

### Working with variables and functions:
* Getting:
   ```javascript
   r1.x.get(); // Returns 3 (because x = a + b = 1 + 2 = 3)
   ```

* Setting:
   ```javascript
   r1.a.set(220);
   r1.x.get(); // Returns 222 (because x = a + b = 220 + 2 = 222)
   ```

* Changing dependencies:
   ```javascript
   r1.x.of([r1.c, r1.b]);
   r1.x.get(); // Returns 5 (because x = c + b = 3 + 2 = 5)
   ```

* Changing function description:
   ```javascript
   r1.x.is(function(a,b) {
       return a * b;
   });
   r1.x.get(); // Returns 6 (because x = c * b = 3 * 2 = 6)
   ```

A function can depend on the previous values of its dependencies as well:

```javascript
r1.x.is(function(a, b, pre_a, pre_b) {
    return a * b + pre_a * pre_b;
});
r1.b.set(10);
r1.x.get(); // Returns 36 (because x = a * b + pre_a * pre_b = 3 * 10 + 3 * 2 = 36)
```

Functions from one registry can just as easily depend on functions / variables from the other registries:

```javascript
revalue(r2, function(r) {
    var y = r.fun(r1.x).is(function(x) {
        return x / 2;
    });
    return {y: y}
});
r2.y.get(); // Returns 18 (because y = x / 2 = 36 / 2 = 18)
```

We can easily register a function / variable outside of a registry:

```javascript
revalue.fun(r2.y).is(function(y) {
    document.getElementById('test').textContent = y;
});
```

## Install
The utility is tiny, just about 0.9K minified and gzipped (2K minified).

### Browser
Add to your HTML page:

```html
<script src="path/to/revalue.js"></script>
```

### NodeJS
Include revalue as a NodeJS module:

```javascript
var revalue = require('./path/to/revalue.js');
```

## [See API Reference](https://github.com/guitarino/revalue/blob/master/API.md)

## License
[MIT License](https://github.com/guitarino/revalue/blob/master/LICENSE)