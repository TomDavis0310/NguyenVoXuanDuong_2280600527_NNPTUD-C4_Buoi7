var express = require('express');
var router = express.Router();
const slugify = require('slugify');
let productModel = require('../schemas/products');

router.get('/', async function (req, res, next) {
  let queries = req.query;
  let titleQ = queries.title ? queries.title : '';
  let minPrice = queries.min ? Number(queries.min) : 0;
  let maxPrice = queries.max ? Number(queries.max) : 10000;
  let result = await productModel
    .find({
      isDeleted: false,
      title: new RegExp(titleQ, 'i'),
      price: { $gte: minPrice, $lte: maxPrice },
    })
    .populate({ path: 'category', select: 'name' });
  res.send(result);
});

router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await productModel
      .findById(id)
      .populate({ path: 'category', select: 'name' });
    if (!result || result.isDeleted) {
      return res.status(404).send({ message: 'ID NOT FOUND' });
    }
    res.send(result);
  } catch (error) {
    res.status(404).send({ message: 'ID NOT FOUND' });
  }
});

router.post('/', async function (req, res, next) {
  try {
    let newProduct = new productModel({
      title: req.body.title,
      slug: slugify(req.body.title, {
        replacement: '-',
        remove: undefined,
        lower: true,
      }),
      price: req.body.price,
      description: req.body.description,
      images: req.body.images,
      category: req.body.category,
    });
    await newProduct.save();
    res.send(newProduct);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.put('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await productModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!result) {
      return res.status(404).send({ message: 'ID NOT FOUND' });
    }
    res.send(result);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await productModel.findById(id);
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
