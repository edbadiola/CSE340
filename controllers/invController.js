const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)

    if (!data || data.length === 0) {
      return res.status(404).render("errors/404", {
        title: "Not Found",
        message: "No vehicles for that classification."
      })
    }

    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name

    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    })
  } catch (err) {
    console.error("buildByClassificationId error:", err)
    next(err)
  }
}



invCont.buildByInvId = async function (req, res, next) {
  try {
    const inv_id = req.params.inv_id
    const vehicleData = await invModel.getVehicleByInvId(inv_id)

    if (!vehicleData) {
      return res.status(404).render("errors/404", { 
        title: "Vehicle not found", 
        message: "Vehicle not found" 
      })
    }

    const vehicleHTML = utilities.buildVehicleDetail(vehicleData)

    let nav = await utilities.getNav()

    res.render("inventory/detail", {
      title: `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      vehicleHTML,
      vehicle: vehicleData,
    })
  } catch (error) {
    console.error("buildByInvId error:", error)
    next(error)
  }
}

invCont.triggerError = (req, res, next) => {
  // Ito ang "intentional error"
  next(new Error("Intentional 500 error for testing"));
};


module.exports = invCont
