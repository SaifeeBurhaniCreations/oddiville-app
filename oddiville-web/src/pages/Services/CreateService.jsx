import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "@/components/Spinner/Spinner";
import Banners from "@/components/Banners/Banners";
import ItemFormFields from "@/components/forms/ItemFormFields";
import { initialValues, validationRules } from "@/schemas/ServiceSchema";
import useServiceForm from "@/hooks/useManageServiceItem";
import useChamberManagement from "../../hooks/useChamberManagement";
import { useEffect } from "react";

const CreateService = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { loadChambers } = useChamberManagement();

  const serviceData = useSelector((state) => state.ServiceDataSlice.data);
  const chambers = useSelector((state) => state.ServiceDataSlice.chamber) || [];

  const {
    form,
    isLoading,
    banners,
    fetchedBanners,
    deleteBanners,
    setBanners,
    setFetchedBanners,
    setDeleteBanners,
    handleSubmit,
    fetchBanners,
  } = useServiceForm({
    id,
    serviceData,
    dispatch,
    navigate,
    initialValues,
    validationRules,
    chambers,
  });

  useEffect(()=>{
    loadChambers();
  },[])

  return (
    <div className="container-fluid">
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6 offset-md-2 col-sm-12 offset-sm-0">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0">Manage Items</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <Banners
                    name="Upload Item"
                    getBanners={fetchedBanners}
                    deleteBanners={deleteBanners}
                    setDeleteBanners={setDeleteBanners}
                    fetchBanners={fetchBanners}
                    form={form}
                  />
                </div>
                <ItemFormFields form={form} chambers={chambers} />
              </div>
              <div className="card-footer d-flex justify-content-end gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/dry-warehouse")}
                  className="btn btn-secondary"
                >
                  Exit
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  Save {isLoading && <Spinner />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateService;
