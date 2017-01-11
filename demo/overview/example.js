// We can create registry in 2 different ways:
// ================================
// 1. Preferred way, through a function call
var r1 = Registrino(function(r) {
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
// 2. Alternative way, through an object
var r2 = Registrino({
    'a' : 1,
    'b' : 2,
    'x' : {
        dependencies: ['a','b'],
        is: function(a,b) {
            return a + b;
        }
    }
});

// We can also add some variables to the existing registry
// by using the registry as the first argument:
Registrino(r1, function(r) {
    var c = r.var( 3 );
    return {c: c};
});
// Alternatively,
Registrino(r2, {
    c: 3
});

// Working with variables and functions:
// ================================
// Getting:
console.log( 'Should return 3' );
console.log( '->', r1.x.get() ); // Returns 3 (because x = a + b = 1 + 2 = 3)
// Setting:
r1.a.set(220);
console.log( 'Should return 222' );
console.log( '->', r1.x.get() ); // Returns 222 (because x = a + b = 220 + 2 = 222)
// Changing dependencies:
r1.x.of([r1.c, r1.b]);
console.log( 'Should return 5' );
console.log( '->', r1.x.get() ); // Returns 5 (because x = c + b = 3 + 2 = 5)
// Changing function description:
r1.x.is(function(a,b) {
    return a * b;
});
console.log( 'Should return 6' );
console.log( '->', r1.x.get() ); // Returns 6 (because x = c * b = 3 * 2 = 6)

// A function can depend on the previous values of its dependencies as well
r1.x.is(function(a,b, pre_a, pre_b) {
    return a * b + pre_a * pre_b;
});
r1.b.set(10);
console.log( 'Should return 36' );
console.log( '->', r1.x.get() ); // Returns 36 (because x = a * b + pre_a * pre_b = 3 * 10 + 3 * 2 = 36)

// Functions from one registry can depend on functions / variables from the other registries
Registrino(r2, function(r) {
    var y = r.fun(r1.x).is(function(x) {
        return x / 2;
    });
    return {y: y}
});
console.log( 'Should return 18' );
console.log( '->', r2.y.get() ); // Returns 18 (because y = x / 2 = 36 / 2 = 18)

// Registering a function outside of a registry
Registrino.fun(r2.y).is(function(y) {
    document.getElementById('test').textContent = y;
});