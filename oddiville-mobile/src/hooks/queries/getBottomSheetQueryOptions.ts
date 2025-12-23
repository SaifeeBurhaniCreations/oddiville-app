import {
  bottomSheetSchemas,
  type BottomSheetSchemaKey,
} from '@/src/schemas/BottomSheetSchema';
import { getBottomSheetData } from '@/src/services/bottomsheet.service';
import { customTimeAgo } from '@/src/utils/dateUtils';
import { queryOptions, type UseQueryOptions } from '@tanstack/react-query';
import { z } from 'zod';

function isHeaderSection(section: any): section is { type: 'header'; data: any } {
  return section?.type === 'header' && typeof section?.data === 'object';
}

export const getBottomSheetQueryOptions = <T extends BottomSheetSchemaKey>(
  id: string,
  type: T
) =>
  queryOptions({
    queryKey: ['bottomsheet', id, type],
    queryFn: async () => {
      const response = await getBottomSheetData(id, type);
      
      if (response.status !== 200) throw new Error('Failed to fetch');

      const schemaParser = bottomSheetSchemas[type];
      const schema = schemaParser.parse(response.data);

      if ('sections' in schema) {
        schema.sections = schema.sections.map((section: any) => {
                    
          if (isHeaderSection(section)) {
            if (!section.data?.value) return section;

            const createdAt = new Date(section.data.value);

            return {
              ...section,
              data: {
                ...section.data,
                value: customTimeAgo(createdAt),
              },
            };
          }

          return section;
        });
      }

      return schema;
    },
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // @ts-ignore
  }) satisfies UseQueryOptions<
    z.infer<(typeof bottomSheetSchemas)[T]>, 
    Error,
    z.infer<(typeof bottomSheetSchemas)[T]>,
    [string, string, BottomSheetSchemaKey]
  >;
