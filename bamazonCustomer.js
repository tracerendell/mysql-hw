var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon_db",
});

connection.connect(function (err) {
    if (err) throw err;
});

// instantiate
var table = new Table({
    head: ['item_id', 'product_name', 'department_name', 'price', 'stock_quantity']
});


connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;
    var bamazonStock = res;

function displayTable() {
    connection.query('SELECT item_id, product_name, department_name, price, stock_quantity from products', function (error, results, fields) {
        if (error) throw error;
        results.forEach(element => {
          table.push([element.item_id, element.product_name, element.department_name, element.price, element.stock_quantity])
        });
        var bamazonTable = table.toString();
        console.log(bamazonTable);
      })
    };
    // console.log(bamazonStock[1].product_name);
    displayTable();
    start();

    function start() {

        
        
        inquirer
            .prompt([{
                name: "purchase",
                type: "confirm",
                message: "would you like to make a purchase from Bamazon?"
            }])
        .then(function(answer) {
            if (answer.purchase === true) {
            purchasePrompt();
            }
            else  console.log('Thanks for stopping by, have a great day!');
                    // connection.end();
        })
    };

    function purchasePrompt() {
        inquirer
            .prompt([{
                    name: "inventory",
                    type: "rawlist",
                    message: "what would you like to purchase? Here's what's in stock!",
                    choices: function () {
                        var choicesArray = [];
                        for (var i = 0; i < bamazonStock.length; i++) {
                            choicesArray.push(bamazonStock[i].product_name);
                        }
                        return choicesArray;
                    },
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "how many of those would you like to purchase?",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                },
            ])
            .then(function (answer) {

                connection.query("SELECT * FROM products WHERE product_name=?", [answer.inventory], function(err, res) {
                    var selectedItem = res;

                    if (selectedItem[0].stock_quantity < answer.quantity) {
                        console.log("so sorry, we do not have that many in stock, please adjust your order.");
                        purchasePrompt();
                    } else {
                    console.log("Those items are in stock and ready for purchase!");
                    console.log("thanks for shopping with us today, that will be $" + selectedItem[0].price * [answer.quantity] + " have a great day!");
                    connection.query("UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_name = ?", [answer.quantity, answer.inventory],
                    function(err) {
                        if (err) throw err;
                      
                    }      
                );
                    }
                });
                
            
              
                // confirmPurchase();
            });
    }

    function confirmPurchase() {
        console.log(answer.quantity);
    }
});