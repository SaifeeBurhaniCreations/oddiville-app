import { useRef, useState } from "react";
const ExcelUploader = ({
    name = 'Upload Excel File',
    children,
    label,
    disabled,
    onFileChange,
}) => {
    const fileRef = useRef();
    const [file, setFile] = useState(null);

    const updateFile = (file) => {
        const validTypes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        if (!file || !validTypes.includes(file.type)) {
            alert('Please select a valid Excel file (.xls or .xlsx).');
            return;
        }
        setFile(file);
        if (onFileChange) {
            onFileChange({ target: { files: [file] } });
        }
    };

    const labelText = children ? children : label ? label : "Excel sheet"; 

    return (
        <div className="projects-banners">
            <div className="mb-2 w-100 header">{labelText}</div>
            <div className="layout">
                {file && (
                    <button
                        type="button"
                        className="btn bg-gradient-danger remove-btn-cs mt-2"
                        onClick={() => {
                            setFile(null);
                            if (fileRef.current) fileRef.current.value = "";
                        }}
                    >
                        Remove
                    </button>
                )}
                {!file ? (
                    <button
                        type="button"
                        className="btn btn-default"
                        onClick={() => fileRef.current?.click()}
                        disabled={disabled}
                    >
                        <i className="fa-solid fa-plus" /> &nbsp; {name}
                    </button>
                ) : (
                    <span>{file.name}</span>
                )}
                <input
                    type="file"
                    style={{ display: "none" }}
                    ref={fileRef}
                    accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={(e) => updateFile(e.target.files[0])}
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

export default ExcelUploader;
