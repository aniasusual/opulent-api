const { newOrder } = require("./orderController");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "whsec_3f1f836abdd5a891d05c2443c2f3c179c7f5d376006c0abedfcaf0b5b5b6c6c9";

let retrievedOrder;

exports.returnNewOrder = (req, res) => {
    res.json({
        newOrder: retrievedOrder
    })
}

exports.processPayment = async (req, res) => {

    // console.log(req.body.userData._id);
    const customer = await stripe.customers.create({
        metadata: {
            userId: req.body.userData._id,
            // cart: JSON.stringify(req.body.items.toString()),
            cart: JSON.stringify(req.body.items),
            // shippingInfo: JSON.stringify(req.body.shippingInfo),
            user: JSON.stringify(req.body.userData)
        }
    })

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            shipping_address_collection: {
                allowed_countries: ["US", "CA", "IN"],
            },
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: "fixed_amount",
                        fixed_amount: {
                            amount: 0,
                            currency: "inr",
                        },
                        display_name: "Free shipping",
                        // Delivers between 5-7 business days
                        delivery_estimate: {
                            minimum: {
                                unit: "business_day",
                                value: 5,
                            },
                            maximum: {
                                unit: "business_day",
                                value: 7,
                            },
                        },
                    },
                },
                {
                    shipping_rate_data: {
                        type: "fixed_amount",
                        fixed_amount: {
                            amount: 150000,
                            currency: "inr",
                        },
                        display_name: "Next day air",
                        // Delivers in exactly 1 business day
                        delivery_estimate: {
                            minimum: {
                                unit: "business_day",
                                value: 1,
                            },
                            maximum: {
                                unit: "business_day",
                                value: 1,
                            },
                        },
                    },
                },
            ],
            phone_number_collection: {
                enabled: true,
            },
            // customer: customer.metadata.userId,
            customer: customer.id,
            line_items: req.body.items.map(item => {
                const imgs = [];
                imgs.push(item.image);
                return {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: item.name,
                            // images: [imgs],

                        },
                        unit_amount: item.price * 100
                    },
                    quantity: item.quantity,

                }
            }),
            billing_address_collection: "required",
            success_url: `${process.env.FRONTEND_URL}/payment/success`,
            cancel_url: `${process.env.FRONTEND_URL}/cart`
        })
        res.json({
            url: session.url,
        })
    }
    catch (e) {
        res.status(500).json({
            error: e.message
        })
    }
}

exports.useWebhook = async function (req, res) {
    let data;
    let eventType;

    // Check if webhook signing is configured.
    // let webhookSecret = "whsec_3f1f836abdd5a891d05c2443c2f3c179c7f5d376006c0abedfcaf0b5b5b6c6c9";
    //webhookSecret = process.env.STRIPE_WEB_HOOK;

    // if (webhookSecret) {
    //     // Retrieve the event by verifying the signature using the raw body and secret.
    //     let event;
    //     let signature = req.headers["stripe-signature"];

    //     try {
    //         event = stripe.webhooks.constructEvent(
    //             req.body,
    //             signature,
    //             webhookSecret
    //         );
    //     } catch (err) {
    //         console.log(`⚠️  Webhook signature verification failed:  ${err.message}`);
    //         return res.sendStatus(400);
    //     }
    //     // Extract the object from the event.
    //     data = event.data.object;
    //     eventType = event.type;
    // } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data.object;
    eventType = req.body.type;
    // }

    // Handle the checkout.session.completed event
    if (eventType === "checkout.session.completed") {
        stripe.customers
            .retrieve(data.customer)
            .then(async (customer) => {
                try {

                    // console.log("data: ", data);
                    // console.log("customer: ", customer);

                    // CREATE ORDER
                    // createOrder(customer, data);
                    retrievedOrder = await newOrder(customer, data);
                    // console.log("RRetrieved order: ", retrievedOrder);
                } catch (err) {
                    // console.log(typeof createOrder);
                    console.log(err);
                }
            })
            .catch((err) => console.log(err.message));
    }

    res.status(200).end();
}