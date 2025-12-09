import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  View,
  Pressable,
} from "react-native";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginService } from "@/src/services/auth.service";
import { useAuth } from "@/src/context/AuthContext";

import Input from "../src/components/ui/Inputs/Input";
import Button from "../src/components/ui/Buttons/Button";
import {
  B3,
  B4,
  BoldHeading,
  H2,
} from "../src/components/typography/Typography";
import PageHeader from "../src/components/ui/PageHeader";
import Alert from "../src/components/ui/Alert";
import ButtonTab from "../src/components/ui/ButtonTab";

import loginSchema, { LoginFormData } from "../src/schemas/LoginSchema";
import loginPhoneSchema, {
  LoginPhoneFormData,
} from "../src/schemas/LoginPhoneSchema";
import Loader from "../src/components/ui/Loader";
import { getColor } from "../src/constants/colors";
import PencilIcon from "../src/components/icons/common/PencilIcon";
import { useDispatch } from "react-redux";
import { setAdmin } from "../src/redux/slices/admin.slice";
import DetailsToast from "../src/components/ui/DetailsToast";
import { useAppNavigation } from "../src/hooks/useAppNavigation";
import * as SecureStorage from "expo-secure-store";

const LoginScreen = () => {
  const dispatch = useDispatch();
  const { goTo } = useAppNavigation();
  const otpRefs = Array.from({ length: 4 }, () => React.createRef<any>());

  const [loading, setLoading] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [checkOtpState, setcheckOtpState] = useState<
    "error" | "default" | "success"
  >("default");

  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const checkOtpState = async () => {
      const otpFlag = await SecureStorage.getItemAsync("otpInProgress");
      const otpStart = await SecureStorage.getItemAsync("otpStartTime");
      if (otpFlag === "true" && otpStart) {
        const timeElapsed = Date.now() - Number(otpStart);
        if (timeElapsed < 5 * 60 * 1000) {
          setActiveTabIndex(1);
          setShowOtpInput(true);
        } else {
          await SecureStorage.deleteItemAsync("otpInProgress");
          await SecureStorage.deleteItemAsync("otpStartTime");
        }
      }
    };
    checkOtpState();
  }, []);

  useEffect(() => {
    let interval: number;
    if (showOtpInput && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpInput, secondsLeft]);

  // Handle OTP Resend
  const handleResendOtp = async () => {
    try {
      setLoading(true);
      const now = Date.now();
      await SecureStorage.setItemAsync("otpStartTime", now.toString());
      await SecureStorage.setItemAsync("otpInProgress", "true");

      setShowOtpInput(true);
      setSecondsLeft(60);
    } catch (error) {
      console.error("Resend OTP failed:", error);
    } finally {
      setLoading(false);
    }
  };
  const {
    control: controlEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: errorsEmail, isValid: isEmailFormValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const {
    control: controlPhone,
    handleSubmit: handleSubmitPhone,
    watch: watchPhone,
    formState: { errors: errorsPhone },
  } = useForm<LoginPhoneFormData>({
    resolver: zodResolver(loginPhoneSchema),
    mode: "onChange",
  });

  const isEmailLogin = activeTabIndex === 0;

  // Email form submit handler
  const { login } = useAuth();

  const onSubmitEmail: SubmitHandler<LoginFormData> = async (data: any) => {
    try {
      setLoading(true);
      const response = await LoginService(data);

      if (response.status === 200) {
        const token = response.data.token;
        const authData = response.data.authData;

        await SecureStorage.setItemAsync("metadata", token);

        await login(authData.role, authData.policies);

        await SecureStorage.setItemAsync("newsync", JSON.stringify(authData));
        dispatch(setAdmin(authData));

        showToast("success", "Login successfully!");
        if (authData.role === "superadmin" || authData.role === "admin")
          goTo("home");
        else if (authData.role === "supervisor" && authData.policies?.includes("purchase")) goTo("policies/purchase");
        else if (authData.role === "supervisor" && authData.policies?.includes("production")) goTo("policies/production");
        else if (authData.role === "supervisor" && authData.policies?.includes("package")) goTo("policies/package");
        else if (authData.role === "supervisor" && authData.policies?.includes("sales")) goTo("policies/sales");
        else {
          showToast("error", "You don't have access to any module");
        }
      }
    } catch (error: any) {
      console.log("Login failed:", error.response?.data || error.message);
      const errorMsg =
        error.response?.data?.message || error.message || "Unknown error";
      showToast("error", `Login failed: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Phone form submit handler
  const onSubmitPhone: SubmitHandler<LoginPhoneFormData> = async (
    data: any
  ) => {
    try {
      setLoading(true);
      const otp = data.otp.join("");
      const isSuccess = false;
      if (isSuccess) {
        setcheckOtpState("success");
      } else {
        setcheckOtpState("error");
      }
    } catch (error: any) {
      console.log("Login failed:", error.response?.data || error.message);
    } finally {
      setLoading(false);
      await SecureStorage.deleteItemAsync("otpInProgress");
      await SecureStorage.deleteItemAsync("otpStartTime");
    }
  };

  const userphone = watchPhone("userphone");
  const otp = watchPhone("otp");

  const isUserphoneValid = userphone && userphone?.length === 10;
  const isOtpValid = otp && otp.every((digit: any) => digit?.length === 1);

  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
  };

  const handleGetOtp = async () => {
    try {
      setLoading(true);
      const now = Date.now();
      await SecureStorage.setItemAsync("otpStartTime", now.toString());
      await SecureStorage.setItemAsync("otpInProgress", "true");
      setShowOtpInput(true);
      setSecondsLeft(60);
    } catch (err) {
      console.error("OTP failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <PageHeader page={"Welcome"} />
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.loginWrapper}>
              <View style={styles.headerContent}>
                <BoldHeading>Let’s you in</BoldHeading>
                <Alert
                  color={"blue"}
                  text="If you're a new user, please log in with your phone number. If you're an existing user, please log in with your email."
                />
              </View>

              <ButtonTab
                activeIndex={activeTabIndex}
                onChange={handleTabChange}
                tabs={[
                  {
                    label: "Email",
                    content: (
                      <View style={styles.tabContainer} key="email-tab">
                        <View style={styles.textContainer}>
                          <View>
                            <H2 style={{ fontFamily: "FunnelSans-SemiBold" }}>
                              Hey mate,
                            </H2>
                            <H2>Welcome to Oddiville!</H2>
                          </View>
                          <B4 color={getColor("green", 300)}>
                            Enter your email address & password to use the app.
                          </B4>
                        </View>
                        <View style={{ flexDirection: "column", gap: 24 }}>
                          {/* Email Field */}
                          <Controller
                            control={controlEmail}
                            name="email"
                            render={({
                              field: { onChange, onBlur, value },
                            }) => (
                              <Input
                                placeholder="Enter email"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                keyboardType="email-address"
                                error={errorsEmail.email?.message}
                              >
                                Email
                              </Input>
                            )}
                          />

                          {/* Password Field */}
                          <Controller
                            control={controlEmail}
                            name="userpass"
                            render={({
                              field: { onChange, onBlur, value },
                            }) => (
                              <Input
                                placeholder="Enter password"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                post
                                secureTextEntry
                                error={errorsEmail.userpass?.message}
                              >
                                Password
                              </Input>
                            )}
                          />
                        </View>
                      </View>
                    ),
                  },
                  {
                    label: "Phone mobile",
                    content: !showOtpInput ? (
                      <View style={styles.tabContainer} key="phone-tab">
                        <View style={styles.textContainer}>
                          <View>
                            <H2 style={{ fontFamily: "FunnelSans-SemiBold" }}>
                              Hey mate,
                            </H2>
                            <H2>Welcome to Oddiville!</H2>
                          </View>
                          <B4 color={getColor("green", 300)}>
                            Enter your phone number & get OTP to Verify.
                          </B4>
                        </View>

                        {/* Phone number Field */}
                        <Controller
                          control={controlPhone}
                          name="userphone"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                              placeholder="Enter new number"
                              value={value}
                              addonText="+91"
                              onChangeText={(text: string) => {
                                const numericText = text.replace(/[^0-9]/g, "");
                                onChange(numericText);
                              }}
                              onBlur={onBlur}
                              error={errorsPhone.userphone?.message}
                              keyboardType="phone-pad"
                              secureTextEntry={true}
                              maxLength={10}
                            >
                              Phone number
                            </Input>
                          )}
                        />
                      </View>
                    ) : (
                      <View style={styles.tabContainer} key="phone-tab">
                        <View style={styles.textContainer}>
                          <View>
                            <H2 style={{ fontFamily: "FunnelSans-SemiBold" }}>
                              Enter OTP
                            </H2>
                          </View>
                          <View style={styles.otpDesc}>
                            <B4 color={getColor("green", 400)}>
                              We are sent a 4-digit code to{" "}
                              <B4 color={getColor("green", 700)}>+91***90</B4>
                            </B4>
                            <PencilIcon color={getColor("green")} size={16} />
                            <B3 color={getColor("green")}>Edit</B3>
                          </View>
                        </View>
                        <View style={styles.otpWithErrorContainer}>
                          <View style={styles.otpContainer}>
                            {Array.from({ length: 4 }).map((_, index) => (
                              <Controller
                                key={index}
                                control={controlPhone}
                                name={`otp.${index}`}
                                render={({
                                  field: { onChange, onBlur, value },
                                }) => (
                                  <Input
                                    ref={otpRefs[index]}
                                    value={value}
                                    onChangeText={(text: string) => {
                                      const digit = text.replace(/[^0-9]/g, "");
                                      onChange(digit);
                                      // Move focus to next input if available
                                      if (digit?.length === 1 && index < 3) {
                                        otpRefs[index + 1]?.current?.focus();
                                      }
                                    }}
                                    onBlur={onBlur}
                                    keyboardType="numeric"
                                    maxLength={1}
                                    inputStyle={{
                                      height: 60,
                                      textAlign: "center",
                                    }}
                                    status={checkOtpState}
                                    manualErrorMessage="Sorry, the OTP you entered is invalid."
                                  />
                                )}
                              />
                            ))}
                          </View>
                          {checkOtpState === "error" && (
                            <B3 color={getColor("red", 700)}>
                              Sorry, the OTP you entered is invalid.
                            </B3>
                          )}
                        </View>

                        <View style={styles.expireTime}>
                          <B4 color={getColor("green", 400)}>
                            Don’t receive code?
                          </B4>
                          {secondsLeft > 0 ? (
                            <B3 color={getColor("green")}>
                              {" "}
                              {`${String(Math.floor(secondsLeft / 60)).padStart(
                                2,
                                "0"
                              )}:${String(secondsLeft % 60).padStart(2, "0")}`}
                            </B3>
                          ) : (
                            <Pressable onPress={handleResendOtp}>
                              <B3 color="green">Resend OTP</B3>
                            </Pressable>
                          )}
                        </View>
                      </View>
                    ),
                  },
                ]}
              />

              {/* Login Button */}
              <View style={styles.loginButtonWrapper}>
                {isEmailLogin ? (
                  <Button
                    color="green"
                    variant="fill"
                    onPress={handleSubmitEmail(onSubmitEmail)}
                    disabled={!isEmailFormValid || loading}
                  >
                    Login with Email
                  </Button>
                ) : showOtpInput ? (
                  <Button
                    color="green"
                    variant="fill"
                    onPress={handleSubmitPhone(onSubmitPhone)}
                    disabled={!isOtpValid || loading}
                  >
                    Verify OTP
                  </Button>
                ) : (
                  <Button
                    color="green"
                    variant="fill"
                    onPress={handleGetOtp}
                    disabled={!isUserphoneValid || loading}
                  >
                    Get OTP
                  </Button>
                )}
              </View>

              {/* Loader */}
              {loading && (
                <View style={styles.loaderWrapper}>
                  <Loader />
                </View>
              )}
            </View>
            <DetailsToast
              type={toastType}
              message={toastMessage}
              visible={toastVisible}
              onHide={() => setToastVisible(false)}
            />
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: getColor("green", 500),
    position: "relative",
  },
  tabContainer: {
    flex: 1,
  },
  headerContent: {
    flexDirection: "column",
    gap: 12,
  },
  loginWrapper: {
    flex: 1,
    backgroundColor: getColor("light", 200),
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    padding: 24,
    gap: 24,
  },
  loginButtonWrapper: {
    marginTop: "auto",
  },
  tab: {
    flexDirection: "row",
    gap: 16,
  },
  textContainer: {
    flexDirection: "column",
    gap: 8,
    marginBottom: 24,
  },
  loaderWrapper: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9,
  },
  otpDesc: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  otpWithErrorContainer: {
    flexDirection: "column",
    gap: 8,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 24,
  },
  expireTime: {
    flexDirection: "row",
    gap: 8,
  },
});
