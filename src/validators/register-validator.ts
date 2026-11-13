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
    firstName: {
        trim: true,
        notEmpty: {
            errorMessage: "First name is required",
        },
        isLength: {
            options: { min: 2, max: 50 },
            errorMessage: "First name must be between 2 and 50 characters",
        },
    },
    lastName: {
        trim: true,
        notEmpty: {
            errorMessage: "Last name is required",
        },
        isLength: {
            options: { min: 2, max: 50 },
            errorMessage: "Last name must be between 2 and 50 characters",
        },
    },
    password: {
        notEmpty: {
            errorMessage: "Password is required",
        },
        isLength: {
            options: { min: 8, max: 128 },
            errorMessage: "Password must be between 8 and 128 characters",
        },
    },
});

// export default [body("email").notEmpty(), body("firstName").notEmpty()];
