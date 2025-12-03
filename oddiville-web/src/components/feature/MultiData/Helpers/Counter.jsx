import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { create } from "@/services/CounterService";
import { useFormik } from "formik";
import { validationSchema } from "@/schemas/CounterForm";
import { useDispatch, useSelector } from "react-redux";
import { handlePostCounter } from "@/redux/AdminDataSlice";
import Spinner from "@/components/Spinner/Spinner";

const Counter = () => {


    const [isLoading, setIsLoading] = useState(false)

    const dispatch = useDispatch()

    const counter = useSelector((state) => state.AdminDataSlice.counter)

    const form = useFormik({
        initialValues : {
            YE : '',    
            SC : '',
            PD : '',
            IR : '',
        },
        validationSchema,
        onSubmit : async(formData) => {
            setIsLoading(true)
            const response = await create(formData)
            if(response.success) {
                setIsLoading(false)
                toast.success('Counter Updated Successfully !!')
                dispatch(handlePostCounter(formData))
            }
        }
    })

    useEffect(() => {
        if (counter) {
            const fields = ['IR', 'PD', 'SC', 'YE'];
            fields.forEach((field) => form.setFieldValue(field, counter[field] || ''));
        }
    }, [counter]);



  return (
    <>
        <div className="card">
            <form onSubmit={form.handleSubmit}>
                <div className="card-header flex-cs header pt-4 pb-2">
                    <h5>Counter</h5>
                    <button type="submit" className="btn btn-primary btn-md" disabled={isLoading}>
                        <i className="fa-solid fa-floppy-disk" /> &nbsp; Save {isLoading && <Spinner />}
                    </button>
                </div>

                <div className="card-body pt-2">
                    <div className="grid-cs">
                        <div className="my-3">
                            <label className='lead' htmlFor="YE">Years of Excellence</label>
                            <input type="number" onChange={form.handleChange} onBlur={form.handleBlur} value={form.values.YE} className={`form-control ${form.errors.YE && form.touched.YE ? 'is-invalid' : ''}`} placeholder='Years of Excellence' name="YE" id="YE" />
                        </div>
                        <div className="my-3">
                            <label className='lead' htmlFor="SC">Satisfied Clients</label>
                            <input type="number" onChange={form.handleChange} onBlur={form.handleBlur} value={form.values.SC} className={`form-control ${form.errors.SC && form.touched.SC ? 'is-invalid' : ''}`} placeholder='Satisfied Clients' name="SC" id="SC" />
                        </div>
                        <div className="my-3">
                            <label className='lead' htmlFor="PD">Projects Delivered</label>
                            <input type="number" onChange={form.handleChange} onBlur={form.handleBlur} value={form.values.PD} className={`form-control ${form.errors.PD && form.touched.PD ? 'is-invalid' : ''}`} placeholder='Projects Delivered' name="PD" id="PD" />
                        </div>
                        <div className="my-3">
                            <label className='lead' htmlFor="IR">Industry Recognitions</label>
                            <input type="number" onChange={form.handleChange} onBlur={form.handleBlur} value={form.values.IR} className={`form-control ${form.errors.IR && form.touched.IR ? 'is-invalid' : ''}`} placeholder='Industry Recognitions' name="IR" id="IR" />
                        </div>
                    </div>
                </div>
            </form>

        </div>
    </>
  )
}

export default Counter