import { body } from "express-validator" //here body is where the data is coming from

const registerValidator = () => {
    return [
        body("email")
            .trim()
            .isEmpty()
            .withMessage("email Can't be Empty")
            .isEmail()
            .withMessage("email Format is Not Correct"),
        body("username")
            .trim()
            .isEmpty()
            .withMessage("username Can't be Empty")
            .isLength({ min: 3 })
            .withMessage("username must have 3 characters"),
        body("fullName")
            .trim()
            .isEmpty()
            .withMessage("fullName Can't be Empty"),
        body("password")
            .trim()
            .isEmpty()
            .withMessage("password Can't be Empty")
    ]
}

export { registerValidator }