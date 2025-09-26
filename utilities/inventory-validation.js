const { body, validationResult } = require("express-validator")
const utilities = require(".")

const classificationRules = () => [
  body("classification_name")
    .trim()
    .isAlphanumeric().withMessage("Only letters and numbers allowed.")
    .notEmpty().withMessage("Classification name is required.")
]

const checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      messages: null,
      errors: errors.array()
    })
  }
  next()
}

/* Inventory rules */
const inventoryRules = () => [
  body("classification_id")
    .notEmpty().withMessage("Please choose a classification.")
    .isInt().withMessage("Invalid classification."),

  body("inv_make")
    .trim()
    .notEmpty().withMessage("Make is required.")
    .isLength({ max: 50 }).withMessage("Make is too long.")
    .matches(/^[A-Za-z0-9 ]+$/).withMessage("Make may only contain letters, numbers and spaces."),

  body("inv_model")
    .trim()
    .notEmpty().withMessage("Model is required.")
    .isLength({ max: 50 }).withMessage("Model is too long.")
    .matches(/^[A-Za-z0-9 ]+$/).withMessage("Model may only contain letters, numbers and spaces."),

  body("inv_year")
    .notEmpty().withMessage("Year is required.")
    .isInt({ min: 1900, max: 2100 }).withMessage("Year must be a valid year."),

  body("inv_price")
    .notEmpty().withMessage("Price is required.")
    .isFloat({ min: 0 }).withMessage("Price must be a positive number."),

  body("inv_miles")
    .notEmpty().withMessage("Miles is required.")
    .isInt({ min: 0 }).withMessage("Miles must be a positive integer."),

  body("inv_description")
    .trim()
    .notEmpty().withMessage("Description is required.")
    .isLength({ min: 10 }).withMessage("Description must be at least 10 characters."),

  body("inv_image")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 255 }).withMessage("Image path too long."),

  body("inv_thumbnail")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 255 }).withMessage("Thumbnail path too long."),
]

const checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    // Rebuild the classification list with the selected value to keep it sticky
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(req.body.classification_id)

    // Render add-inventory view with sticky values and errors
    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      // pass each input back for stickiness:
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_description: req.body.inv_description,
      errors: errors.array(),
      messages: null
    })
  }
  next()
}

module.exports = {
  classificationRules,
  checkClassificationData,
  inventoryRules,
  checkInventoryData
}
