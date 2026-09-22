
export const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const ValidatePassword = (password: string): boolean => {
    return password.length >= 8;
}

export const Confirm_Password = (password: string,  confirmPassword: string): boolean => {
  return password === confirmPassword;
};


export const ValidateLogin = (email: string, password: string) => {
    return {
        email: validateEmail(email),
        Password: ValidatePassword(password),
    };
}

export const ValidateRegister = (email: string, Password: string, ConfirmPassword: string ) => {
    return{
        email:validateEmail(email),
        Password:ValidatePassword(Password),
        ConfirmPassword:Confirm_Password(Password,ConfirmPassword),
    }

   
}
