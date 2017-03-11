## Definitions for API
These definitions will be useful for understanding API:

**Registry Function** - an object that describes a function by containing information about its dependencies (*other* Registry Functions / Variables that it depends on) and its dependants (*other* Registry Functions that depend on it)

**Registry Variable** - essentially a Registry Function with no dependencies and no function that describes it. It's just an object containing information about its current value and its dependants.

**Registry** - just an object containing a set of Registry Functions and Variables.

## API
### Registry Function / Variable
Each instance of **Registry Function** or **Variable** (eg, `logic.profit` or `logic.revenue` above) contains the following methods in its prototype:

* `.of( deps )`, where `deps` is an array specifying the intended dependencies.
    
    Sets the dependencies and returns the **Registry Function** itself to allow chaining.

* `.is( fun )`, where `fun` is the function according to which the value will be calculated.
    
    Sets the function and returns the **Registry Function** itself to allow chaining.
    * Note: when the **Function**'s dependencies changed, `fun` will be called with parameters `val1`, ... `valN`, `old_val1`, ... `old_valN`, which are the new values of its dependencies followed by old values of those same dependencies. The values will appear in the same order as specified when creating the **Function** or specifying dependencies with `.of( deps )`.

* `.set( value )`, where `value` is the new value.
    
    Sets the value; the change will trigger an update of its dependants. Returns the **Registry Function / Variable** itself to allow chaining.

* `.get( )` returns the current value.

### revalue() function
**revalue** is a function for creating / adding items to a **Registry** (eg, the registry `logic` above). revalue, as an object, also contains 2 convenience methods for creating **Registry Functions** and **Variables**, and 2 other methods for checking if a parameter is a **Registry Function** or a **Variable**:

1. `revalue.var( value )`, where `value` is the initial value for the variable.
   Initializes and returns the **Registry Variable** with the provided initial value.

2. `revalue.fun( [dep1[, ... [, depN]]] )`, where `dep1`, ... `depN` are **Registry Functions** or **Variables** as function's dependencies.
   Initializes and returns **Registry Function** with the provided dependencies.

3. `revalue.isVar( param )`, where `param` is any parameter to check.
   Returns true if `param` the parameter is a **Registry Variable**, false otherwise.

4. `revalue.isFun( param )`, where `param` is any parameter to check.
   Returns true if `param` the parameter is a **Registry Function**, false otherwise.

#### Creating a new registry
There are 2 ways of creating a **Registry**:

1. Preferred way, through a function call
   * `revalue( defineFunction )`
      * `defineFunction( r )` - a function that will be called immediately with a parameter
         * `r` - a shortcut to a **revalue** object
         * Should return an object containing intended **Registry Functions** and **Variables** that will appear in the **Registry**

2. Alternative way, through an object definition
   * `revalue( defineObject )`
      * `defineObject` - an object containing information about the intended **Registry** Functions and Variables. For example,
      ```javascript
      revalue({
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

* `revalue( registry, defineFunction )`, or

* `revalue( registry, defineObject )`

In both cases, the returned properties will be added to an already existing `registry`.

## License
[MIT License](https://github.com/guitarino/revalue/blob/master/LICENSE)