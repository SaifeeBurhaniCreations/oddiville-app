import useManageLane from "@/hooks/useManageLane";
import LaneForm from "@/components/forms/LaneForm";

const AddLane = () => {
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
  } = useManageLane();

  return (
    <div className="col-md-6 offset-md-2">
      <LaneForm
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

export default AddLane;
