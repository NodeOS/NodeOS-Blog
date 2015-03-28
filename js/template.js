
function Template(template,contain,unique){
  this.template = Handlebars.compile(jQuery(template).html());
  this.contain = jQuery(contain);
  this.unique = {};
  if(Array.isArray(unique)){
    var l = unique.length;
    while(l--){
      this.unique[unique[l]] = false;
    }
  }
  this.contain.find(".remove").on("click",this.remove.bind(this));
}

Template.prototype.add = function(item){
  if(item.class && typeof this.unique[item.class] != "undefined"){
    if(this.unique[item.class]) return;
    this.unique[item.class] = true;
  }
  console.log("appending");
  this.contain.append(this.template(item));
};

Template.prototype.remove = function(e){
  e.preventDefault();
  var art = $(this).closest("article");
  var u = art.attr("data-unique");
  if(u){
    this.unique[u] = false;
  }
  art.remove();
};

module.exports = Template;
