import PageHeader from "@/src/components/ui/PageHeader";
import { getColor } from "@/src/constants/colors";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import BackButton from "@/src/components/ui/Buttons/BackButton";
import Input from "@/src/components/ui/Inputs/Input";
import { useEffect, useState } from "react";
import Loader from "@/src/components/ui/Loader";
import { useFormValidator } from "@/src/sbc/form";
import { addUserTypes } from "@/src/types/form";
import { addUserInitialValues } from "@/src/constants/formInitialvalues";
import FormField from "@/src/sbc/form/FormField";
import Button from "@/src/components/ui/Buttons/Button";
import Select from "@/src/components/ui/Select";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";
import { RootState } from "@/src/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { addUsers } from "@/src/services/user.service";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import { useParams } from "@/src/hooks/useParams";
import { useUpdateUser, useUserByUsername } from "@/src/hooks/user";
import { selectRole } from "@/src/redux/slices/select-role";
import ChipGroup from "@/src/components/ui/ChipGroup";
import { allowedPolicies } from "@/src/constants/allowedPolicies";
import { clearPolicies, setPolicies } from "@/src/redux/slices/bottomsheet/policies.slice";
import { useAuth } from "@/src/context/AuthContext";
import { resolveAccess } from "@/src/utils/policiesUtils";
import { useToast } from "@/src/context/ToastContext";

