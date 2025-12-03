import * as Yup from 'yup'  // For validation

const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    userpass: Yup.string().required('Password is required')
})

export { validationSchema }