import { checkSchema } from "express-validator";

export default checkSchema({
    email: {
        trim: true,
        notEmpty: {
            errorMessage: "Email is required",
        },
        isEmail: {
            errorMessage: "Please provide a valid email address",
        },
    },
    password: {
        notEmpty: {
            errorMessage: "Password is required",
        },
    },
});
