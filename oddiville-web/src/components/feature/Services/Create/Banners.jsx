import { useEffect, useRef, useState } from "react";

import PreviewBannerModal from "./PreviewBannerModal";

const Banners = ({
  fetchBanners,
  getBanners,
  deleteBanners,
  setDeleteBanners,
  form,
}) => {
  const bannerRef = useRef();
  const [banner, setBanner] = useState({
    banner: null,
    preview: "",
  });

  // Update banner
  const updateBanner = (file) => {
    // Generate preview
    const reader = new FileReader();
    reader.onload = () => {
      setBanner({
        banner: file,
        preview: reader.result,
      });
      if (form?.setField) form.setField("sample_image", file);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetchBanners(banner.banner);
  }, [banner]);

  return (
    <>
      {/* <div className="card my-3"> */}
      {/* <div className="card-header pt-4 pb-2">
          <div className="flex-cs header">
            <h6>
              Add Banner
              <span data-tooltip="Preview">
                <button
                  className="cs-btn"
                  type="button"
                  data-bs-toggle="modal"
                  data-bs-target="#modal-banner"
                >
                  <i
                    className="fa-regular fa-lg fa-circle-info"
                    style={{ color: "#aaa" }}
                  />
                </button>
              </span>
            </h6>
          </div>
        </div> */}
      {/* <div className="card-body"> */}
      <input
        className="hide-me"
        type="file"
        ref={bannerRef}
        onChange={(e) => updateBanner(e.target.files[0])}
        style={{ visibility: "hidden" }}
      />
      {form.errors.sample_image && (
        <div className="projects-banners border border danger">
          {getBanners ? (
            <>
              <div className="mb-2 w-100 header">
                {/* <h5 className="m-0">Add Banner</h5> */}
                {banner?.preview ? (
                  <button
                    type="button"
                    onClick={() => setBanner({ banner: null, preview: "" })}
                    className="btn bg-gradient-danger mt-2"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => bannerRef.current?.click()}
                    className="btn bg-gradient-success m-0"
                  >
                    change
                  </button>
                )}
              </div>
              <div
                className={`layout ${
                  deleteBanners?.includes(getBanners?.s3Key) ? "fade-cs" : ""
                }`}
              >
                {banner?.preview ? (
                  <img src={banner.preview} alt="Preview" />
                ) : (
                  <img src={getBanners?.s3Url} alt="" />
                )}
              </div>
            </>
          ) : (
            <>
              <div className="mb-2 w-100 header">
                {/* <h5 className="m-0">Add Banner</h5> */}
                {banner?.preview && (
                  <button
                    type="button"
                    onClick={() => setBanner({ banner: null, preview: "" })}
                    className="btn bg-gradient-danger mt-2"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="layout">
                {banner.banner ? (
                  <img src={banner.preview} alt="Preview" />
                ) : (
                  <button
                    type="button"
                    onClick={() => bannerRef.current?.click()}
                    className="btn btn-default border border-danger"
                  >
                    <i className="fa-solid fa-plus" /> &nbsp; Upload Banner
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* </div> */}
      {/* </div> */}
      <PreviewBannerModal img={"/assets/img/banner.JPG"} />
    </>
  );
};

export default Banners;
