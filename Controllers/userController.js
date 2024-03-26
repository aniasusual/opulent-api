const userModel = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwtToken');
const { sendEmail } = require('../utils/sendEmail');
const crypto = require("crypto");
const cloudinary = require("cloudinary");

exports.registerUser = async function (req, res, next) {
    try {
        const avatarData = req.body.avatar;

        // Upload base64 encoded image data to Cloudinary
        const myCloud = await cloudinary.v2.uploader.upload(avatarData, {
            folder: "avatars",
            width: 150,
            crop: "scale",
        });

        const { name, email, password } = req.body;

        // Create user with avatar details
        const user = await userModel.create({
            name,
            email,
            password,
            avatar: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            }
        });

        // Send token on successful user creation
        sendToken(user, 201, res);

        if (!user) {
            // Handle user creation failure
            return next(new ErrorHandler("user creation failed", 500));
        }
    } catch (error) {
        console.log("User not created", error.message);
    }
};




exports.loginUser = async function (req, res, next) {

    try {

        const { email, password } = req.body;

        // checking if user has given password and email both

        if (!email || !password) {
            return next(new ErrorHandler("Please Enter Email & Password", 400));
        }

        const user = await userModel.findOne({ email }).select("+password");

        if (!user) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }

        const isPasswordMatched = await user.comparePassword(password);

        if (!isPasswordMatched) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }

        sendToken(user, 200, res);

    } catch (error) {
        console.log("user login failed", error.message);
    }
}

exports.logoutUser = (req, res) => {

    try {
        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
        });
        res.json({
            status: "success",
            message: "Logged out successfully"
        })

    } catch (error) {
        console.log("error occured: ", error);
    }
}

// forgot password
exports.forgotPassword = async function (req, res, next) {
    let user = await userModel.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorHandler("No user found!", 401));
    }

    // get reset password token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordURL = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
    // const resetPasswordURL = `${process.env.FRONTEND_URL}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordURL} \n\n If you have not requested this email then please ignore it`;

    try {

        await sendEmail({
            email: user.email,
            subject: `Opulent Password Recovery`,
            message
        });

        res.status(200).json({
            status: true,
            message: "Email sent successfully"
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 401))
    }

}

exports.resetPassword = async function (req, res, next) {
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await userModel.findOne({
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorHandler("Reset password token is invalid or has been expired", 401));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match!", 401));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
}

//Get user Details
exports.getUserDetails = async function (req, res, next) {
    try {
        const user = await userModel.findById(req.user.id);

        res.status(200).json({
            status: "success",
            message: "user found",
            user
        })

    } catch (error) {
        console.log("error in getUserDetails:", error);
    }
}

//Update user password
exports.updatePassword = async function (req, res, next) {
    try {
        const user = await userModel.findById(req.user.id).select("+password");

        const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

        if (!isPasswordMatched) {
            return next(new ErrorHandler("Invalid credentials", 401));
        }

        if (req.body.newPassword !== req.body.confirmPassword) {
            return next(new ErrorHandler("Password does not match", 401));
        }

        user.password = req.body.newPassword;

        user.save();

        sendToken(user, 200, res);

    } catch (error) {
        console.log("error occured: ", error);
    }
}


// update User Profile
exports.updateProfile = async (req, res, next) => {

    try {
        const newUserData = {
            name: req.body.name,
            email: req.body.email,
        };

        if (req.body.avatar !== "") {
            const user = await userModel.findById(req.user.id);

            const imageId = user.avatar.public_id;

            await cloudinary.v2.uploader.destroy(imageId);

            const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
                folder: "avatars",
                width: 150,
                crop: "scale",
            });

            newUserData.avatar = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }

        const user = await userModel.findByIdAndUpdate(req.user.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

        res.status(200).json({
            success: true,
        });

    } catch (error) {
        console.log("failed to update User details: ", error.message)
    }
};

// Admin function to check all the users in the website--------(ADMIN)
exports.getAllUsers = async function (req, res, next) {

    const users = await userModel.find();

    res.status(200).json({
        status: "success",
        users
    })

}

//Admin function to find a particular user--------(ADMIN)
exports.getUser = async function (req, res, next) {

    try {
        const user = await userModel.findById(req.params.id);
        if (!user) {
            return next(new ErrorHandler(`No user found with id ${req.params.id}`, 401));
        }

        res.status(200).json({
            status: "success",
            user
        })

    } catch (error) {
        console.log("error: ", error);
    }

}


//Update user role ----- ADMIN
exports.updateRole = async function (req, res, next) {
    try {
        const newData = {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role
        }

        const user = await userModel.findByIdAndUpdate(req.params.id, newData, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        if (!user) {
            return next(new ErrorHandler("No user found!", 401));
        }

        res.status(200).json({
            status: "success",
            message: "profile updated",
            user

        });

    } catch (error) {
        console.log("error occured: ", error);
    }
}

//Delete user profile ------ ADMIN
exports.deleteUser = async function (req, res, next) {
    try {

        const user = await userModel.findByIdAndDelete(req.params.id);

        if (!user) {
            return next(new ErrorHandler(`No user exist with id ${req.params.id}`, 401));
        }

        // await user.remove();
        // await cloudinary.v2.uploader.destroy(imageId);

        // await user.remove();

        res.status(200).json({
            status: "success",
            message: "Profile Deleted"
        });

    } catch (error) {
        console.log("error occured: ", error);
    }
}


