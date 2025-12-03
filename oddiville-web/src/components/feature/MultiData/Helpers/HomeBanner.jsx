import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { create } from "@/services/HomeService";
import { useDispatch, useSelector } from "react-redux";
import { handlePostBanner } from "@/redux/AdminDataSlice";
import Spinner from "@/components/Spinner/Spinner";

const HomeBanner = () => {
  const dispatch = useDispatch();
  const bannerRef = useRef();
  const banner = useSelector((state) => state.AdminDataSlice.homeBanner);

  const [isLoading, setIsLoading] = useState(false);
  const [bannerData, setBannerData] = useState({
    banner: "",
    bannerImage: null,
    preview: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (banner) {
      setBannerData((prev) => ({
        ...prev,
        banner: banner.banner,
        preview: banner?.bannerImg?.s3Url || "",
      }));
    }
  }, [banner]);

  const updateBannerImage = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setBannerData((prev) => ({
        ...prev,
        bannerImage: file,
        preview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBannerData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!bannerData.banner.trim()) {
      newErrors.banner = "Main heading is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitData = async () => {
    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("banner", bannerData.banner);
      if (bannerData.bannerImage) {
        formData.append("bannerImg", bannerData.bannerImage);
      }

      const response = await create(formData);
      if (response.success) {
        toast.success("Banner Updated Successfully !!");
        dispatch(handlePostBanner(response.data));
      } else {
        toast.error(response.message || "Failed to update banner");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="card">
        <div className="card-header flex-cs header pt-4 pb-2">
          <h5>Home Banner</h5>
          <button
            className="btn btn-primary btn-md"
            onClick={submitData}
            type="submit"
            disabled={isLoading}
          >
            <i className="fa-solid fa-floppy-disk" /> &nbsp; Save{" "}
            {isLoading && <Spinner />}
          </button>
        </div>
        <div className="card-body pt-2">
          <div className="my-3">
            <input
              type="text"
              placeholder="Write Main Heading"
              name="banner"
              value={bannerData.banner}
              onChange={handleChange}
              className={`form-control ${errors.banner ? "is-invalid" : ""}`}
            />
            {errors.banner && (
              <div className="invalid-feedback">{errors.banner}</div>
            )}
          </div>
          <div className="my-3">
            <input
              className="hide-me"
              type="file"
              ref={bannerRef}
              onChange={(e) => updateBannerImage(e.target.files[0])}
              style={{ visibility: "hidden" }}
            />
            <div className="projects-banners">
              <div className="mb-2 flex-cs w-100 header">
                <h5 className="m-0">Add Banner Image</h5>
                {bannerData?.preview && (
                  <button
                    type="button"
                    onClick={() => bannerRef.current?.click()}
                    className="btn bg-gradient-success m-0"
                  >
                    Change
                  </button>
                )}
              </div>
              <div className="layout">
                {bannerData.preview ? (
                  <img src={bannerData.preview} alt="Banner Preview" />
                ) : (
                  <button
                    type="button"
                    onClick={() => bannerRef.current?.click()}
                    className="btn btn-default"
                  >
                    <i className="fa-solid fa-plus" /> &nbsp; Upload Banner
                    Image
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeBanner;
