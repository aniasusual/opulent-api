const express = require("express");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middleware/error");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const app = express();
const path = require("path");



app.use(cookieParser());
// app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload())
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: "Backend/config/config.env" });
}

// Routes imports
const productRoute = require("./Routes/productRoute");
const userRoute = require("./Routes/userRoute");
const orderRoute = require("./Routes/orderRoute");
const paymentRoute = require("./Routes/paymentRoute");


app.use("/api/v1", productRoute)
app.use("/api/v1", userRoute);
app.use("/api/v1", orderRoute);
app.use("/api/v1", paymentRoute);

app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
});

app.use(errorMiddleware);

module.exports = app;