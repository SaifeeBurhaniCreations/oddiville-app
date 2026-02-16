import { Lane } from "../types/lanes.dto";
import { LaneDTO } from "../types/lanes.dto";

export function mapLane(dto: LaneDTO): Lane {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    productionId: dto.production_id,
    sampleImage: dto.sample_image,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
