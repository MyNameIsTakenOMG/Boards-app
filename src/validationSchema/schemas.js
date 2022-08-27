import joi from 'joi';

const resetSchema = joi.object({
    rs_email:joi.string().email({tlds:{allow:false}}).messages({
        'string.empty':'email address should not be empty',  
        'string.email':'email address is not valid'
    })
})
const signinSchema = joi.object({
    si_email:joi.string().email({tlds:{allow:false}}).messages({
        'string.empty':'email address should not be empty', 
        'string.email':'email address is not valid'
    }),
    si_password:joi.string().replace(/\/s/g,'').alphanum().min(7).messages({
        'string.empty':'password should not be empty', 
        'string.min':'password length must be at least 7',
        'string.alphanum':'password can only contain alphanumeric characters'
    })
})
const signupSchema = joi.object({
    su_username: joi.string().trim().messages({
        'string.empty':'username should not be empty', 
    }),
    su_email:joi.string().email({tlds:{allow:false}}).messages({
        'string.empty':'email address should not be empty', 
        'string.email':'email address is not valid'
    }),
    su_password:joi.string().replace(/\/s/g,'').alphanum().min(7).messages({
        'string.empty':'password should not be empty', 
        'string.min':'password length must be at least 7',
        'string.alphanum':'password can only contain alphanumeric characters'
    }),
    su_confirm_password:joi.string().valid(joi.ref('su_password')).messages({
        'any.only':'password mismatched'
    })
})

export {resetSchema, signinSchema, signupSchema}