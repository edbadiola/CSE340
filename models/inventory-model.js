const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

// models/inventory-model.js
async function getVehicleByInvId(inv_id) {
  try {
    const sql = "SELECT * FROM inventory WHERE inv_id = $1"
    const result = await pool.query(sql, [inv_id])
    return result.rows[0] // returns one vehicle object or undefined
  } catch (error) {
    console.error("getVehicleByInvId error:", error)
    throw error
  }
}

// Alias function for compatibility with controller
async function getInventoryById(inv_id) {
  return await getVehicleByInvId(inv_id)
}

async function insertClassification(name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    const data = await pool.query(sql, [name])
    return data.rowCount
  } catch (err) {
    throw err
  }
}

async function insertInventory(data) {
  try {
    const sql = `INSERT INTO inventory
      (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`
    const values = [
      data.classification_id,
      data.inv_make,
      data.inv_model,
      data.inv_description,
      data.inv_image,
      data.inv_thumbnail,
      data.inv_price,
      data.inv_year,
      data.inv_miles,
      data.inv_color
    ]
    const result = await pool.query(sql, values)
    return result.rowCount
  } catch (error) {
    throw error
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1';
    const data = await pool.query(sql, [inv_id]);
    return data.rowCount > 0; // true if deletion succeeded, false if not
  } catch (error) {
    console.error("Delete Inventory Error:", error);
    return false; // so controller can handle failure
  }
}

/* ***************************
 *  Get all cars
 * ************************** */
async function getAllCars() {
  try {
    const data = await pool.query("SELECT * FROM public.inventory ORDER BY inv_make, inv_model")
    return data.rows
  } catch (error) {
    console.error("getAllCars error:", error)
    throw error
  }
}

async function getAllCarsSorted(sortBy) {
  let orderClause = ""

  switch (sortBy) {
    case "price_asc":
      orderClause = "ORDER BY inv_price ASC"
      break
    case "price_desc":
      orderClause = "ORDER BY inv_price DESC"
      break
    case "year_new":
      orderClause = "ORDER BY inv_year DESC"
      break
    case "year_old":
      orderClause = "ORDER BY inv_year ASC"
      break
    default:
      orderClause = "ORDER BY inv_make"
  }

  return pool.query(`SELECT * FROM public.inventory ${orderClause}`)
}



module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleByInvId,
  insertClassification,
  insertInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
  getAllCars,
  getAllCarsSorted
};
