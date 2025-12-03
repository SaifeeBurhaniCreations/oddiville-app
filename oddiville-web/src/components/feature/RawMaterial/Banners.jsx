import { useEffect, useRef, useState } from "react";

const Banners = ({
  fetchBanners,
  getBanners,
  deleteBanners,
  setDeleteBanners,
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
        accept="image/png, image/jpeg"
        ref={bannerRef}
        onChange={(e) => updateBanner(e.target.files[0])}
        style={{ visibility: "hidden" }}
      />
      <div className="projects-banners-xs d-flex flex-row justify-content-start gap-3">
        {getBanners ? (
          <>
            <div className="mb-2 header">
              {/* <h5 className="m-0">Add Banner</h5> */}
              {banner?.preview ? (
                <button
                  type="button"
                  onClick={() => setBanner({ banner: null, preview: "" })}
                  className="btn btn-md bg-gradient-danger mt-2"
                >
                  <i className="fa fa-trash-alt"></i>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => bannerRef.current?.click()}
                  className="btn bg-gradient-success m-0"
                >
                  <i className="fa fa-pencil" aria-hidden="true"></i>
                </button>
              )}
            </div>
            <div
              className={`layout ${
                deleteBanners?.includes(getBanners?.key) ? "fade-cs" : ""
              }`}
            >
              {banner?.preview ? (
                <img src={banner.preview} alt="Preview" />
              ) : (
                <img src={getBanners?.url} alt="" />
              )}
            </div>
          </>
        ) : (
          <>
            <div className="mb-2 header d-flex gap-3">
              {/* <h5 className="m-0">Add Banner</h5> */}
              {banner?.preview ? (
                <button
                  type="button"
                  onClick={() => setBanner({ banner: null, preview: "" })}
                  className="btn btn-md bg-gradient-danger mt-2"
                >
                  <i className="fa fa-trash-alt"></i>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => bannerRef.current?.click()}
                    className="btn btn-default"
                  >
                    <i className="fa-solid fa-plus" /> Add Image
                  </button>
                </>
              )}
            <div className="layout">
              {banner.banner ? (
                <img src={banner.preview} alt="Preview" />
              ) : (
                <div style={{ fontSize: "10px", textAlign: "center" }}>
                  Image will appear here
                </div>
              )}
            </div>
            </div>
          </>
        )}
      </div>
      {/* </div> */}
      {/* </div> */}
    </>
  );
};

export default Banners;
