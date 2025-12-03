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
import DetailsToast from "@/src/components/ui/DetailsToast";

const EditUserScreen = () => {
  const { validateAndSetData } = useValidateAndOpenBottomSheet();
  const selectedRole = useSelector(
    (state: RootState) => state.selectRole.selectedRole
  );
  const dispatch = useDispatch();
  const { goTo } = useAppNavigation();
  const [loading, setLoading] = useState(false);
const { username } = useParams("user-form", "username")
const { data: user, isLoading: userLoading } = useUserByUsername(username);
const updateUserMutation = useUpdateUser();
const [toastVisible, setToastVisible] = useState(false);
const [toastType, setToastType] = useState<"success" | "error" | "info">(
  "info"
);
const [toastMessage, setToastMessage] = useState("");
  const { values, setField, setFields, errors, resetForm, validateForm, isValid } =
    useFormValidator<addUserTypes>(
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
      });
      dispatch(selectRole(user.role))
    }, [isEdit, userLoading]);
  
    useEffect(() => {
      if (selectedRole && values.role !== selectedRole) {
        setField("role", selectedRole ? selectedRole : values.role);
      }
    }, [setFields]);

    const showToast = (type: "success" | "error" | "info", message: string) => {
      setToastType(type);
      setToastMessage(message);
      setToastVisible(true);
    };

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
              showToast(
                "success",
                `User '${updatedUser.name}' successfully updated!`
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
        >
          <BackButton label="User details" backRoute="user" />

          <FormField name="username" form={{ values, setField, errors }}>
            {({ value, onChange, error }) => (
              <Input
                placeholder="Enter Username"
                value={value}
                onChangeText={onChange}
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
                  await validateAndSetData("Abc123", "select-role");
                  setLoading(false);
                }}
                showOptions={false}
                error={error}
              >
                Role
              </Select>
            )}
          </FormField>
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
      <DetailsToast
          type={toastType}
          message={toastMessage}
          visible={toastVisible}
          onHide={() => setToastVisible(false)}
        />
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
