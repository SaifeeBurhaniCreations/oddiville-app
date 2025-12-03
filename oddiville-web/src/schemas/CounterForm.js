import * as Yup from 'yup'

export const validationSchema = Yup.object({
    YE : Yup.number().required('Years of Excellence is required'),
    SC : Yup.number().required('Satisfied Clients is required'),
    PD : Yup.number().required('Projects Delivered is required'),
    IR : Yup.number().required('Industry Recognitions is required'),
})
