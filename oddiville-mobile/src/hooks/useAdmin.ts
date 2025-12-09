import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAdminProfile } from "@/src/services/admin.service";
import { setAdmin } from "@/src/redux/slices/admin.slice";
import * as SecureStorage from "expo-secure-store";

export const useAdmin = () => {
  const dispatch = useDispatch();
  const admin = useSelector((state: any) => state.admin.data);

  useEffect(() => {
    const fetchAdmin = async () => {
      if (admin) return;

      const token = await SecureStorage.getItemAsync("metadata");
      if (!token) return;

      try {
        const res = await getAdminProfile(token);
        
        if (res.status === 200) {
          dispatch(setAdmin(res.data));
        }
      } catch (error) {
        console.error("Failed to fetch admin profile:", error);
      }
    };

    fetchAdmin(); 
  }, []); 

  return admin;
};
