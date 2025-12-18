import { useMutation, useQuery, useQueryClient, UseMutationResult  } from "@tanstack/react-query";
import { rejectEmptyOrNull } from "@/src/utils/authUtils";
import { fetchUserById, getAllUsers, removeUser, updateUser } from "@/src/services/user.service";
import useSocket from "./useSocketFromContext";
import { useEffect } from "react";
import { AxiosError, AxiosResponse } from "axios";


interface UserCreated {
  userDetails: UserResponse;
  timestamp?: string | Date;
  type?: string;
}
export interface UserResponse {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  role: "admin" | "supervisor";
  profilepic?: string;
  createdAt?: string | Date;
  policies?: ("production" | "packaging" | "purchase" | "sales")[];
}

export type UpdatePayload = Partial<
  Pick<UserResponse, "name" | "email" | "phone" | "role" | "profilepic">
>;

type MutateVars = { username: string; data: UpdatePayload };

type OnMutateContext = {
  previousUsers?: UserResponse[] | undefined;
  previousByUsername?: UserResponse | null;
  previousById?: UserResponse | null;
  maybeId?: string | undefined;
};

export function useUsers() {
  const queryClient = useQueryClient();
  const socket = useSocket();

  useEffect(() => {
    const onCreated = (data: UserCreated) => {
      const updated = data.userDetails;
      if (!updated?.id) return;

      queryClient.setQueryData<UserResponse>(
        ["user-by-id", updated.id],
        updated
      );

      queryClient.setQueryData<UserResponse[]>(["users"], (old) => {
        if (!old) return [updated];
        if (old.some((o) => o.id === updated.id)) return old;
        return [updated, ...old];
      });
    };

    socket.on("user:created", onCreated);
    return () => {
      socket.off("user:created", onCreated);
    };
  }, [queryClient]);

  const query = useQuery<UserResponse[]>({
    queryKey: ["users"],
    queryFn: rejectEmptyOrNull(async () => {
      const response = await getAllUsers();
      return response.data;
    }),
  });

  return {
    ...query,
    users: query.data ?? [],
    count: query.data?.length ?? 0,
  };
}

export function useUserByUsername(username: string | undefined) {
  const queryClient = useQueryClient();

  return useQuery<UserResponse | null>({
    enabled: !!username,
    queryKey: ["user-by-username", username],

    queryFn: rejectEmptyOrNull(async () => {
      if (!username) return null;

      const allUsers = queryClient.getQueryData<UserResponse[]>(["users"]);
      const cached = allUsers?.find((u) => u.username === username);
      if (cached) return cached;

      const response = await fetchUserById(username);
      return response.data;
    }),

    staleTime: 5 * 60 * 1000,
  });
}

// --- The hook ---
export function useUpdateUser(): UseMutationResult<
  UserResponse,
  AxiosError | Error,
  MutateVars,
  OnMutateContext
