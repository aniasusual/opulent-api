const productModel = require('../models/productModel.js');
const ApiFeatures = require('../utils/apifeatures.js')
const ErrorHandler = require('../utils/errorHandler.js');
const cloudinary = require("cloudinary");

exports.getAllProducts = async (req, res, next) => {
    try {

        const resultPerPage = 4;
        const productsCount = await productModel.countDocuments();
        const apiFeature = new ApiFeatures(productModel.find(), req.query).search().filter().pagination(resultPerPage);

        const products = await apiFeature.query;
        // const books = await productModel.find();

        if (products.length != 0) {
            res.json({
                status: "success",
                products,
                productsCount,
                resultPerPage
            })
        }

        else {
            // res.json({
            //     status: "fail",
            //     message: "No product found!"
            // })
            return next(new ErrorHandler("No product found!", 500));
        }
    } catch (error) {
        console.log(error);
    }
}

// Get All Product (Admin)
exports.getAdminProducts = async (req, res, next) => {

    try {
        const products = await productModel.find();
        const productsCount = await productModel.countDocuments();

        res.status(200).json({
            success: true,
            products,
            productsCount,
        });

    } catch (error) {
        console.log("Error in getting Admin products in product Controller: ", error.message);
    }


};

// Create Product -- Admin
exports.createProduct = async (req, res, next) => {

    try {
        let images = [];

        if (typeof req.body.images === "string") {
            images.push(req.body.images);
        } else {
            images = req.body.images;
        }

        const imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "products",
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }

        req.body.images = imagesLinks;
        req.body.user = req.user.id;

        const product = await productModel.create(req.body);

        res.status(201).json({
            success: true,
            product,
        });

    } catch (error) {
        console.log("Error a creating product in productController: ", error.message);
    }


}

// Update Product -- Admin

exports.updateProduct = async (req, res, next) => {

    try {
        let product = await productModel.findById(req.params.id);

        if (!product) {
            return next(new ErrorHandler("Product not found", 404));
        }

        // Images Start Here
        let images = [];

        if (typeof req.body.images === "string") {
            images.push(req.body.images);
        } else {
            images = req.body.images;
        }

        if (images !== undefined) {
            // Deleting Images From Cloudinary
            for (let i = 0; i < product.images.length; i++) {
                await cloudinary.v2.uploader.destroy(product.images[i].public_id);
            }

            const imagesLinks = [];

            for (let i = 0; i < images.length; i++) {
                const result = await cloudinary.v2.uploader.upload(images[i], {
                    folder: "products",
                });

                imagesLinks.push({
                    public_id: result.public_id,
                    url: result.secure_url,
                });
            }

            req.body.images = imagesLinks;
        }

        product = await productModel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

        res.status(200).json({
            success: true,
            product,
        });

    } catch (error) {
        return next(new ErrorHandler("Product not updated ", 404));
    }
};

// // Delete Product
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await productModel.findById(req.params.id);

        if (!product) {
            return next(new ErrorHandler("Product not found", 404));
        }

        // Deleting Images From Cloudinary
        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }

        // Use deleteOne method to delete the product document
        await productModel.deleteOne({ _id: req.params.id });

        res.status(200).json({
            success: true,
            message: "Product Delete Successfully",
        });

    } catch (error) {
        return next(new ErrorHandler("Product not deleted", 404));
    }
};



// Get Product Details
exports.getProductDetails = async (req, res, next) => {

    try {
        const product = await productModel.findById(req.params.id);

        if (!product) {
            return next(new ErrorHandler("Product not found", 404));
        }

        res.status(200).json({
            success: true,
            product,
        });
    } catch (error) {
        return next(new ErrorHandler("Product not found", 404));
    }


};

// // Create product-----ADMIN
exports.addProduct = async (req, res) => {
    try {

        req.body.user = req.user.id;

        let dataObj = req.body;
        let user = await productModel.create(dataObj);

        if (user) {
            res.json({
                status: "success",
                message: "productModel added successfully"
            })
        }

    } catch (error) {
        console.log("failed to add product! try with new product details ", error);
    }


}





exports.getById = async function (req, res, next) {

    try {
        const id = req.params.id;
        console.log(id);

        let product = await productModel.findOne({ _id: id });
        console.log(product);
        if (product) {
            res.json({
                status: "success",
                product
            })
        }

        else {
            // res.json({
            //     status: "fail",
            //     message: "product not found"
            // })
            return next(new ErrorHandler("No product found!", 500));
        }
    } catch (error) {
        console.log(error)
    }
}


// UPDATE product-----ADMIN
exports.updateById = async function (req, res, next) {
    try {
        const id = req.params.id;
        let updatedProduct = await productModel.findOneAndUpdate(
            { id: id },
            req.body,
            { new: true }
        );
        if (updatedProduct) {
            res.status(200).json(updatedProduct);
        } else {
            // res.status(500).json({ error: 'productModel not found'});
            return next(new ErrorHandler("No product found!", 500));
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

}

// DELETE product------ADMIN
exports.deleteById = async function (req, res, next) {
    try {
        const id = req.params.id;
        const deletedProduct = await productModel.findOneAndDelete({ id: id });
        if (deletedProduct) {
            res.status(200).json({
                status: "success",
                message: "productModel Deleted Successfully",
                deletedProduct
            });
        } else {
            //   res.status(500).json({ error: 'productModel not found' });
            return next(new ErrorHandler("No product found!", 500));
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//Create or update a review
exports.createProductReview = async function (req, res, next) {

    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await productModel.findById(productId);

    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (isReviewed) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString())
                (rev.rating = rating); (rev.comment = comment);
        });
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;

    product.reviews.forEach((rev) => {
        avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
    });
}

//Get all Reviews
exports.getAllReviews = async function (req, res, next) {
    const product = await productModel.findById(req.query.id);

    if (!product) {
        return next(new ErrorHandler("productModel not found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
}

exports.deleteReview = async function (req, res, next) {
    try {
        const product = await productModel.findById(req.query.productId);


        if (!product) {
            return next(new ErrorHandler("Product not found", 404));
        }

        const reviews = product.reviews.filter(
            (rev) => rev._id.toString() !== req.query.id.toString()
        );

        let avg = 0;

        reviews.forEach((rev) => {
            avg += rev.rating;
        });

        let ratings = 0;

        if (reviews.length === 0) {
            ratings = 0;
        } else {
            ratings = avg / reviews.length;
        }

        const numOfReviews = reviews.length;

        await productModel.findByIdAndUpdate(
            req.query.productId,
            {
                reviews,
                ratings,
                numOfReviews,
            },
            {
                new: true,
                runValidators: true,
                useFindAndModify: false,
            }
        );

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        console.log("product not deleted due to following error: ", error);
    }
}
