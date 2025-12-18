import SimpleFileUpload from "../SimpleFileUpload";
import { useImageStore } from "@/src/stores/useImageStore";
import { FileUploadComponentProps } from "@/src/types";
import React from "react";

const FileUploadComponent = ({ data }: FileUploadComponentProps) => {
  const { title, uploadedTitle, label, key = "package-image" } = data;

  const {
    image,
    packageImage,
    setImage,
    setPackageImage,
  } = useImageStore();

  const isPackageImage = key === "package-image";

  const currentImage = isPackageImage ? packageImage : image;
  const setCurrentImage = isPackageImage ? setPackageImage : setImage;

  const fileState: [
    string | null,
    React.Dispatch<React.SetStateAction<string | null>>
  ] = [
    currentImage?.uri ?? null,
    (value) => {
      const uri =
        typeof value === "function" ? value(currentImage?.uri ?? null) : value;

      if (!uri) {
        setCurrentImage(null);
        return;
      }

      setCurrentImage({
        uri,
        name: "upload.jpg",
        type: "image/jpeg",
      });
    },
  ];

  return (
    <SimpleFileUpload title={title} uploadedChildren={uploadedTitle}
      fileState={fileState}>
      {label}
    </SimpleFileUpload>
  );
};

export default FileUploadComponent;