> {
  const qc = useQueryClient();

  return useMutation<UserResponse, AxiosError | Error, MutateVars, OnMutateContext>({
    mutationFn: async ({ username, data }: MutateVars) => {
      const res: AxiosResponse<UserResponse> = await updateUser(username, data);
      return res.data;
    },

    onMutate: async ({ username, data }: MutateVars) => {
      await qc.cancelQueries({ queryKey: ["users"] });
      await qc.cancelQueries({ queryKey: ["user-by-username", username] });

      const previousUsers = qc.getQueryData<UserResponse[]>(["users"]);
      const previousByUsername = qc.getQueryData<UserResponse | null>([
        "user-by-username",
        username,
      ]);

      const maybeId =
        previousByUsername?.id ?? previousUsers?.find((u) => u.username === username)?.id;

      const previousById =
        maybeId !== undefined ? qc.getQueryData<UserResponse | null>(["user-by-id", maybeId]) : undefined;

      if (previousUsers) {
        qc.setQueryData<UserResponse[]>(["users"], (old = []) =>
          old.map((u) => (u.username === username ? { ...u, ...data } : u))
        );
      }

      qc.setQueryData<UserResponse | null>(["user-by-username", username], (old) => {
        if (old) return { ...old, ...data };
        const found = previousUsers?.find((u) => u.username === username);
        return found ? { ...found, ...data } : null;
      });

      if (maybeId) {
        qc.setQueryData<UserResponse | null>(["user-by-id", maybeId], (old) =>
          old ? { ...old, ...data } : old
        );
      }

      return { previousUsers, previousByUsername, previousById, maybeId } as OnMutateContext;
    },

    onError: (err: AxiosError | Error, variables: MutateVars, context?: OnMutateContext) => {
      if (context?.previousUsers) {
        qc.setQueryData<UserResponse[] | undefined>(["users"], context.previousUsers);
      }

      if (context?.previousByUsername) {
        qc.setQueryData<UserResponse | null>(["user-by-username", variables.username], context.previousByUsername);
      }

      if (context?.maybeId && context.previousById) {
        qc.setQueryData<UserResponse | null>(["user-by-id", context.maybeId], context.previousById);
      }
    },

    onSuccess: (updatedUser: UserResponse) => {
      qc.setQueryData<UserResponse[] | undefined>(["users"], (old) => {
        if (!old) return [updatedUser];
        const idx = old.findIndex((u) => u.id === updatedUser.id || u.username === updatedUser.username);
        if (idx === -1) return [updatedUser, ...old];
        const next = [...old];
        next[idx] = updatedUser;
        return next;
      });

      qc.setQueryData<UserResponse | undefined>(["user-by-username", updatedUser.username], updatedUser);
      qc.setQueryData<UserResponse | undefined>(["user-by-id", updatedUser.id], updatedUser);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

type DeleteVars = { username: string };

type DeleteOnMutateContext = {
  previousUsers?: UserResponse[] | undefined;
  previousByUsername?: UserResponse | null;
  previousById?: UserResponse | null;
  maybeId?: string | undefined;
};

export function useDeleteUser() {
  const qc = useQueryClient();

  return useMutation<void, AxiosError | Error, DeleteVars, DeleteOnMutateContext>({
    mutationFn: async ({ username }: DeleteVars) => {
      await removeUser(username);
    },

    onMutate: async ({ username }: DeleteVars) => {
      await qc.cancelQueries({ queryKey: ["users"] });
      await qc.cancelQueries({ queryKey: ["user-by-username", username] });

      const previousUsers = qc.getQueryData<UserResponse[]>(["users"]);
      const previousByUsername = qc.getQueryData<UserResponse | null>([
        "user-by-username",
        username,
      ]);

      const maybeId =
        previousByUsername?.id ?? previousUsers?.find((u) => u.username === username)?.id;

      const previousById =
        maybeId !== undefined ? qc.getQueryData<UserResponse | null>(["user-by-id", maybeId]) : undefined;

      // Optimistically remove from users list
      if (previousUsers) {
        qc.setQueryData<UserResponse[] | undefined>(["users"], (old = []) =>
          old.filter((u) => u.username !== username && u.id !== maybeId)
        );
      }

      // Remove user-by-username cache
      qc.removeQueries({ queryKey: ["user-by-username", username], exact: true });

      // Remove user-by-id cache if we know the id
      if (maybeId) {
        qc.removeQueries({ queryKey: ["user-by-id", maybeId], exact: true });
      }

      return { previousUsers, previousByUsername, previousById, maybeId } as DeleteOnMutateContext;
    },

    onError: (err, variables, context) => {
      // rollback
      if (context?.previousUsers) {
        qc.setQueryData<UserResponse[] | undefined>(["users"], context.previousUsers);
      }

      if (context?.previousByUsername) {
        qc.setQueryData<UserResponse | null>(["user-by-username", variables.username], context.previousByUsername);
      }

      if (context?.maybeId && context.previousById) {
        qc.setQueryData<UserResponse | null>(["user-by-id", context.maybeId], context.previousById);
      }
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
