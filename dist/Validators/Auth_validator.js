export const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
export const ValidatePassword = (password) => {
    return password.length >= 8;
};
export const Confirm_Password = (password, confirmPassword) => {
    return password === confirmPassword;
};
export const ValidateLogin = (email, password) => {
    return {
        email: validateEmail(email),
        Password: ValidatePassword(password),
    };
};
export const ValidateRegister = (email, Password, ConfirmPassword) => {
    return {
        email: validateEmail(email),
        Password: ValidatePassword(Password),
        ConfirmPassword: Confirm_Password(Password, ConfirmPassword),
    };
};