const EditUserScreen = () => {
    const { role, policies } = useAuth();
    const toast = useToast();
    const safeRole = role ?? "guest";
    const safePolicies = policies ?? [];
    const access = resolveAccess(safeRole, safePolicies);
    
  const { validateAndSetData } = useValidateAndOpenBottomSheet();
  const selectedRole = useSelector(
    (state: RootState) => state.selectRole.selectedRole
  );

  const { selectedPolicies, isSelectionDone } = useSelector(
    (state: RootState) => state.policies
  );

  const dispatch = useDispatch();
  const { goTo } = useAppNavigation();
  const [loading, setLoading] = useState(false);
  const { username } = useParams("user-form", "username");
  const { data: user, isLoading: userLoading } = useUserByUsername(username);
  const updateUserMutation = useUpdateUser();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [toastMessage, setToastMessage] = useState("");
  const {
    values,
    setField,
    setFields,
    errors,
    resetForm,
    validateForm,
    isValid,
  } = useFormValidator<addUserTypes>(
    addUserInitialValues,
    {
      username: [
        { type: "required", message: "Username required!" },
        {
          type: "minLength",
          length: 3,
          message: "Username have atleast 3 digit!",
        },
      ],
      email: [
        { type: "required", message: "Email required!" },
        { type: "email", message: "It must be valid email!" },
      ],
      name: [{ type: "required", message: "Name required!" }],
      phone: [
        {
          type: "minLength",
          length: 10,
          message: "Phone number must be 10 digit!",
        },
      ],
      profilepic: [],
      role: [
        { type: "required", message: "role required!" },
        {
          type: "custom",
          message: "role must be admin or supervisor!",
          validate: (role) => ["admin", "supervisor"].includes(role),
        },
      ],
     policies: [
  {
    type: "custom",
    message: "Policies required!",
    validate: (policies) =>
      Array.isArray(policies) && policies.length > 0,
  },
  {
    type: "custom",
    message: "Policies must be purchase, production, packaging or sales!",
    validate: (policies) => {
      if (!Array.isArray(policies)) return false;
      return policies.every((p) => allowedPolicies.includes(p));
    },
  },
],
    },
    {
      validateOnChange: true,
      debounce: 300,
    }
  );
  const isEdit = Boolean(username);

  useEffect(() => {
    if (!isEdit) return;
    if (userLoading) return;
    if (!user) return;

    setFields({
      username: user.username ?? "",
      email: user.email ?? "",
      name: user.name ?? "",
      phone: user.phone ?? "",
      role: user.role ?? "",
      profilepic: user.profilepic ?? "",
      policies: user.policies ?? [],
    });
    dispatch(selectRole(user.role));

  dispatch(
    setPolicies(
      (user.policies ?? []).map((p: string) => ({
        name: p,
      }))
    )
  );

  }, [isEdit, userLoading, user]);

  useEffect(() => {
  if (!username) {
    dispatch(clearPolicies());
  }
}, [username]);

  useEffect(() => {
    if (selectedRole && values.role !== selectedRole) {
      setField("role", selectedRole ? selectedRole : values.role);
    }
  }, [setFields]);

  useEffect(() => {
    if (!isSelectionDone) return;

    const names = selectedPolicies.map((sp) => sp.name.toLowerCase());

    if (
      !Array.isArray(values.policies) ||
      values.policies.length !== names.length ||
      values.policies.some((v, i) => v !== names[i])
    ) {
      setField("policies", names);
    }
  }, [isSelectionDone, selectedPolicies, setField, values.policies]);

    if (!access.isFullAccess) {
      return null;
    }

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const result = validateForm();
      if (!result.success) return;

      if (isEdit) {
        if (!username) {
          console.error("username missing for edit");
          return;
        }

        updateUserMutation.mutate(
          { username, data: result.data },
          {
            onSuccess: (updatedUser) => {
              toast.success(`User '${updatedUser.name}' successfully updated!`
              );
              // console.log("updated", updatedUser);
            },
            onError: (err: any) => {
              console.error("update failed", err);
            },
          }
        );
      } else {
        await addUsers({
          ...result.data,
          username: result.data.username.toLowerCase(),
        });
        dispatch(clearPolicies())
      }
      goTo("user");
    } catch (error: any) {
      console.log("add user failed:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.pageContainer}>
      <PageHeader page={"Users"} />
      <KeyboardAvoidingView
        style={[styles.wrapper, { flex: 1 }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, gap: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BackButton label="User details" backRoute="user" />

          <FormField name="username" form={{ values, setField, errors }}>
            {({ value, onChange, error }) => (
              <Input
                placeholder="Enter Username"
                value={value.toLowerCase()}
                onChangeText={(text: string) => onChange(text.toLowerCase())}
                //   onBlur={onBlur}
                error={error}
              >
                Username
              </Input>
            )}
          </FormField>
          <FormField name="email" form={{ values, setField, errors }}>
            {({ value, onChange, error }) => (
              <Input
                placeholder="Enter email"
                value={value}
                onChangeText={onChange}
                //   onBlur={onBlur}
                error={error}
                keyboardType="email-address"
              >
                Email
              </Input>
            )}
          </FormField>
          <FormField name="name" form={{ values, setField, errors }}>
            {({ value, onChange, error }) => (
              <Input
                placeholder="Enter name"
                value={value}
                onChangeText={onChange}
                //   onBlur={onBlur}
                error={error}
              >
                Name
              </Input>
            )}
          </FormField>
          <FormField name="role" form={{ values, setField, errors }}>
            {({ value, onChange, error }) => (
              <Select
                value={selectedRole ?? "Select Role"}
                options={[]}
                onPress={async () => {
                  setLoading(true);
                  await validateAndSetData("role", "select-role");
                  setLoading(false);
                }}
                showOptions={false}
                error={error}
                legacy
              >
                Role
              </Select>
            )}
          </FormField>

          <View style={{flexDirection: "column", gap: 8}}>
            <FormField name="policies" form={{ values, setField, errors }}>
              {({ value, onChange, error }) => (
                <Select
                  value={selectedPolicies[0]?.name || "Select Policies"}
                  options={[]}
                  onPress={async () => {
                    setLoading(true);
                    await validateAndSetData(
                      "policies",
                      "select-policies"
                    );
                    setLoading(false);
                  }}
                  showOptions={false}
                  error={error}
                  legacy
                >
                  Policies
                </Select>
              )}
            </FormField>

            {isSelectionDone && <ChipGroup blockSelection={true} data={selectedPolicies || []} />}
          </View>

          <FormField name="phone" form={{ values, setField, errors }}>
            {({ value, onChange, error }) => (
              <Input
                placeholder="Enter phone"
                value={value.slice(0, 10)}
                onChangeText={onChange}
                //   onBlur={onBlur}
                error={error}
                keyboardType="number-pad"
              >
                Phone No.
              </Input>
            )}
          </FormField>

          <Button
            onPress={handleSubmit}
            disabled={!isValid}
            style={{ marginTop: 16 }}
          >
            {isEdit ? "Save Changes" : "Add User"}
          </Button>
        </ScrollView>
        {loading && (
          <View style={styles.overlay}>
            <View style={styles.loaderContainer}>
              <Loader />
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    
    </View>
  );
};

export default EditUserScreen;

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: getColor("green", 500),
    position: "relative",
  },
  wrapper: {
    flex: 1,
    backgroundColor: getColor("light", 200),
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    padding: 16,
    gap: 16,
  },
  flexGrow: {
    flex: 1,
  },
  HStack: {
    flexDirection: "row",
  },
  justifyBetween: {
    justifyContent: "space-between",
  },
  alignCenter: {
    alignItems: "center",
  },
  gap8: {
    gap: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getColor("green", 500, 0.05),
    zIndex: 2,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
