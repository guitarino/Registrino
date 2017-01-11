/*!
Copyright (c) 2016 guitarino
MIT License
*/

var Registrino = (function() {
    'use strict';
    // <some helpful methods>

    /**
     * Checks if an argument is an array
     */
    var isArray = Array.isArray ? Array.isArray : function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };

    /**
     * Iterates over an array; return false to break from loop
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
     */
    function isObject(arg) {
        if(typeof arg === 'object' && arg !== null) {
            return true;
        }
        return false;
    }

    // </some helpful methods>

    /**
     * Evaluates a Registrino Function `fun` with the values of dependencies as arguments
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
            null,

            // We concatenate new and previous dependency
            // values and use those as arguments
            dep_vals.concat(old_dep_vals)
        );
    }

    /**
     * Checks if update of a Registrino Function `fun` is needed.
     * It is needed if any dependencies have `_old_value` property. 
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
     * Clears `_old_value` property of dependants of a Registrino Function `fun`
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
     * Update function iterates over dependants and updates Registrino Functions
     * that need update.
     */
    function update(fun) {
        forEach(fun._dependants, function(dependant) {
            // Dependant might by mistake be a Registrino Variable, not a Function
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
     * Creates an istance of Registrino Variable / Function
     */
    var Fun = function(deps) {
        this._dependencies = [];
        this._dependants = [];
    };
    
    /**
     * `of` method sets dependencies of a Registrino Function
     */
    Fun.prototype.of = function(deps) {
        if(deps !== this._dependencies) {
            var self = this;

            /**
             * Cleans the dependencies of being dependent of Registrino Variable / Function `this`
             */
            forEach(this._dependencies, function removeDependant(dep) {
                remove(dep._dependants, self);
                forEach(dep._dependencies, removeDependant);
            });
            
            this._dependencies = deps;
            
            /**
             * Adds Registrino Variable / Function `this` as dependant to its dependencies
             */
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
     * `is` sets a dependency function of a Registrino Function
     */
    Fun.prototype.is = function(fun) {
        if(this._fun !== fun) {
            this._fun = fun;
            this.set( getFunVal(this) );
        }
        return this;
    };

    /**
     * `set` sets a current value of a Registrino Variable / Function
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
     * `get` gets a current value of a Registrino Variable / Function
     */
    Fun.prototype.get = function() {
        return this._value;
    };

    /**
     * Convenience method for defining registries / Registrino Variables / Functions
     */
    var Registrino = function() {
        var registry, define;

        if(arguments.length <= 1) {
            define = arguments[0];
            registry = new r();
        }
        
        else if(arguments.length > 1) {
            registry = arguments[0];
            define = arguments[1];
        }
        
        // The safest way to define a registry, through a function call
        if( typeof define === 'function' ) {
            var vars = define( registry );
            
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
                        registry.fun.apply(null,
                            dependencies.map(function(depname) {
                                return registry[depname];
                            })
                        )
                        .set(vdescr.value)
                        .is(vdescr.is)
                    );
                } else {
                    registry[vname] = registry.var(vdescr);
                }
            }
        }

        return registry;
    };

    Registrino.var = function(value) {
        var v = new Fun();
        v.set(value);
        return v;
    };

    Registrino.fun = function() {
        var args = Array.prototype.slice.call(arguments, 0);
        var fun = new Fun();
        fun.of(args);
        return fun;
    };

    /**
     * Creates an instance of a registry
     */
    var r = function() {
        return this;
    };

    /**
     * Every registry has a method `var` to create a Registrino Variable
     */
    r.prototype.var = Registrino.var;

    /**
     * Every registry has a method `fun` to create a Registrino Function
     */
    r.prototype.fun = Registrino.fun;

    return Registrino;
})();

/**
 * The following allows us to use Registrino as a module in NodeJS
 */
(function(self) {
    if( !(self && self.window) && module && module.exports ) {
        module.exports = Registrino;
    }
})(this);