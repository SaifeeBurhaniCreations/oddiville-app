import { useEffect, useRef, useState } from "react";

const Banners = ({
  fetchBanners,
  getBanners,
  deleteBanners,
  setDeleteBanners,
  name = "Upload Banner",
  onFileChange,
  form,
}) => {
  const bannerRef = useRef();
  const [banner, setBanner] = useState({ banner: null, preview: "" });
  const [typeCheckError, setTypeCheckError] = useState("");

  useEffect(() => {
  if (!getBanners) return;

  setBanner({
    banner: null,
    preview: typeof getBanners === "string" ? getBanners : getBanners?.url
  });
}, [getBanners]);

  useEffect(() => {
    fetchBanners?.(banner.banner);
  }, [banner.banner]);


 const updateBanner = (file) => {
  if (!file) return;

  const validTypes = ["image/png", "image/jpeg"];
  if (!validTypes.includes(file.type)) {
    setBanner({ banner: null, preview: "" });
    setTypeCheckError("Only PNG or JPG images are allowed");
    return;
  }

  setTypeCheckError("");

  const reader = new FileReader();
  reader.onload = () => {
    setBanner({ banner: file, preview: reader.result });

    onFileChange?.(file);
  };
  reader.readAsDataURL(file);
};
  return (
    <>
      <input
        className="d-none"
        type="file"
        accept="image/png, image/jpeg"
        ref={bannerRef}
        onChange={(e) => {
          const file = bannerRef.current.files[0];
          updateBanner(file);
        }}
      />

      <div className="card shadow-sm my-3">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="m-0">{name}</h6>
          {form?.errors.sample_image && (
            <span className="text-danger small">
              {form.errors.sample_image}
            </span>
          )}
          {typeCheckError && (
            <span className="text-danger small">{typeCheckError}</span>
          )}
        </div>

        <div className="card-body text-center">
          {getBanners ? (
            <div
              className={`position-relative d-inline-block ${
                // deleteBanners?.includes(getBanners?.key) ? "opacity-50" : ""
                deleteBanners ? "opacity-50" : ""
              }`}
            >
              <div className="mb-2">
                {banner?.preview ? (
                  <button
                    type="button"
                    onClick={() => setBanner({ banner: null, preview: "" })}
                    className="btn btn-sm btn-outline-danger"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => bannerRef.current?.click()}
                    className="btn btn-sm btn-outline-primary"
                  >
                    Change
                  </button>
                )}
              </div>

              <img
                src={banner?.preview || "/assets/img/png/fallback_img.png"}
                alt="Preview"
                className="img-fluid rounded shadow-sm"
                style={{ maxHeight: "200px", objectFit: "cover" }}
              />
            </div>
          ) : (
            <div className="p-4 border rounded bg-light">
              {banner?.preview ? (
                <>
                  <div className="mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setBanner({ banner: null, preview: "" });
onFileChange?.(null);
                      }
}
                      className="btn btn-sm btn-outline-danger"
                    >
                      Remove
                    </button>
                  </div>
                  <img
                    src={banner.preview}
                    alt="Preview"
                    className="img-fluid rounded shadow-sm"
                    style={{ maxHeight: "200px", objectFit: "cover" }}
                  />
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => bannerRef.current?.click()}
                  className="btn btn-outline-secondary"
                >
                  <i className="fa-solid fa-plus"></i> &nbsp; {name}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Banners;
