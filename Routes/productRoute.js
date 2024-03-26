const express = require('express');
const { getAllProducts, addProduct, getById, updateById, deleteById, createProduct, createProductReview, getAllReviews, deleteReview, getProductDetails, getAdminProducts, deleteProduct, updateProduct } = require("../Controllers/productController");
const { isAuthenticated, isAuthorized } = require('../middleware/auth');
// const { updateProduct, deleteProduct } = require("../Controllers/productController")

const productRouter = express.Router();

productRouter.route('/products').get(getAllProducts)

productRouter.route("/admin/products").get(isAuthenticated, isAuthorized("admin"), getAdminProducts);
productRouter
    .route("/admin/product/new")
    .post(isAuthenticated, isAuthorized("admin"), createProduct);

productRouter.route("/admin/product/:id").put(isAuthenticated, isAuthorized("admin"), updateProduct).delete(isAuthenticated, isAuthorized("admin"), deleteProduct);

productRouter.route('/admin/products/new').post(isAuthenticated, isAuthorized("admin"), addProduct);

productRouter.route('/admin/products/:id').get(getById).put(isAuthenticated, isAuthorized("admin"), updateById).delete(isAuthenticated, isAuthorized("admin"), deleteById);

productRouter.route("/product/:id").get(getProductDetails);

productRouter.route("/review").put(isAuthenticated, createProductReview);

productRouter.route("/reviews").get(getAllReviews).delete(isAuthenticated, deleteReview);

module.exports = productRouter;