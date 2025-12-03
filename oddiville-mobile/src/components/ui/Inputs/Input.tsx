import React, { forwardRef, useEffect, useRef, useState } from "react";
import { getColor } from "@/src/constants/colors";
import { InputProps } from "@/src/types";
import {
  Animated,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import { B2, B4, H4 } from "../../typography/Typography";
import CalandarPlainIcon from "../../icons/page/CalandarPlainIcon";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";
import EyeOffIcon from "../../icons/page/EyeOffIcon";
import EyeIcon from "../../icons/page/EyeIcon";
import Tooltip from "../Tooltip";
import ClockIcon from "../../icons/common/ClockIcon";

const Input = forwardRef<TextInput, InputProps>(
  (
    {
      children,
      placeholder,
      onChangeText,
      onBlur,
      disabled,
      value,
      color = "green",
      icon,
      post,
      mask = "none",
      addonText,
      error,
      secureTextEntry,
      keyboardType,
      maxLength,
      manualErrorMessage,
      tooltipText,
      showTooltip,
      status = "default",
      inputStyle,
      wrapperStyle,
      style,
      onIconPress,
      ...props
    }: InputProps,
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [passwordVisible, setpasswordVisible] = useState(false);
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());

    const errorOpacity = useRef(new Animated.Value(0)).current;

    const shouldHideText = secureTextEntry && !passwordVisible;

    const digitsOnly = (s: string) => s.replace(/[^0-9]/g, "");

    const handleChangeText = (text: string) => {
      const next = keyboardType === "phone-pad" ? digitsOnly(text) : text;
      onChangeText?.(next);
    };

    useEffect(() => {
      if (error || status === "error") {
        Animated.timing(errorOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(errorOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    }, [error, status]);

    const renderIcon = (
      icon: React.ReactNode,
      onPress?: () => void,
      key?: string
    ) => (
      <Pressable onPress={onPress} style={styles.icon} key={key}>
        {icon}
      </Pressable>
    );

    const renderAddonText = (text: string) => (
      <B2 color={getColor("green", 200)} style={styles.addonText}>
        {text}
      </B2>
    );
    const renderAddonMask = (text: string) => (
      <B4 color={getColor("green", 400)} style={styles.addonMask}>
        {text}
      </B4>
    );

    const handleTimeConfirm = (selectedTime: Date) => {
      setShowTimePicker(false);
      setTime(selectedTime);

      const formattedTime = format(selectedTime, "hh:mm aa");
      onChangeText?.(formattedTime);
    };

    const handleTimeCancel = () => {
      setShowTimePicker(false);
    };

    const handleConfirm = (selectedDate: Date) => {
      setShowDatePicker(false);
      setDate(selectedDate);

      const formatted = format(selectedDate, "MMM dd, yyyy");
      onChangeText?.(formatted);
    };

    const handleCancel = () => {
      setShowDatePicker(false);
    };

    const getIconsToRender = () => {
      const icons: React.ReactNode[] = [];

      if (icon && !post)
        icons.push(renderIcon(icon, onIconPress, "custom-icon-before"));

      if (mask === "date")
        icons.push(
          renderIcon(<CalandarPlainIcon />, onIconPress, "calendar-icon")
        );
      if (mask === "time")
        icons.push(renderIcon(<ClockIcon />, onIconPress, "clock-icon"));

      if (secureTextEntry)
        icons.push(
          renderIcon(
            passwordVisible ? <EyeIcon /> : <EyeOffIcon />,
            () => setpasswordVisible(!passwordVisible),
            "eye-icon"
          )
        );

      if (icon && post)
        icons.push(renderIcon(icon, onIconPress, "custom-icon-after"));

      return icons;
    };

    const renderTextInput = () => (
      <TextInput
        ref={ref}
        style={[
          styles.textInput,
          mask === "textarea" && styles.textAreaInput,
          inputStyle,
          disabled && { backgroundColor, color: getColor("green", 400) },
        ]}
        placeholder={placeholder}
        onChangeText={handleChangeText}
        onFocus={() => !disabled && setIsFocused(true)}
        onBlur={(e) => {
          if (!disabled) {
            setIsFocused(false);
            onBlur?.(e);
          }
        }}
        placeholderTextColor={getColor("green", 700, disabled ? 0.4 : 0.7)}
        textAlignVertical={mask === "textarea" ? "top" : "center"}
        multiline={mask === "textarea"}
        numberOfLines={mask === "textarea" ? 4 : 1}
        value={value}
        secureTextEntry={shouldHideText}
        keyboardType={keyboardType}
        maxLength={maxLength}
        editable={!disabled && mask !== "date" && mask !== "time"}
        pointerEvents={
          disabled
            ? "none"
            : mask === "date" || mask === "time"
            ? "none"
            : undefined
        }
      />
    );

    const borderColor =
      error || status === "error"
        ? getColor("red", 700)
        : disabled
        ? getColor("green", 100)
        : status === "success"
        ? getColor("green")
        : isFocused
        ? getColor(color, 400)
        : getColor(color, 100);

    const backgroundColor = disabled
      ? getColor("green", 100)
      : getColor("light");

    const inputWithIcon = (
      <View
        style={[
          styles.inputWrapper,
          mask === "addon" && { paddingRight: 0 },
          { borderColor },
          disabled && { backgroundColor, color: getColor("green", 400) },
          wrapperStyle,
        ]}
      >
        {!post && addonText && renderAddonText(addonText)}

        {mask === "date" || mask === "time" ? (
          <TouchableOpacity
            disabled={disabled}
            activeOpacity={disabled ? 1 : 0.9}
            onPress={() => {
              if (disabled) return;
              if (mask === "date") setShowDatePicker(true);
              else if (mask === "time") setShowTimePicker(true);
            }}
            style={{ flex: 1, opacity: disabled ? 0.6 : 1 }}
          >
            <View style={{ justifyContent: "center", minHeight: 44 }}>
              {renderTextInput()}
            </View>
          </TouchableOpacity>
        ) : (
          renderTextInput()
        )}

        {post && addonText && mask !== "addon" && renderAddonText(addonText)}
        {mask === "addon" && addonText && renderAddonMask(addonText)}

        {getIconsToRender()}
      </View>
    );

    return children ? (
      <View style={[styles.inputContainer, style]} {...props}>
        {typeof children === "string" ? (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <H4>{children}</H4>
            {tooltipText && (
              <Tooltip tooltipText={tooltipText} showTooltip={showTooltip} />
            )}
          </View>
        ) : (
          children
        )}

        {inputWithIcon}
        {(error || manualErrorMessage) && (
          <Animated.View style={{ opacity: errorOpacity }}>
            <B4 color={getColor("red", 700)}>
              {String(error || manualErrorMessage || "Something went wrong.")}
            </B4>
          </Animated.View>
        )}
        {showDatePicker && (
          <DateTimePickerModal
            isVisible={showDatePicker}
            mode="date"
            date={date}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            minimumDate={new Date()}
          />
        )}
        {showTimePicker && (
          <DateTimePickerModal
            isVisible={showTimePicker}
            mode="time"
            date={time}
            onConfirm={handleTimeConfirm}
            onCancel={handleTimeCancel}
          />
        )}
      </View>
    ) : (
      inputWithIcon
    );
  }
);

Input.displayName = "Input";

export default Input;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "column",
    gap: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: getColor("light"),
    // height: 44,
    paddingHorizontal: 12,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  textInput: {
    flex: 1,
    fontFamily: "FunnelSans-Regular",
    fontSize: 16,
    color: getColor("green", 700),
    minHeight: 44,
    // height: 100,
  },
  icon: {
    paddingHorizontal: 4,
  },
  addonText: {
    paddingRight: 8,
  },
  addonMask: {
    padding: 12,
    backgroundColor: getColor("green", 100),
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  textAreaInput: {
    minHeight: 128,
    paddingTop: 8,
    paddingBottom: 8,
    textAlignVertical: "top",
  },
});
