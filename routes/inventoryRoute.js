// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation.js")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// routes/inventory.js (What this does: when someone browses ex.- /inventory/detail/5, Express calls invController.buildByInvId)
router.get("/detail/:inv_id", invController.buildByInvId)

router.get("/trigger-error", invController.triggerError)

// Management view
router.get(
  "/",                                   
  utilities.handleErrors(invController.buildManagement)
)

// Show form
router.get("/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
)

// Process form
router.post("/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

// show add inventory form
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventory)
)

// process add-inventory form
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// Return inventory items as JSON for a given classification
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

// Display a page for editing a specific inventory item.
router.get(
  "/edit/:inv_id",
  utilities.handleErrors(invController.buildEditInventory)
)

router.post(
  "/update",
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)


// Show delete confirmation view
router.get(
  "/delete/:inv_id",
  utilities.handleErrors(invController.buildDeleteInventory) // You need to implement this controller method
);

// Handle delete process
router.post(
  "/delete",
  utilities.handleErrors(invController.deleteInventory) // You need to implement this controller method
);

module.exports = router;