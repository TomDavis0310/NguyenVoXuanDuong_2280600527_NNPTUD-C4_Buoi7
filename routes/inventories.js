var express = require('express');
var router = express.Router();
let Inventory = require('../schemas/inventory');

// Get all inventories (populate product)
router.get('/', async function (req, res, next) {
  let result = await Inventory.find().populate('product');
  res.send(result);
});

// Get inventory by id (populate product)
router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await Inventory.findById(id).populate('product');
    if (!result) return res.status(404).send({ message: 'ID NOT FOUND' });
    res.send(result);
  } catch (err) {
    res.status(404).send({ message: 'ID NOT FOUND' });
  }
});

// Add stock: { product, quantity }
router.post('/add_stock', async function (req, res, next) {
  try {
    let { product, quantity } = req.body;
    quantity = Number(quantity) || 0;
    if (quantity <= 0) return res.status(400).send({ message: 'quantity must be > 0' });
    let inv = await Inventory.findOne({ product });
    if (!inv) {
      inv = new Inventory({ product, stock: quantity });
    } else {
      inv.stock += quantity;
    }
    await inv.save();
    res.send(inv);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Remove stock: { product, quantity }
router.post('/remove_stock', async function (req, res, next) {
  try {
    let { product, quantity } = req.body;
    quantity = Number(quantity) || 0;
    if (quantity <= 0) return res.status(400).send({ message: 'quantity must be > 0' });
    let inv = await Inventory.findOne({ product });
    if (!inv) return res.status(404).send({ message: 'inventory not found' });
    if (inv.stock < quantity) return res.status(400).send({ message: 'insufficient stock' });
    inv.stock -= quantity;
    await inv.save();
    res.send(inv);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Reservation: reduce stock and increase reserved
router.post('/reserve', async function (req, res, next) {
  try {
    let { product, quantity } = req.body;
    quantity = Number(quantity) || 0;
    if (quantity <= 0) return res.status(400).send({ message: 'quantity must be > 0' });
    let inv = await Inventory.findOne({ product });
    if (!inv) return res.status(404).send({ message: 'inventory not found' });
    if (inv.stock < quantity) return res.status(400).send({ message: 'insufficient stock' });
    inv.stock -= quantity;
    inv.reserved += quantity;
    await inv.save();
    res.send(inv);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Sold: reduce reserved and increase soldCount
router.post('/sold', async function (req, res, next) {
  try {
    let { product, quantity } = req.body;
    quantity = Number(quantity) || 0;
    if (quantity <= 0) return res.status(400).send({ message: 'quantity must be > 0' });
    let inv = await Inventory.findOne({ product });
    if (!inv) return res.status(404).send({ message: 'inventory not found' });
    if (inv.reserved < quantity) return res.status(400).send({ message: 'insufficient reserved quantity' });
    inv.reserved -= quantity;
    inv.soldCount += quantity;
    await inv.save();
    res.send(inv);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
