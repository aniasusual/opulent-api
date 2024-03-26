const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

  customerId: {
    type: String,
  },
  userId: {
    type: String,
    required: true
  },
  paymentIntentId: {
    type: String,
  },
  // shippingInfo: {
  //   address: {
  //     type: String,
  //     required: true,
  //   },
  //   city: {
  //     type: String,
  //     required: true,
  //   },

  //   state: {
  //     type: String,
  //     required: true,
  //   },

  //   country: {
  //     type: String,
  //     required: true,
  //   },
  //   pinCode: {
  //     type: Number,
  //     required: true,
  //   },
  //   phoneNo: {
  //     type: Number,
  //     required: true,
  //   },
  // },
  shippingInfo: { type: Object, required: true },

  orderItems: [
    {
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      image: {
        type: String,
        // required: true,
      },
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "ProductModel",
        required: true,
      },
    },
  ],
  // orderItems: [
  //   { productId: { type: String }, quantity: { type: Number, default: 1 } },
  // ],
  // user: {
  //   type: mongoose.Schema.ObjectId,
  //   ref: "UserModel",
  //   required: true,
  // },
  // paymentInfo: {
  //   id: {
  //     type: String,
  //     required: true,
  //   },
  //   status: {
  //     type: String,
  //     required: true,
  //   },
  // },
  paidAt: {
    type: Date,
    required: true,
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  orderStatus: {
    type: String,
    required: true,
    default: "Processing",
  },
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // delivery_status: { type: String, default: "pending" },
  payment_status: { type: String, required: true },
});

module.exports = mongoose.model("OrderModel", orderSchema);