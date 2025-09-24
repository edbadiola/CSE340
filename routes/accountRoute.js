const express = require("express")
const router = express.Router()

// Utility functions (e.g., errorHandler, etc.)
const utilities = require("../utilities")

// Account controller (create controllers/accountController.js later)
const accountController = require("../controllers/accountController")

/* ***************
 *  GET Login View
 *  Path: /account/login  (the "/account" prefix is added in server.js)
 *****************/
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)

// Export router so server.js can use it
module.exports = router