/*--------------------------------------------------------------------------------------
   Product list is a collection of product Ids & product objects
   which are lazy loaded via ajax.
*/
var ProductList = function() {
   this.productIds = [];
   this.products = [];
}



// Add function to ProductList object
ProductList.prototype.load = function(doneCallback) {
   var xhr = new XMLHttpRequest();
   
   // Lock this in the onreadystatechange callback via a closure
   var that = this;
   
   xhr.onreadystatechange = function() {
      if(xhr.readyState == 4 && xhr.status == 200) {
         // Parse & save result, then call callback announcing we're done. This
         // will kick off the product Ajax requests
         that.productIds = JSON.parse(xhr.responseText);
         // doneCallback is an anonymous function created in the run() function
         doneCallback();
      }
   }

   // Cross domain ajax request
   var url = 'http://jamilalvi.com/jamil/services/products.php'; 
   xhr.open('GET', url, true);
   xhr.send(null);
}

ProductList.prototype.addProduct = function(prod) {
   this.products.push(prod);
}

/*--------------------------------------------------------------------------------------
   Product object contains the properties of an individual product
*/
var Product = function(sku) {
   this.sku = sku;
   
   // Deferred loading. Filled in async wProen the ajax call returns
   this.name = null;
   this.desc = null;
   this.picture = null;
   this.price = null;
   this.quant = null;
   this.rating = null;
   this.shipping = null;
   this.weight = null;
}

Product.prototype = {
   constructor: Product,
   
   load: function() {
      var xhr = new XMLHttpRequest();
         
      // Alias 'this' to 'that' so it's available in the onreadystatechange callback via a closure 
      var that = this;
      
      xhr.onreadystatechange = function() {
         if(xhr.readyState == 4 && xhr.status == 200) {
            // Parse the result & save in the object
            var jdata = JSON.parse(xhr.responseText);
            that.name = jdata.name;
            that.desc = jdata.desc;
            that.picture = jdata.picture;
            that.price = jdata.price;
            that.quant = jdata.quant;
            that.rating = jdata.rating;
            that.shipping = jdata.shipping;
            that.weight = jdata.weight;
            
            sessionStorage.setItem(jdata.sku, JSON.stringify(jdata));
            // Render the element on the page
            that.render();
         }
      }

      // Cross domain ajax request
      var url = 'http://jamilalvi.com/jamil/services/product.php';
      xhr.open('POST', url, true);
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhr.send('id=' + this.sku);
      return this;
   },
   

   // Render this product into the DOM.
   render: function() {
      // Get DOM container for the products
      var prodCol = document.getElementById('product-list');
      
      // How many products have already been rendered? Count by number of elements
      // with 'prod-tile' class
      var prodCount = document.getElementsByClassName('prod-tile').length;
  
      // Do we need to create a new row?
      // if((prodCount % 3) == 0) {
      //    var wrapperRow = document.createElement('div');
      //    wrapperRow.setAttribute('class', 'row');
      //    prodCol.appendChild(wrapperRow);
      // }
      // else {
      //    // Find last row & add new tile to that instead
      //    var wrapperRow = prodCol.lastChild;
      // }

      // Create a new row
      var wrapperRow = document.createElement('div');
         wrapperRow.setAttribute('class', 'row');
         wrapperRow.setAttribute('style', 'margin:30px');
         prodCol.appendChild(wrapperRow);
      // Create new div to contain product
      var e = document.createElement('div');
      e.setAttribute('class', 'col-sm-12 prod-tile');
      var imgsrc = "http://jamilalvi.com/jamil/services/cart_data/images/" + this.picture + ".png";
      
      e.innerHTML = '<div><img style="margin-right:20px;" align="left" class="img" src="' + imgsrc + '" width="140" height="140"></div>' + 
                    '<h4>' + this.name + ' Rating: ' + this.rating + '</h4>' + '<h3> $' + this.price.toFixed(2) + '</h3>' + 
                    '<div class="full-desc">' + this.desc + '</div>' + 
                    '<div style="float:right;"><a class="btn btn-warning" data-psku="' + this.sku + '" href="#" role="button">Add To Cart &raquo;</a></div>';
      
      // Add to container row
      wrapperRow.appendChild(e);
      prodCol.appendChild(wrapperRow);
   }
}

// Cart functions
var CartList = function(){
   this.carted = [];
}

CartList.prototype = {
   rebuild: function(cart) {
      this.carted = cart;
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
      document.getElementById("cart-total").getElementsByTagName("H4")[0].innerHTML = "Sub-total: $" + cartTotal.toFixed(2);
      document.getElementById("checkout").style.display = "block";
   }
}

function run() {
   // Holds the list of products 
   var pl = new ProductList();
   
   // Create cart list
   var cart = new CartList();

   // Load the product list. The callback is called when done
   pl.load(function() {
      // Loop through the list of products and build a request/response instance
      pl.productIds.forEach(function(sku) {
         // Load each product
         var prod = new Product(sku);
         pl.addProduct(prod.load());
      });
   });

   document.getElementById("product-list").addEventListener('click',function(e){
      if(e.target.tagName == 'A'){
         var sku = e.target.getAttribute("data-psku");
         cart.add(sku);
         cart.draw();
      }
   })
   document.getElementById("checkout").addEventListener('click', function(e) {
      sessionStorage.setItem("checkout",cartTotal);
      window.location = 'checkout.html';
   })


}
run();
