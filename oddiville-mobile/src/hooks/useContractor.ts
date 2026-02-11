import { useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createContractor, fetchContractors, fetchContractorById } from '@/src/services/contractor.service';
import { rejectEmptyOrNull } from '../utils/authUtils';

// --- Interfaces ---
export type WorkLocation = {
  name: string
  maleCount: number
  femaleCount: number
}

interface ContractorData {
    id: string;
    name: string;
    male_count: number;
    female_count: number;
    work_location: WorkLocation[];
    createdAt: string;
    updatedAt: string;
    displayMaleCount?: string;
    displayFemaleCount?: string;
    displayTotalCount?: string;
}

interface CreateContractorPayload {
    contractors: Array<{
        name: string;
        male_count: number;
        female_count: number;
        work_location: WorkLocation[];
    }>;
}

interface CreateContractorResponse {
    success?: boolean;
    message: string;
    data: ContractorData[];
    summary: {
        contractors_created: number;
        total_workers: number;
        male_workers: number;
        female_workers: number;
        total_locations: number;
    };
    timestamp: string;
}

interface SelectedContractor {
    id: string;
    name: string;
}

// --- Return Types ---
interface FormattedWorkLocation {
    name: string;
    maleCount: number;
    femaleCount: number;
    totalCount: number;
    displayCount: string;
}

export interface FormattedContractor {
    id: string;
    name: string;
    maleCount: number;
    femaleCount: number;
    totalCount: number;
    workLocations: FormattedWorkLocation[];
    displayMaleCount: string;
    displayFemaleCount: string;
    displayTotalCount: string;
    createdAt: string;
    updatedAt: string;
}

interface ContractorSummary {
    totalContractors: number;
    totalMaleWorkers: number;
    totalFemaleWorkers: number;
    totalWorkers: number;
    averageWorkersPerContractor: number;
    contractorsWithMultipleLocations: number;
}

type RawContractorPayload = Array<{
    name: string;
    male_count: number;
    female_count: number;
    work_location: WorkLocation[] | any[];
  }>;
  
const contractorQueryKeys = {
    all: ['contractors'] as const,
    lists: () => [...contractorQueryKeys.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...contractorQueryKeys.lists(), { filters }] as const,
    details: () => [...contractorQueryKeys.all, 'detail'] as const,
    detail: (id: string) => [...contractorQueryKeys.details(), id] as const,
};

export function useContractors() {
    const { data: contractorData = [], isLoading, error, refetch } = useQuery({
        queryKey: contractorQueryKeys.lists(),
        queryFn: rejectEmptyOrNull(async () => {
            const response = await fetchContractors();
            return response.data as ContractorData[];
        }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount, error: any) => {
            if (failureCount < 3 && (!error.response || error.response.status >= 500)) {
                return true;
            }
            return false;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    return {
        data: contractorData,
        isLoading,
        error,
        refetch,
    };
}

// --- Hook for Single Contractor ---
export function useContractorById(id: string) {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: contractorQueryKeys.detail(id),
        queryFn: rejectEmptyOrNull(async () => {
            const response = await fetchContractorById(id);
            return response.data as ContractorData;
        }),
        enabled: !!id && id !== 'undefined' && id !== 'null',
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error: any) => {
            if (failureCount < 2 && (!error.response || error.response.status >= 500)) {
                return true;
            }
            return false;
        },
    });

    return {
        data,
        isLoading,
        error,
        refetch,
    };
}

