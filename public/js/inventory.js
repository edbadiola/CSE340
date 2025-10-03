'use strict';

// Get a list of items in inventory based on the classification_id
let classificationList = document.querySelector("#classification_id");

classificationList.addEventListener("change", function () {
    let classification_id = classificationList.value;
    console.log(`classification_id is: ${classification_id}`);

    let classIdURL = "/inv/getInventory/" + classification_id;

    fetch(classIdURL)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            }
            throw Error("Network response was not OK");
        })
        .then(function (data) {
            console.log(data);
            buildInventoryList(data); // send data to function to build table
        })
        .catch(function (error) {
            console.log('There was a problem: ', error.message);
        });
});

// Build inventory items into HTML table components and inject into DOM
function buildInventoryList(data) {
    let inventoryDisplay = document.getElementById("inventoryDisplay");

    // Clear previous table content
    inventoryDisplay.innerHTML = "";

    // Set up table header
    let dataTable = '<thead>';
    dataTable += '<tr><th>Vehicle Name</th><th>Modify</th><th>Delete</th></tr>';
    dataTable += '</thead>';

    // Set up table body
    dataTable += '<tbody>';
    data.forEach(function (element) {
        console.log(element.inv_id + ", " + element.inv_model);
        dataTable += `<tr>
                        <td>${element.inv_make} ${element.inv_model}</td>
                        <td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>
                        <td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td>
                      </tr>`;
    });
    dataTable += '</tbody>';

    // Inject finished table into DOM
    inventoryDisplay.innerHTML = dataTable;
}
