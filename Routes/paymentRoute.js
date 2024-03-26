const express = require("express");
const paymentRouter = express.Router();
// const webhookSecret = "whsec_3f1f836abdd5a891d05c2443c2f3c179c7f5d376006c0abedfcaf0b5b5b6c6c9";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


const { isAuthenticated } = require("../middleware/auth");
const { processPayment, useWebhook, returnNewOrder } = require("../Controllers/paymentController");


// Configure express.raw() middleware to parse the raw request body
paymentRouter.use(express.raw({ type: 'application/json' }));

paymentRouter.route("/payment/process").post(isAuthenticated, processPayment);
paymentRouter.route("/webhook").post(useWebhook);
paymentRouter.route("/newOrder").get(returnNewOrder);

module.exports = paymentRouter;
