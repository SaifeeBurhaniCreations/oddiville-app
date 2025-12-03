import { useQuery } from '@tanstack/react-query';
import { getBottomSheetQueryOptions } from './queries/getBottomSheetQueryOptions';
import { BottomSheetSchemaKey } from '@/src/schemas/BottomSheetSchema';

const useBottomSheetData = (id: string, identifier: BottomSheetSchemaKey) => {
  const queryOptions = getBottomSheetQueryOptions(id, identifier);
  return useQuery(queryOptions);
};

export default useBottomSheetData;
