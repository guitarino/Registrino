var logic = (function() {

    var input = document.getElementById('nameIn');
    var output = document.getElementById('nameOut');

    var logic = Registrino(function(r) {
        // Registering a simple variable for name,
        // taking `input.value` as initial value
        var name = r.var( input.value );
        
        // Registering a function that will be called whenever
        // name changes to update output.
        r.fun(name).is(function(name) {
            output.textContent = name;
        });
        
        // Only return name for user
        return {
            name: name
        };
    });

    input.addEventListener('input', function(e) {
        // When input changes, we set name's value;
        // this will trigger function update
        logic.name.set( input.value );
    });

    // Creating a function outside of Registry (updates input value)
    Registrino.fun(logic.name).is(function(name) {
        input.value = name;
    });

    console.log('Try running `logic.name.set("something")`!');
    return logic;
})();