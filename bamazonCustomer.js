var mysql = require("mysql");
var inquirer = require("inquirer")
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazonDB"
});
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    listItems();
});
function listItems() {
    connection.query("SELECT * FROM Products", function (err, res) {
        if (err) throw err;
        res.forEach(data => {
            console.log("Item ID: " + data.item_id + " | " + data.product_name + " | " + data.department_name + " | " + data.price + " | " + data.stock_quantity);
        })
        buyItem();
    });

}

function buyItem() {
    inquirer.prompt([{
        name: "itemID",   
        type: "input",
        message: "What ID product would you like to buy?",

    }, {
        name: "numberOfUnits",
        type: "input",
        message: "How many units of the product would you like to buy?",

    }])
        .then(answer => {
            var query = "SELECT item_id, price, stock_quantity FROM products WHERE ?";

            connection.query(query, { item_id: answer.itemID },
                (err, results) => {

                    if (results.length === 0) {
                        console.log("Product ID NOT found..");

                        buyItem();
                    } else if (answer.numberOfUnits <= results[0].stock_quantity) {


                        var total = answer.numberOfUnits * results[0].price;

                        var query = connection.query(
                            "UPDATE products SET ? WHERE ?", [{

                                stock_quantity: results[0].stock_quantity - answer.numberOfUnits
                            },
                            {
                                item_id: answer.itemID
                            }
                        ], (err, res) => {
                            if (err) throw err;
                            console.log("Success!! Your Total Cost is: " + total);
                            connection.end();
                        });


                    } else {
                        console.log("Insufficient stock!! There's only " + results[0].stock_quantity + "units available. Please try again..");
                        buyItem();
                    }
                });
        });
}