export function useCreateContractor() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: RawContractorPayload): Promise<CreateContractorResponse> => {
      const response = await createContractor(payload);
      return response.data as CreateContractorResponse;
    },
    onSuccess: (data, variables) => {
      const createdRows = data.data || [];

      queryClient.setQueryData<any[]>(
        contractorQueryKeys.lists(),
        (oldData = []) => {
          return [...oldData, ...createdRows].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
      );

      createdRows.forEach((contractor: any) => {
        queryClient.setQueryData(
          contractorQueryKeys.detail(contractor.id),
          contractor
        );
      });

      queryClient.invalidateQueries({
        queryKey: contractorQueryKeys.all,
        exact: false,
      });
    },
    onError: (error: any) => {
      console.error('Failed to create contractors:', error);
      queryClient.invalidateQueries({ queryKey: contractorQueryKeys.lists() });
    },
    retry: (failureCount, error: any) => {
      if (error?.response && error.response.status >= 400 && error.response.status < 500) return false;
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const createContractors = useCallback(
    async (contractorData: RawContractorPayload) => {
      if (!Array.isArray(contractorData) || contractorData.length === 0) {
        throw new Error('Invalid contractor data provided');
      }

      const validatedContractors = contractorData.map(c => ({
        name: (c.name ?? '').trim(),
        male_count: Math.max(0, parseInt(String(c.male_count || 0)) || 0),
        female_count: Math.max(0, parseInt(String(c.female_count || 0)) || 0),
        work_location: Array.isArray(c.work_location) ? c.work_location : [],
      }));

      const invalids = validatedContractors.filter(v => !v.name);
      if (invalids.length) throw new Error('All contractors must have valid names');

      const zeroWorkers = validatedContractors.filter(v => (v.male_count + v.female_count) === 0);
      if (zeroWorkers.length) throw new Error('All contractors must have at least one worker');
      const result = await mutation.mutateAsync(validatedContractors);
      return result;
    },
    [mutation]
  );

  return {
    createContractors,
    isLoading: mutation.status === 'pending',
    isSuccess: mutation.status === 'success',
    isError: mutation.status === 'error',
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

// --- Hook for Formatted Contractors ---
export function useFormattedContractors() {
    const { data: contractorData = [], isLoading, error, refetch } = useContractors();
    
    const formattedContractors: FormattedContractor[] = useMemo(() => {
        if (!contractorData?.length) return [];

        return contractorData.reverse().map((contractor): FormattedContractor => {
            const totalCount = contractor.male_count + contractor.female_count;
            
const formattedWorkLocations: FormattedWorkLocation[] =
  contractor.work_location?.map((location) => {
    const male = Number(location.maleCount || 0)
    const female = Number(location.femaleCount || 0)
    const total = male + female

    return {
      name: location.name || 'Unknown Location',
      maleCount: male,
      femaleCount: female,
      totalCount: total,
      displayCount: `${male} Male / ${female} Female`,
    }
  }) || [];


            return {
                id: contractor.id,
                name: contractor.name || 'Unknown Contractor',
                maleCount: contractor.male_count || 0,
                femaleCount: contractor.female_count || 0,
                totalCount,
                workLocations: formattedWorkLocations,
                displayMaleCount: `${contractor.male_count || 0}`,
                displayFemaleCount: `${contractor.female_count || 0}`,
                displayTotalCount: `${totalCount}`,
                createdAt: contractor.createdAt,
                updatedAt: contractor.updatedAt,
            };
        });
    }, [contractorData]);

    return {
        contractors: formattedContractors,
        isLoading,
        error,
        refetch,
    };
}

// --- Hook for Contractor Summary/Statistics ---
export function useContractorSummary(): ContractorSummary & { isLoading: boolean; refetch: () => void } {
    const { data: contractorData = [], isLoading, refetch } = useContractors();

    const summary = useMemo((): ContractorSummary => {
        if (!contractorData?.length) {
            return {
                totalContractors: 0,
                totalMaleWorkers: 0,
                totalFemaleWorkers: 0,
                totalWorkers: 0,
                averageWorkersPerContractor: 0,
                contractorsWithMultipleLocations: 0,
            };
        }

        const totalMaleWorkers = contractorData.reduce((sum, c) => sum + (c.male_count || 0), 0);
        const totalFemaleWorkers = contractorData.reduce((sum, c) => sum + (c.female_count || 0), 0);
        const totalWorkers = totalMaleWorkers + totalFemaleWorkers;
        const contractorsWithMultipleLocations = contractorData.filter(
            c => c.work_location && c.work_location?.length > 1
        )?.length;

        return {
            totalContractors: contractorData?.length,
            totalMaleWorkers,
            totalFemaleWorkers,
            totalWorkers,
            averageWorkersPerContractor: contractorData?.length > 0
                ? Math.round((totalWorkers / contractorData?.length) * 100) / 100 
                : 0,
            contractorsWithMultipleLocations,
        };
    }, [contractorData]);

    return {
        ...summary,
        isLoading,
        refetch,
    };
}

// --- Hook for Contractors by Work Location ---
export function useContractorsByLocation() {
    const { data: contractorData = [], isLoading, refetch } = useContractors();

    const contractorsByLocation = useMemo(() => {
        if (!contractorData?.length) return new Map();

        const locationMap = new Map<string, FormattedContractor[]>();

        contractorData.forEach((contractor) => {
            const totalCount = contractor.male_count + contractor.female_count;
            
            const formattedContractor: FormattedContractor = {
                id: contractor.id,
                name: contractor.name,
                maleCount: contractor.male_count,
                femaleCount: contractor.female_count,
                totalCount,
                workLocations:
                contractor.work_location?.map((location) => {
                   const male = Number(location.maleCount || 0)
                    const female = Number(location.femaleCount || 0)
                    const total = male + female


                    return {
                    name: location.name || 'Unknown Location',
                    maleCount: male,
                    femaleCount: female,
                    totalCount: total,
                    displayCount: `${male} Male / ${female} Female`,
                    }
                }) || [],
                displayMaleCount: `${contractor.male_count}`,
                displayFemaleCount: `${contractor.female_count}`,
                displayTotalCount: `${totalCount}`,
                createdAt: contractor.createdAt,
                updatedAt: contractor.updatedAt,
            };

            // Handle contractors with no work locations
            if (!contractor.work_location || contractor.work_location?.length === 0) {
                const existing = locationMap.get('No Location') || [];
                locationMap.set('No Location', [...existing, formattedContractor]);
            } else {
                contractor.work_location.forEach((location) => {
                    const locationName = location.name || 'Unknown Location';
                    const existing = locationMap.get(locationName) || [];
                    locationMap.set(locationName, [...existing, formattedContractor]);
                });
            }
        });

        return locationMap;
    }, [contractorData]);

    return {
        contractorsByLocation,
        isLoading,
        refetch,
    };
}

// --- Hook for Contractor Work Locations ---
export function useContractorWorkLocations(contractorId: string) {
    const { data: contractor, isLoading, refetch } = useContractorById(contractorId);

    const workLocations = useMemo(() => {
        if (!contractor?.work_location) return [];

return contractor.work_location.map((location): FormattedWorkLocation => {
const male = Number(location.maleCount || 0)
const female = Number(location.femaleCount || 0)
const total = male + female

    return {
        name: location.name || 'Unknown Location',
        maleCount: male,
        femaleCount: female,
        totalCount: total,
        displayCount: `${male} Male / ${female} Female`,
    }
})
    }, [contractor]);

    return {
        workLocations,
        isLoading,
        refetch,
    };
}

// --- Hook for Cache Management ---
export function useContractorCache() {
    const queryClient = useQueryClient();

    const clearCache = useCallback(() => {
        queryClient.removeQueries({ queryKey: contractorQueryKeys.all });
    }, [queryClient]);

    const invalidateAll = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: contractorQueryKeys.all });
    }, [queryClient]);

    const prefetchContractor = useCallback(async (id: string) => {
        if (!id) return;
        
        await queryClient.prefetchQuery({
            queryKey: contractorQueryKeys.detail(id),
            queryFn: rejectEmptyOrNull(async () => {
                const response = await fetchContractorById(id);
                return response.data as ContractorData;
            }),
            staleTime: 5 * 60 * 1000,
        });
    }, [queryClient]);

    const getCachedContractor = useCallback((id: string): ContractorData | undefined => {
        return queryClient.getQueryData(contractorQueryKeys.detail(id));
    }, [queryClient]);

    const getCachedContractors = useCallback((): ContractorData[] | undefined => {
        return queryClient.getQueryData(contractorQueryKeys.lists());
    }, [queryClient]);

    return {
        clearCache,
        invalidateAll,
        prefetchContractor,
        getCachedContractor,
        getCachedContractors,
    };
}

export { contractorQueryKeys };