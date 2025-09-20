// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// routes/inventory.js (What this does: when someone browses ex.- /inventory/detail/5, Express calls invController.buildByInvId)
router.get("/detail/:inv_id", invController.buildByInvId)

router.get("/trigger-error", invController.triggerError)



module.exports = router;