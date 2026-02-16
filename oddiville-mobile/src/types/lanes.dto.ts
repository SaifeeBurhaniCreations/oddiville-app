export type MediaFile = {
  key: string;
  url: string;
};

export type Lane = {
  id: string;
  name: string;
  description: string | null;

  productionId: string | null;

  sampleImage: MediaFile | null;

  createdAt: string; 
  updatedAt: string; 
};

export type LaneDTO = {
  id: string;
  name: string;
  description: string | null;
  production_id: string | null;
  sample_image: {
    key: string;
    url: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};