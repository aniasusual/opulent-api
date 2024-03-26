const express = require("express");


const orderRouter = express.Router();

const { isAuthenticated, isAuthorized } = require("../middleware/auth");
const { newOrder, getSingleOrder, myOrders, getAllOrders, updateOrder, deleteOrder } = require("../Controllers/orderController");

orderRouter.route("/order/new").post(isAuthenticated, newOrder);
orderRouter.route("/order/:id").get(isAuthenticated, getSingleOrder);
orderRouter.route("/orders/me").get(isAuthenticated, myOrders);
orderRouter.route("/admin/orders").get(isAuthenticated, isAuthorized("admin"), getAllOrders);
orderRouter.route("/admin/order/:id").put(isAuthenticated, isAuthorized("admin"), updateOrder).delete(isAuthenticated, isAuthorized("admin"), deleteOrder);

module.exports = orderRouter;