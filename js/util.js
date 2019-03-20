/**
 * A basic set of util functions
 */

Array.prototype.remove = function(value) {
    return this.filter(function(element) {
        return element != value;
    });
}
