import sqlite3
import requests

class ProductList(object):
	def __init__(self):
		self.conn = sqlite3.connect("shoppingcart.db")
		self.cur = self.conn.cursor()

	def createTable(self):
		self.cur.execute("CREATE TABLE products (sku char(20) not null,picture char(60) null,name char(40) not null,weight real null,rating real null,price real not null,shipping real null, quant int null,desc char(300) not null)")
		self.conn.commit()

	def getPostSkus(self):
		# Do AJAX request to get list of skus
		skus = requests.get('http://jamilalvi.com/jamil/services/products.php')
		self.products = skus.json()

	def getProducts(self,sku):
		# Query database and return product details
		#self.cur.execute("SELECT * FROM products WHERE 'sku'=sku")
		payload = {'id':sku}
		prod = requests.post('http://jamilalvi.com/jamil/services/product.php', data=payload)
		# INSERT INTO products table
		return prod.json()

	def saveProducts(self,product):
		temp = []
		for key, value in product.iteritems():
			temp.append(value)
			self.cur.execute("INSERT INTO products (sku, picture, name, weight, rating, price, shipping, quant, desc) VALUES (?,?,?,?,?,?,?,?,?)",temp)

class Cart(object):
	def __init__(self):
		self.products = 0
		self.conn = sqlite3.connect("shoppingcart.db")
		self.cur = self.conn.cursor()

	def createCart(self):
		# CREATE shopping cart table
		self.cur.execute("CREATE TABLE cart (cart_id int primary key, quantity int not null, sku char(20) not null)")
		self.conn.commit()

	def addProduct(self,sku):
		# SELECT sku from cart and get quantity
		# If no match, set quantity to 1, if exists add 1 to quantity
		self.cur.execute("SELECT quant FROM products WHERE sku= sku")
		quantity = self.cur
		quant = 0
		if quantity  == None:
			quant = 1
		elif quantity >= 1:
			quant = quantity + 1

		# INSERT row into cart table
		self.cur.execute("INSERT INTO cart (sku,quant) VALUES (sku,quant)")

	def removeProduct(self,sku):
		# DELETE row from cart table
		self.cur.execute("DELETE FROM cart WHERE sku = sku")

	def checkOut(self):
		pass


cart = Cart()

#cart.createCart()

cart.addProduct(4900095803)




# db = ProductList()

# db.getPostSkus()
# prodlist = db.products

# for sku in prodlist:
# 	d = db.getProducts(sku)
# 	db.saveProducts(d)

db.conn.commit()
db.conn.close()
