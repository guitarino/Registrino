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

## How to
To understand how this works without delving into API, see commented examples under **[/demo](https://github.com/guitarino/Registrino/tree/master/demo)** folder.

## Install

### Browser
Add

```html
<script src="path/to/Registrino.js"></script>
```

to your HTML page

### NodeJS
Include Registrino as a NodeJS module

```javascript
var Registrino = require('./path/to/Registrino.js');
```

## Definitions for API
These definitions will be useful for understanding API:

**Registry Function** - an object that describes a function by containing information about its dependencies (*other* Registry Functions / Variables that it depends on) and its dependants (*other* Registry Functions that depend on it)

**Registry Variable** - essentially a Registry Function with no dependencies and no function that describes it. It's just an object containing information about its current value and its dependants.

**Registry** - an object containing a set of Registry Functions and Variables, as well as a means (rather, a shortcut) for creating Registry Functions and Variables.

## API
### Registry Function / Variable
Each instance of **Registry Function** or **Variable** (eg, `logic.profit` or `logic.revenue` above) contains the following methods in its prototype:

* `.of( deps )`, where `deps` is an array specifying the intended dependencies. Sets the dependencies and returns the **Registry Function** itself to allow chaining.

* `.is( fun )`, where `fun` is the function according to which the value will be calculated. Sets the function and returns the **Registry Function** itself to allow chaining.
    * Note: when **Function**'s dependencies changed, `fun` will be called with parameters `val1`, ... `valN`, `old_val1`, ... `old_valN`, which are the new values of its dependencies followed by old values of those same dependencies. The values will appear in the same order as specified when creating the **Function** or specifying dependencies with `.of( deps )`.

* `.set( value )`, where `value` is the new value. The change will trigger an update of its dependants. Returns the **Registry Function / Variable** itself to allow chaining.

* `.get( )` returns the current value.

### Registry Object
Each **Registry** (eg, the registry `logic` above) is an object that contains 2 convenience methods (in its prototype) for creating **Registry Functions** and **Variables**:

1. `.var( value )`, where `value` is the initial value for the variable.

    Initializes and returns the **Registry Variable** with the provided initial value.

2. `.fun( [dep1[, ... [, depN]]] )`, where `dep1`, ... `depN` are **Registry Functions** or **Variables** as function's dependencies.

    Initializes and returns **Registry Function** with the provided dependencies.

### Registrino() function
#### Creating a new registry
There are 2 ways of creating a **Registry**:

1. Preferred way, through a function call
    * `Registrino( defineFunction )`
        * `defineFunction( r )` - a function that will be called immediately with a parameter
            * `r` - the new empty **Registry**

2. Alternative way, through an object definition
    * `Registrino( defineObject )`
        * `defineObject` - an object containing information about the intended **Registry** Functions and Variables. For example,

```javascript
            Registrino({
                'revenue': 150,
                'cost'   : 100,
                'profit' : {
                    dependencies: ['revenue', 'cost'],
                    is: function(revenue, cost) {
                        return revenue - cost;
                    }
                }
            })
```

It's safer to create a **Registry** in the first way (through a function call), because

* It ensures that dependencies are resolved. You would not be able to create a **Registry Function** without first creating all of its dependencies. If the **Registry** is created from an object, you will need to make sure not to define a property before its dependencies.

* It is more flexible in that it allows you to conveniently create some **Registry Functions** without adding them to the **Registry**.

#### Modifying a registry
You can also use an existing **Registry** instead of creating a new, if you use provide the **Registry** as the first argument. Namely,

* `Registrino( registry, defineFunction )`, or

* `Registrino( registry, defineObject )`

In both cases, you can add new **Registry Functions** and **Variables** to an already existing `registry`.

### Without Registry
It's possible to create **Registry Functions** and **Variables** without creating a new instance of a **Registry**, even though it shouldn't be costly to use `Registrino()`. For that, use

* `Registrino.createVariable( value )`, and

* `Registrino.createFunction( [dep1[, ... [, depN]]] )`

You can use both methods in the same way as **Registry** object's properties `.var` and `.fun` but without actually having a **Registry**.

## License
[MIT License](https://github.com/guitarino/Registrino/blob/master/LICENSE)