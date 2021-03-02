// Add remove prototypes
Element.prototype.remove = function () {
  this.parentElement.removeChild(this);
};
