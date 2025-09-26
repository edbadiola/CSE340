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


/* Build vehicle detail view */
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

/* Intentional 500 error for testing */
invCont.triggerError = (req, res, next) => {
  // Ito ang "intentional error"
  next(new Error("Intentional 500 error for testing"));
};

/* Management view */
invCont.buildManagement = async function (req, res, next) {
  const nav = await utilities.getNav()
  const message = req.flash("notice")
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    message,
  })
}

// Show the form page
invCont.buildAddClassification = async function (req, res, next) {
  const nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    messages: req.flash("notice"),
    errors: null
  })
}

// Handle form submission
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body
  const nav = await utilities.getNav()

  try {
    const addResult = await invModel.insertClassification(classification_name)
    if (addResult) {
      req.flash("notice", "New classification added successfully.")
      // Rebuild nav to include the new item
      const updatedNav = await utilities.getNav()
      return res.render("inventory/management", {
        title: "Inventory Management",
        nav: updatedNav,
        message: req.flash("notice")
      })
    } else {
      req.flash("notice", "Insert failed. Try again.")
      return res.status(500).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        messages: req.flash("notice"),
        errors: null
      })
    }
  } catch (err) {
    console.error("addClassification error:", err)
    req.flash("notice", "Server error. Try again.")
    res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      messages: req.flash("notice"),
      errors: [{ msg: "Server error" }]
    })
  }
}

// Show the add-inventory form
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      // set empty defaults for sticky fields
      inv_make: '',
      inv_model: '',
      inv_year: '',
      inv_price: '',
      inv_miles: '',
      inv_image: '/images/no-image-available.png',
      inv_thumbnail: '/images/no-image-available-tn.png',
      inv_description: '',
      errors: null,
      messages: req.flash("notice")
    })
  } catch (err) {
    next(err)
  }
}

// Handle submission
invCont.addInventory = async function (req, res, next) {
  console.log(">>> addInventory HIT <<<")
  console.log("req.body:", req.body)
  try {
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    } = req.body

    // Fallback to default images if the user didn't provide any
    const imagePath = inv_image && inv_image.length ? inv_image : '/images/no-image-available.png'
    const thumbnailPath = inv_thumbnail && inv_thumbnail.length ? inv_thumbnail : '/images/no-image-available-tn.png'

    const addResult = await invModel.insertInventory({
      classification_id: parseInt(classification_id), // integer
      inv_make,       // string
      inv_model,      // string
      inv_year,       // string
      inv_description,// string
      inv_image: imagePath,   // string
      inv_thumbnail: thumbnailPath, // string
      inv_price: parseInt(inv_price), // integer
      inv_miles: parseInt(inv_miles), // integer
      inv_color       // string
    })


    if (addResult) {
      req.flash("notice", "New vehicle added successfully.")
      const updatedNav = await utilities.getNav()
      return res.render("inventory/management", {
        title: "Inventory Management",
        nav: updatedNav,
        message: req.flash("notice")
      })
    } else {
      req.flash("notice", "Failed to add vehicle. Please try again.")
      const nav = await utilities.getNav()
      const classificationList = await utilities.buildClassificationList(classification_id)
      return res.status(500).render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        inv_make, inv_model, inv_year, inv_price, inv_miles,
        inv_image: imagePath, inv_thumbnail: thumbnailPath, inv_description,
        errors: [{ msg: "Insert failed" }],
        messages: req.flash("notice")
      })
    }
  } catch (err) {
    console.error("addInventory error:", err)
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(req.body.classification_id)
    return res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_description: req.body.inv_description,
      errors: [{ msg: "Server error. Try again later." }],
      messages: req.flash("notice")
    })
  }
}




module.exports = invCont
