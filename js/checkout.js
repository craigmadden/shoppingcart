var subtotal = Number(sessionStorage.getItem("checkout")).toFixed(2);
var tax = subtotal * 0.02175;
var total = Number(subtotal) + Number(tax);

var shopcart = JSON.parse(sessionStorage.getItem("cart"));
// for(var i = 0; i < cart.length; i++){
// 	console.log(cart[i]);
// }

// Cart functions
var CartList = function(){
   this.carted = [];
}

CartList.prototype = {
   rebuild: function(shopcart) {
      this.carted = shopcart;
   },

   add: function(sku) {
      this.carted.push(sku);
   },
   remove: function() {

   },

   draw: function() {
      var cartCol = document.getElementById("shopping-cart");
      var cartRow = document.createElement('div');
      cartRow.setAttribute('class', 'row');
      //cartRow.setAttribute('style', 'margin:30px');

      cartCol.innerHTML="";
      var cartCount = this.carted.length;
      cartTotal = 0;
      for(var x = 0; x < cartCount; x++){
         var c = document.createElement('div');
         c.setAttribute('class', 'col-sm-12');
         itemStor = JSON.parse(sessionStorage.getItem(this.carted[x]))
         //console.log(itemStor.name);
         //c.innerHTML = '<div><h5>' + sessionStorage.getItem(this.carted[x]) + '</h5></div>';
         c.innerHTML = '<div><h5>' + itemStor.name + ' <b>$' + itemStor.price.toFixed(2) + '</b></h5></div>';   
         // Add to container row
         cartRow.appendChild(c);
         cartCol.appendChild(cartRow);
         cartTotal += Number(itemStor.price);
      }
      // Store items into session storage
      sessionStorage.setItem("cart", JSON.stringify(this.carted));
      // Update total for cart
      //document.getElementById("cart-total").getElementsByTagName("H4")[0].innerHTML = "Total: $";
      document.getElementById("checkout").style.display = "block";
   }
}

function run() {
	var cart = new CartList();
	cart.rebuild(shopcart);
	cart.draw();
	
}
run();
document.getElementById("sub-total").innerHTML = "<h4>Sub-total: $" + subtotal + "</h4>";
document.getElementById("tax").innerHTML = "<h4>Tax: $" + tax.toFixed(2) + "</h4>";
document.getElementById("cart-total").innerHTML = "<h4>Total: $" + total.toFixed(2) + "</h4>";