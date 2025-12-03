import { useRef, useState, useEffect } from "react";

const ImageUploader = ({
    name = "Upload Image",
    multiple = false,
    value,
    children,
    label,
    className,
    noLabel,
    disabled,
    onChange,
}) => {
    const fileRef = useRef();
    const [internalImages, setInternalImages] = useState([]);
    const images = value !== undefined ? value : internalImages;

    const makePreviewObj = (file) =>
        new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ file, preview: reader.result });
            reader.onerror = () => resolve({ file, preview: undefined });
            reader.readAsDataURL(file);
        });

    const handleSelect = async (e) => {
        const files = Array.from(e.target.files || []);
        const newPreviews = await Promise.all(files.map(makePreviewObj));
        const updated = multiple ? [...images, ...newPreviews] : newPreviews;
        if (value === undefined) setInternalImages(updated);
        if (onChange) onChange(updated);
        if (fileRef.current) fileRef.current.value = "";
    };

    const handleRemove = (idx) => {
        const updated = images.filter((_, i) => i !== idx);
        if (value === undefined) setInternalImages(updated);
        if (onChange) onChange(updated);
    };

    useEffect(() => {
        if (value === undefined || !Array.isArray(value)) return;
        const isPopulated = !!value.find((img) => img && typeof img === "object" && img.preview);
        if (isPopulated) return;
        const loadAll = async () => {
            const arr = await Promise.all(
                value.map(async (val) => {
                    if (typeof val === "string" && val.startsWith("http"))
                        return { file: null, preview: val };
                    if (val instanceof File) return await makePreviewObj(val);
                    return val;
                })
            );
            setInternalImages(arr);
        };
        loadAll();
        // eslint-disable-next-line
    }, [value]);

    const labelText = noLabel ? null : children ? children : label ? label : "Challan";

    return (
        <div className={`d-flex flex-column ${className}`}>
            <p className="header mb-0">{labelText}</p>
            <div>
                <input
                    className="hide-me"
                    type="file"
                    ref={fileRef}
                    onChange={handleSelect}
                    multiple={multiple}
                    accept="image/*"
                    style={{ visibility: "hidden" }}
                    disabled={disabled}
                />
                <div className="projects-banners">
                    <div className="mb-2 w-100 header"></div>
                    <div className="layout">
                        {images?.length ? (
                            images.map((img, i) => (
                                <div
                                    key={i}
                                    style={{
                                        position: "relative",
                                        width: "100%",
                                        height: "100%",
                                        borderRadius: 12,
                                        background: `url(${img.preview || (typeof img === "string" ? img : undefined)}) center center / cover no-repeat`,
                                        margin: "0 8px 8px 0",
                                        overflow: "hidden",
                                        display: "inline-block"
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(i)}
                                        className="btn bg-gradient-danger remove-btn-cs mt-2"
                                        style={{
                                            position: "absolute",
                                            top: 10,
                                            left: 10,
                                            zIndex: 2,
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="btn btn-default"
                                disabled={disabled}
                            >
                                <i className="fa-solid fa-plus" /> &nbsp; {name}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageUploader;