const bcrypt = require("bcryptjs")
const utilities = require("../utilities/")
const accModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email: "" // ✅ para hindi undefined
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    account_email: "" // ✅ dagdag para consistent
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_email: "" // ✅ para hindi undefined pag nag-error
    })
  }

  const regResult = await accModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email: "" // ✅ para safe
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_email: "" // ✅ safe ulit
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email: account_email || "" // ✅ laging defined
    })
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      )
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email: account_email || "" // ✅ kahit failed login, defined
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Deliver account management view
 * ************************************ */
async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav()

  // ✅ get user data from the JWT (added by utilities.checkJWTToken)
  const accountData = res.locals.accountData

  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    notice: req.flash("notice"),

    // ✅ pass these to the EJS view
    account_firstname: accountData.account_firstname,
    account_type: accountData.account_type,
    account_id: accountData.account_id
  })
}

/* ****************************************
*  Deliver Update Account view
* *************************************** */
async function buildUpdateAccount(req, res, next) {
  let nav = await utilities.getNav()
  const accountData = res.locals.accountData // from JWT middleware

  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    messages: {
      error: req.flash("error"),
      success: req.flash("success")
    },
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email
  })
}

/* ****************************************
*  Process Account Info Update
* *************************************** */
async function updateAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email } = req.body

  try {
    const result = await accModel.updateAccount(account_id, account_firstname, account_lastname, account_email)
    if (result) {
      req.flash("success", "Account information updated successfully.")
      return res.redirect("/account/")
    } else {
      req.flash("error", "Update failed. Please try again.")
      return res.status(400).render("account/update", {
        title: "Update Account",
        nav,
        errors: null,
        messages: { error: req.flash("error") },
        account_id,
        account_firstname,
        account_lastname,
        account_email
      })
    }
  } catch (error) {
    req.flash("error", "Error updating account.")
    res.redirect("/account/update")
  }
}

/* ****************************************
*  Process Password Change
* *************************************** */
async function updatePassword(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_password } = req.body

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const result = await accModel.updatePassword(account_id, hashedPassword)
    if (result) {
      req.flash("success", "Password updated successfully.")
      return res.redirect("/account/")
    } else {
      req.flash("error", "Password update failed.")
      return res.redirect("/account/update")
    }
  } catch (error) {
    req.flash("error", "Error updating password.")
    res.redirect("/account/update")
  }
}

/* ****************************************
 *  Logout Process
 * *************************************** */
async function logoutAccount(req, res) {
  // Remove the JWT cookie
  res.clearCookie("jwt")

  // Optionally, flash a message
  req.flash("notice", "You have successfully logged out.")

  // Redirect to the home page
  return res.redirect("/")
}


module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  buildUpdateAccount,   
  updateAccount,        
  updatePassword,
  logoutAccount
}


