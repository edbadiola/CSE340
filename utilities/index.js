const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    // add our outer class
    grid = '<div class="inv-grid">'
    data.forEach(vehicle => { 
      grid += '<div class="inv-card">'  // wrapper for each vehicle
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model + ' details">'
        + '<img src="' + vehicle.inv_thumbnail 
        + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' on CSE Motors" />'
        + '</a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid +=   '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</div>'  // close .inv-card
    })
    grid += '</div>'    // close .inv-grid
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

// utilities/index.js

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
}

function formatNumber(num) {
  return new Intl.NumberFormat("en-US").format(Number(num || 0))
}

/**
 * buildVehicleDetail(vehicle)
 * Accepts the vehicle object (row from DB) and returns an HTML string
 * Uses full-size image if DB gives a thumbnail name (tries to remove 'tn-' prefix).
 */
function buildVehicleDetail(vehicle) {
  if (!vehicle) return "<p>No vehicle data provided.</p>"

  // Determine image path: prefer full-size image. Try to remove tn- prefix if present.
  let imgPath = vehicle.inv_image || ""
  // If db stored just a filename, prefix the images folder
  if (imgPath && !imgPath.startsWith("/")) {
    imgPath = `/images/vehicles/${imgPath}`
  }
  // Remove 'tn-' prefix from filename if present (common thumbnail pattern)
  const parts = imgPath.split("/")
  const fname = parts.pop()
  const cleanedFname = fname.startsWith("tn-") ? fname.replace("tn-", "") : fname
  parts.push(cleanedFname)
  imgPath = parts.join("/")

  const price = formatCurrency(vehicle.inv_price)
  const miles = formatNumber(vehicle.inv_miles)

  return `
    <div class="vehicle-detail">
      <figure class="vehicle-image">
        <img src="${imgPath}" alt="${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}" loading="lazy">
      </figure>

      <div class="vehicle-info">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>

        <p class="vehicle-price"><strong>Price:</strong> ${price}</p>
        <p class="vehicle-mileage"><strong>Mileage:</strong> ${miles} miles</p>

        <p class="vehicle-basic">
          <strong>Color:</strong> ${vehicle.inv_color || "N/A"} |
          <strong>Transmission:</strong> ${vehicle.inv_transmission || "N/A"}
        </p>

        <section class="vehicle-description">
          <h3>Overview</h3>
          <p>${vehicle.inv_description || "No description available."}</p>
        </section>

        <section class="vehicle-details">
          <h4>Details</h4>
          <ul>
            <li><strong>Make:</strong> ${vehicle.inv_make}</li>
            <li><strong>Model:</strong> ${vehicle.inv_model}</li>
            <li><strong>Year:</strong> ${vehicle.inv_year}</li>
            <li><strong>VIN:</strong> ${vehicle.inv_vin || "N/A"}</li>
          </ul>
        </section>
      </div>
    </div>
  `
}


/**
 * buildClassificationList(selectedId)
 *  Returns <select> HTML ng classifications, may option selected kung meron
 */
async function buildClassificationList(selectedId = null) {
  const data = await invModel.getClassifications()
  let list = `<select name="classification_id" id="classification_id" required>`
  list += `<option value="">Select a Classification</option>`
  data.rows.forEach(row => {
    list += `<option value="${row.classification_id}"` +
            (row.classification_id == selectedId ? " selected" : "") +
            `>${row.classification_name}</option>`
  })
  list += `</select>`
  return list
}


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }


module.exports = {
  handleErrors: Util.handleErrors,
  getNav: Util.getNav,
  buildClassificationGrid: Util.buildClassificationGrid,
  formatCurrency,
  formatNumber,
  buildVehicleDetail,
  buildClassificationList,
  checkJWTToken: Util.checkJWTToken,
  checkLogin: Util.checkLogin
}