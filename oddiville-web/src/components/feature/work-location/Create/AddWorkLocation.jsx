import useManageWorkLocation from "@/hooks/useManageWorkLocation";
import WorkLocationForm from "@/components/forms/WorkLocationForm";

const AddWorkLocation = () => {
  const {
    id,
    form,
    isLoading,
    fetchedBanners,
    deleteBanners,
    setDeleteBanners,
    fetchBanners,
    handleSubmit,
    handleExit,
  } = useManageWorkLocation();

  return (
    <div className="col-md-6 offset-md-2 col-sm-12 offset-sm-0">
      <WorkLocationForm
        id={id}
        form={form}
        isLoading={isLoading}
        fetchedBanners={fetchedBanners}
        deleteBanners={deleteBanners}
        setDeleteBanners={setDeleteBanners}
        fetchBanners={fetchBanners}
        handleSubmit={handleSubmit}
        handleExit={handleExit}
      />
    </div>
  );
};

export default AddWorkLocation;
