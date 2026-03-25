var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
let orderModel = require('../schemas/orders');
let productModel = require('../schemas/products');
const authMiddleware = require('../utils/authHandler');

// GET all orders (admin) or with query filters
router.get('/', async function (req, res, next) {
  try {
    let filter = { isDeleted: false };
    if (req.query.status) {
      filter.status = req.query.status;
    }
    let result = await orderModel
      .find(filter)
      .populate({ path: 'user', select: 'username fullName email' })
      .populate({ path: 'items.product', select: 'title price images' });
    res.send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

// GET current user's orders (requires auth)
router.get('/my', authMiddleware, async function (req, res, next) {
  try {
    let userId = req.user.id;
    let result = await orderModel
      .find({ user: userId, isDeleted: false })
      .populate({ path: 'items.product', select: 'title price images' });
    res.send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

// GET order by id
router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await orderModel
      .findById(id)
      .populate({ path: 'user', select: 'username fullName email' })
      .populate({ path: 'items.product', select: 'title price images' });
    if (!result || result.isDeleted) {
      return res.status(404).send({ message: 'ID NOT FOUND' });
    }
    res.send(result);
  } catch (error) {
    res.status(404).send({ message: 'ID NOT FOUND' });
  }
});

// POST create order (requires auth)
router.post('/', authMiddleware, async function (req, res, next) {
  try {
    let userId = req.user.id;
    let { items, shippingAddress, note } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).send({ message: 'Order must have at least one item' });
    }

    // Validate product IDs format
    for (let item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).send({ message: 'PRODUCT_ID_INVALID' });
      }
    }

    // Fetch all products in a single query
    const productIds = items.map((item) => item.product);
    const products = await productModel.find({ _id: { $in: productIds }, isDeleted: false });
    const productMap = {};
    for (const p of products) {
      productMap[p._id.toString()] = p;
    }

    // Validate and build order items
    let orderItems = [];
    let totalAmount = 0;

    for (let item of items) {
      const product = productMap[item.product.toString()];
      if (!product) {
        return res.status(400).send({ message: `Product not found: ${item.product}` });
      }
      let quantity = Number(item.quantity) || 1;
      let price = product.price;
      orderItems.push({ product: product._id, quantity, price });
      totalAmount += price * quantity;
    }

    let newOrder = new orderModel({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress: shippingAddress || '',
      note: note || '',
    });
    await newOrder.save();
    res.send(newOrder);
  } catch (error) {
    res.status(400).send(error);
  }
});

// PUT update order (shippingAddress, note)
router.put('/:id', authMiddleware, async function (req, res, next) {
  try {
    let id = req.params.id;
    let order = await orderModel.findById(id);
    if (!order || order.isDeleted) {
      return res.status(404).send({ message: 'ID NOT FOUND' });
    }
    // Only allow updating shippingAddress and note if order is still pending
    if (order.status !== 'pending') {
      return res.status(400).send({ message: 'Cannot update order that is not pending' });
    }
    let { shippingAddress, note } = req.body;
    if (shippingAddress !== undefined) order.shippingAddress = shippingAddress;
    if (note !== undefined) order.note = note;
    await order.save();
    res.send(order);
  } catch (error) {
    res.status(400).send(error);
  }
});

// PUT update order status
router.put('/:id/status', async function (req, res, next) {
  try {
    let id = req.params.id;
    let { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).send({ message: 'Invalid status' });
    }
    let order = await orderModel.findById(id);
    if (!order || order.isDeleted) {
      return res.status(404).send({ message: 'ID NOT FOUND' });
    }
    order.status = status;
    await order.save();
    res.send(order);
  } catch (error) {
    res.status(400).send(error);
  }
});

// DELETE soft delete order
router.delete('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await orderModel.findById(id);
    if (!result || result.isDeleted) {
      return res.status(404).send({ message: 'ID NOT FOUND' });
    }
    result.isDeleted = true;
    await result.save();
    res.send(result);
  } catch (error) {
    res.status(404).send({ message: 'ID NOT FOUND' });
  }
});

module.exports = router;
