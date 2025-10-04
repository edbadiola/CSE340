const regValidate = require('../utilities/account-validation')

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
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
)





// Export router so server.js can use it
module.exports = router