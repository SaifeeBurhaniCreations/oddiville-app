import { useEffect, useState } from "react";
import {
  createRawMaterial,
  modifyRawMaterial,
} from "@/services/RawMaterialService";
import Spinner from "@/components/Spinner/Spinner";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { handleModifyData, handlePostData } from "@/redux/RawMaterialDataSlice";
import Banners from "./Banners";
import { useFormValidator } from "@/lib/custom_library/formValidator/useFormValidator";
import FormField from "@/lib/custom_library/formValidator/FormField";

const AddWorkLocation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const param = useParams();
  const { id } = param;

  const rmData = useSelector((state) => state.rm.data);

  const [isLoading, setIsLoading] = useState(false);
  const [banners, setBanners] = useState();
  const [fetchedBanners, setFetchedBanners] = useState();
  const [deleteBanners, setDeleteBanners] = useState();

  const { values, validateForm, errors, setField, setFields : setValues, resetForm } = useFormValidator(
    { name: "", sample_image: null },
    {
      name: [{ type: "required", message: "Name is required" }],
      sample_image: [],
    },
    { validateOnChange: true, debounce: 300 }
  );

  const handleSubmit = async () => {
    const result = validateForm();
    if (result.success) {
      const formPayload = new FormData();

      // Add basic fields
      formPayload.append("name", result.data.name);

      // Add sample_image_url if exists
      if (banners) {
        formPayload.append("sample_image", banners);
      }

      // Log the formPayload
      // const payloadObject = {};
      // formPayload.forEach((value, key) => {
      //   payloadObject[key] = value;
      // });

      // return

      setIsLoading(true);
      try {
        if (!id) {
          const response = await createRawMaterial(formPayload);
          if (response.status === 201) {
            resetForm();
            setBanners(null);
            dispatch(handlePostData(response.data));
            navigate("/raw-material");
            toast.success("raw material is Added !!");
          } else {
            toast.error("Failed to create raw material.");
          }
        } else {
          // Add deleteBanner flag if updating
          // if (deleteBanner) {
          //   formPayload.append("deleteBanner", "true");
          // }

          const response = await modifyRawMaterial({
            formData: formPayload,
            id,
          });
          if (response.status === 200) {
            dispatch(handleModifyData(response.data));
            navigate("/raw-material");
            toast.success("raw material is Updated !!");
          } else {
            toast.error("Failed to update raw material.");
          }
        }
      } catch (error) {
        toast.error("An error occurred while processing the raw material.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (id) {
      const data = rmData?.find((value) => value.id === id);
      setValues(data);
      setFetchedBanners(data?.sample_image);
    }
  }, [id]);

  const fetchBanners = (data) => {
    setBanners(data);
  };

  const handleExit = () => {
    setFetchedBanners(null);
    setValues({ name: "", sample_image: null });
    navigate("/raw-material");
  };

  return (
    <div className="col-md-6 offset-md-2">
      {/* <form> */}
<div className="card mx-auto" style={{ maxWidth: "600px" }}>
  <div className="card-header flex-cs gap-2 justify-content-between pt-4 pb-2 bg-light">
    <h5 className="mb-0">Manage Raw Materials</h5>
    {id && (
      <button
        type="button"
        className="btn btn-sm btn-secondary"
        onClick={handleExit}
      >
        Clear
      </button>
    )}
  </div>
  <div className="card-body p-4">
    <Banners
      name="Upload Image"
      getBanners={fetchedBanners}
      deleteBanners={deleteBanners}
      setDeleteBanners={setDeleteBanners}
      fetchBanners={fetchBanners}
    />
    <div className="grid-cs gtc-1 mt-2">
      <div>
        <FormField name="name" form={{ values, setField, errors }}>
          {({ value, error, onChange }) => (
            <div className="form-floating">
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`form-control ${error && "is-invalid"}`}
                name="name"
                placeholder="Item Name"
              />
              <label>Item Name</label>
              {error && (
                <small className="text-sm text-danger">{error}</small>
              )}
            </div>
          )}
        </FormField>
      </div>
    </div>
  </div>
  <div className="card-footer p-2 d-flex justify-content-end">
    <button
      type="button"
      onClick={handleSubmit}
      disabled={isLoading}
      className="btn btn-primary btn-md"
    >
      Save Item {isLoading && <Spinner />}
    </button>
  </div>
</div>

      {/* </form> */}
    </div>
  );
};

export default AddWorkLocation;
