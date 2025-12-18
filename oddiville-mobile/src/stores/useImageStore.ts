import { create } from "zustand";

export type StoredImage = {
  uri: string;
  name: string;
  type: string;
};

type ImageStore = {
  packageImage: StoredImage | null;
  setPackageImage: (image: StoredImage | null) => void;
  clearPackageImage: () => void;
  image: StoredImage | null;
  setImage: (image: StoredImage | null) => void;
  clearImage: () => void;
  clearImages: () => void;
};

export const useImageStore = create<ImageStore>((set) => ({
  packageImage: null,
  setPackageImage: (image) => set({ packageImage: image }),
  clearPackageImage: () => set({ packageImage: null }),
  image: null,
  setImage: (image) => set({ image }),
  clearImage: () => set({ image: null }),
  clearImages: () => set({ packageImage: null, image: null }),
}));
