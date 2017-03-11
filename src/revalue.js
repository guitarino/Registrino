/*!
Copyright (c) 2016 guitarino
MIT License
*/

var revalue = (function() {
    'use strict';
    // <some helpful methods>

    /**
     * Checks if an argument is an array
     * @private
     */
    var isArray = Array.isArray ? Array.isArray : function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };

    /**
     * Iterates over an array; return false to break from loop
     * @private
     */
    function forEach(arr, fun) {
        for(var i = 0; i < arr.length; i++) {
            var value = fun(arr[i]);
            if(value === false) {
                break;
            }
        }
    }
    
    /**
     * Removes an `item` from array `arr`
     * @private
     */
    function remove(arr, item) {
        var index = arr.indexOf(item);
        if(~index) {
            arr.splice(index, 1);
        }
        else {
            console.warn('The item', item, 'does not exist in array', arr);
        }
    }

    /**
     * Returns true if the argument is an object; otherwise false
     * @private
     */
    function isObject(arg) {
        if(typeof arg === 'object' && arg !== null) {
            return true;
        }
        return false;
    }

    // </some helpful methods>

    /**
     * Evaluates a revalue function `fun` with the values of dependencies as arguments
     * @private
     */
    function getFunVal(fun) {
        if(typeof fun._fun !== 'function') return fun._value;

        var dep_vals = [];
        var old_dep_vals = [];
        
        forEach(fun._dependencies, function(dep) {
            dep_vals.push(dep._value);
            old_dep_vals.push(
                '_old_value' in dep ?
                    dep._old_value :
                    dep._value
            );
        });

        return fun._fun.apply(
            fun,

            // We concatenate new and previous dependency
            // values and use those as arguments
            dep_vals.concat(old_dep_vals)
        );
    }

    /**
     * Checks if update of a revalue function `fun` is needed.
     * It is needed if any dependencies have `_old_value` property. 
     * @private
     */
    function isUpdateNeeded(fun) {
        var dependenciesChanged = false;

        forEach(fun._dependencies, function(dep) {
            if('_old_value' in dep) {
                dependenciesChanged = true;
                return false;
            }
        });

        return dependenciesChanged;
    }

    /**
     * Clears `_old_value` property of dependants of a revalue function `fun`
     * @private
     */
    function cleanUpdate(fun) {
        fun._old_value = null;
        delete fun._old_value;

        forEach(fun._dependants, function(dependant) {
            if('_old_value' in dependant) {
                dependant._old_value = null;
                delete dependant._old_value;
            }
        });
    }

    /**
     * Update function iterates over dependants and updates revalue functions
     * that need update.
     * @private
     */
    function update(fun) {
        forEach(fun._dependants, function(dependant) {
            // Dependant might by mistake be a revalue variable, not a function
            if(dependant._fun && isUpdateNeeded(dependant)) {
                var new_val = getFunVal(dependant);
                if(new_val !== dependant._value) {
                    dependant._old_value = dependant._value;
                    dependant._value = new_val;
                }
            }
        });

        // We need to clean old values so that next update is successful
        cleanUpdate(fun);
    }

    /**
     * Creates an istance of revalue variable / function
     * @constructor
     * @param {Object[]} deps - dependencies of revalue variable / function
     */
    var Fun = function(deps) {
        this._dependencies = [];
        this._dependants = [];
    };
    
    /**
     * `of` method sets dependencies of a revalue function
     * @public
     * @param {Object[]} deps - dependencies of revalue variable / function
     * @returns {Object} the revalue function itself for chaining
     */
    Fun.prototype.of = function(deps) {
        if(deps !== this._dependencies) {
            var self = this;

            // Cleans the dependencies of being dependent of revalue variable / function `this`
            forEach(this._dependencies, function removeDependant(dep) {
                remove(dep._dependants, self);
                forEach(dep._dependencies, removeDependant);
            });
            
            this._dependencies = deps;
            
            // Adds revalue variable / function `this` as dependant to its dependencies
            forEach(this._dependencies, function addDependant(dep) {
                // To avoid repetitions
                if(!~dep._dependants.indexOf(self)) {
                    dep._dependants.push(self);
                    forEach(dep._dependencies, addDependant);
                }
            });

            this.set( getFunVal(this) );
        }
        return this;
    };

    /**
     * `is` sets a dependency function of a revalue function
     * @public
     * @param {Function} fun - the function that determines other
     *  relationship between this and other revalue functions / variables
     * @returns {Object} the revalue function itself for chaining
     */
    Fun.prototype.is = function(fun) {
        if(this._fun !== fun) {
            this._fun = fun;
            this.set( getFunVal(this) );
        }
        return this;
    };

    /**
     * `set` sets a current value of a revalue variable / function
     * @public
     * @param {*} value - the value to set to a revalue variable / function
     * @returns {Object} the revalue variable / function itself for chaining
     */
    Fun.prototype.set = function(value) {
        if(this._value !== value) {
            this._old_value = this._value;
            this._value = value;
            update(this);
        }
        return this;
    };

    /**
     * `get` gets a current value of a revalue variable / function
     * @public
     * @returns the value of the revalue variable / function
     */
    Fun.prototype.get = function() {
        return this._value;
    };

    /**
     * Convenience function for defining registries / revalue variables / functions
     * @param {Object} [registry] - in case we want to add properties to an
     *  existing registry instad of creating new
     * @param {Function|Object} define - obj / function that will determine how
     *  the registry should be defined
     */
    var revalue = function() {
        var registry, define;

        if(arguments.length <= 1) {
            define = arguments[0];
            registry = {};
        }
        
        else if(arguments.length > 1) {
            registry = arguments[0];
            define = arguments[1];
        }
        
        // The safest way to define a registry, through a function call
        if( typeof define === 'function' ) {
            var vars = define( revalue );
            
            if(isObject(vars)) {
                for(var vname in vars) {
                    if(vars.hasOwnProperty(vname)) {
                        registry[vname] = vars[vname];
                    }
                }
            }
        }

        // An alternative way of defining a registry, through an object
        else if( isObject(define) ) {
            for( var vname in define ) {
                var vdescr = define[vname];
                if( isObject( vdescr ) && 'is' in vdescr && typeof vdescr.is === 'function' ) {
                    var dependencies = isArray(vdescr.dependencies) ?
                        vdescr.dependencies :
                        [];
                    
                    registry[vname] = (
                        revalue.fun.apply(null,
                            dependencies.map(function(depname) {
                                return registry[depname];
                            })
                        )
                        .set(vdescr.value)
                        .is(vdescr.is)
                    );
                } else {
                    registry[vname] = revalue.var(vdescr);
                }
            }
        }

        return registry;
    };

    /**
     * A convenience method to create revalue variable
     * @static
     * @param {*} value - any value to initialize the variable with
     * @returns {Object} the variable itself to allow chaining
     */
    revalue.var = function(value) {
        var v = new Fun();
        v.set(value);
        return v;
    };

    /**
     * A convenience method to create revalue function
     * @static
     * @param {...Object} - dependency revalue variables / functions
     * @returns {Object} the variable itself to allow chaining
     */
    revalue.fun = function() {
        var args = Array.prototype.slice.call(arguments, 0);
        var fun = new Fun();
        fun.of(args);
        return fun;
    };

    /**
     * Method to check if the parameter is a revalue variable
     * @static
     * @param {*} param - any parameter to check
     * @returns {Boolean} true if parameter is a revalue variable, false otherwise
     */
    revalue.isVar = function(param) {
        return param instanceof Fun && !("_fun" in param);
    };

    /**
     * Method to check if the parameter is a revalue function
     * @static
     * @param {*} param - any parameter to check
     * @returns {Boolean} true if parameter is a revalue function, false otherwise
     */
    revalue.isFun = function(param) {
        return param instanceof Fun && ("_fun" in param);
    };

    return revalue;
})();

/**
 * The following allows us to use revalue as a module in NodeJS
 */
(function(self) {
    if( !(self && self.window) && module && module.exports ) {
        module.exports = revalue;
    }
})(this);