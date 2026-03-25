var express = require('express');
var router = express.Router();
const slugify = require('slugify');
let categoryModel = require('../schemas/categories');

router.get('/', async function (req, res, next) {
  let result = await categoryModel.find({ isDeleted: false });
  res.send(result);
});

router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await categoryModel.findById(id);
    if (!result || result.isDeleted) {
      return res.status(404).send({ message: 'ID NOT FOUND' });
    }
    res.send(result);
  } catch (error) {
    res.status(404).send({ message: 'ID NOT FOUND' });
  }
});

router.get('/:id/products', async function (req, res, next) {
  try {
    let id = req.params.id;
    let category = await categoryModel.findById(id);
    if (!category || category.isDeleted) {
      return res.status(404).send({ message: 'ID NOT FOUND' });
    }
    let productModel = require('../schemas/products');
    let products = await productModel.find({ category: id, isDeleted: false });
    res.send(products);
  } catch (error) {
    res.status(404).send({ message: 'ID NOT FOUND' });
  }
});

router.post('/', async function (req, res, next) {
  try {
    let newCate = new categoryModel({
      name: req.body.name,
      slug: slugify(req.body.name, {
        replacement: '-',
        remove: undefined,
        lower: true,
      }),
      image: req.body.image,
    });
    await newCate.save();
    res.send(newCate);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.put('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await categoryModel.findByIdAndUpdate(id, req.body, { new: true });
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
    let result = await categoryModel.findById(id);
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
