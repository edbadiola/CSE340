// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation.js")
const { checkJWTToken, checkEmployeeOrAdmin } = require("../utilities")

/* ***************
 * PUBLIC ROUTES
 * These do NOT require login
 *****************/

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

// Route to show vehicle detail view
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildByInvId)
)

// Trigger error (for testing)
router.get(
  "/trigger-error",
  utilities.handleErrors(invController.triggerError)
)

/* ***************
 * MANAGEMENT VIEW (Employee/Admin only)
 *****************/

router.get(
  "/",
  checkJWTToken,
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildManagement)
)

/* ***************
 * CLASSIFICATION ROUTES
 *****************/

// Show add classification form
router.get(
  "/add-classification",
  checkJWTToken,
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddClassification)
)

// Process add classification form
router.post(
  "/add-classification",
  checkJWTToken,
  checkEmployeeOrAdmin,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

/* ***************
 * INVENTORY ROUTES
 *****************/

// Show add inventory form
router.get(
  "/add-inventory",
  checkJWTToken,
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddInventory)
)

// Process add inventory form
router.post(
  "/add-inventory",
  checkJWTToken,
  checkEmployeeOrAdmin,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// Return inventory items as JSON
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)

// Show edit form
router.get(
  "/edit/:inv_id",
  checkJWTToken,
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildEditInventory)
)

// Process update
router.post(
  "/update",
  checkJWTToken,
  checkEmployeeOrAdmin,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

/* ***************
 * DELETE ROUTES
 *****************/

// Show delete confirmation view
router.get(
  "/delete/:inv_id",
  checkJWTToken,
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildDeleteInventory)
)

// Process delete
router.post(
  "/delete",
  checkJWTToken,
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteInventory)
)

router.get(
  "/view-all",
  utilities.handleErrors(invController.buildViewAll))


/* ***************
 * EXPORT ROUTER
 *****************/
module.exports = router
