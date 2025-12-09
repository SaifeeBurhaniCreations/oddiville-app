// 1. React and React Native core
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

// 2. Third-party dependencies
// No items of this type

// 3. Project components
import Calendar from '@/src/components/ui/Calendar';
import PageHeader from '@/src/components/ui/PageHeader';
import BackButton from '@/src/components/ui/Buttons/BackButton';
import Input from '@/src/components/ui/Inputs/Input';
import Button from '@/src/components/ui/Buttons/Button';
import FormField from '@/src/sbc/form/FormField';

// 4. Project hooks
// No items of this type

// 5. Project constants/utilities
import { getColor } from '@/src/constants/colors';
import { useFormValidator } from '@/src/sbc/form';
import { createCalendarEvent } from '@/src/services/calendar.service';
import { useCalendar } from '@/src/hooks/calendar';
import Loader from '@/src/components/ui/Loader';
import DetailsToast from '@/src/components/ui/DetailsToast';

// 6. Types
// No items of this type

// 7. Schemas
// No items of this type

// 8. Assets 
// No items of this type

export type ScheduleEventForm = {
    work_area: string;
    product_name: string;
    scheduled_date: string;
    start_time: string;
    end_time: string;
}

const CalendarScreen = () => {
    const { data: scheduledEvents = [], refetch } = useCalendar();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>("")
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );
    const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

    const showToast = (type: "success" | "error" | "info", message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
  };

    const {
        values,
        setField,
        errors,
        resetForm,
        validateForm,
        isValid,
    } = useFormValidator<ScheduleEventForm>(
        {
            work_area: "",
            product_name: "",
            scheduled_date: "",
            start_time: "",
            end_time: "",
        },
        {
            work_area: [
                { type: "required", message: "Labour Location Required!" }
            ],
            product_name: [
                { type: "required", message: "Product Name Required!" }
            ],
            scheduled_date: [
                { type: "required", message: "Schedule date Required!" }
            ],
            start_time: [],
            end_time: [],
        },
        {
            validateOnChange: true,
            debounce: 300
        }
    );

    useEffect(() => {
        setField("scheduled_date", selectedDate);
    }, [selectedDate])


    const onSubmit = async () => {
        setIsLoading(true)
        const result = validateForm();

        if (!result.success) return;
        await createCalendarEvent(result.data);
        setIsLoading(false)
      showToast("success", "Event Created");

        resetForm();
        // setSelectedTime("");
        setSelectedDate("");
    }
    
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.pageContainer}>
                <PageHeader page={'Calendar'} />
                <View style={styles.wrapper}>
                    <ScrollView showsVerticalScrollIndicator={false} refreshControl={
                        <RefreshControl refreshing={false} onRefresh={refetch} colors={[getColor("green")]} />
                    }>
                        <View style={[styles.VStack, styles.gap12]}>
                            <BackButton label='Calendar' backRoute="home" />
                            <Calendar setSelectedDate={setSelectedDate} selectedDate={selectedDate} scheduledEvents={scheduledEvents} />

                            <FormField name="product_name" form={{ values, setField, errors }}>
                                {({ value, onChange, error }) => (
                                    <Input
                                        value={value}
                                        onChangeText={onChange}
                                        placeholder="Enter Product Name"
                                        error={error}
                                        style={styles.flexGrow}
                                    >
                                        Title
                                    </Input>
                                )}
                            </FormField>

                            <FormField name="work_area" form={{ values, setField, errors }}>
                                {({ value, onChange, error }) => (
                                    <Input
                                        value={value}
                                        onChangeText={onChange}
                                        placeholder="Enter Work area"
                                        error={error}
                                        style={styles.flexGrow}
                                    >
                                        Description
                                    </Input>
                                )}
                            </FormField>

                            <View style={{ flexDirection: "row", gap: 16 }}>
                                <FormField name="start_time" form={{ values, setField, errors }}>
                                    {({ value, onChange, error }) => (
                                        <Input
                                            value={value}
                                            onChangeText={onChange}
                                            placeholder="Start time"
                                            error={error}
                                            mask='time'
                                            post
                                            style={styles.flexGrow}
                                        >
                                            Event start time
                                        </Input>
                                    )}
                                </FormField>
                                <FormField name="end_time" form={{ values, setField, errors }}>
                                    {({ value, onChange, error }) => (
                                        <Input
                                            value={value}
                                            onChangeText={onChange}
                                            placeholder="End time"
                                            error={error}
                                            mask='time'
                                            post
                                            style={styles.flexGrow}
                                        >
                                            Event end time
                                        </Input>
                                    )}
                                </FormField>
                            </View>

                            <Button disabled={!isValid} onPress={onSubmit}>Schedule</Button>
                        </View>
                    </ScrollView>
                </View>
            </View>

            {isLoading && (
                <View style={styles.overlay}>
                    <View style={styles.loaderContainer}>
                        <Loader />
                    </View>
                </View>
            )}
              <DetailsToast
        type={toastType}
        message={toastMessage}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
        </KeyboardAvoidingView>
    )
}

export default CalendarScreen

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: getColor('green', 500),
        position: "relative",
    },
    wrapper: {
        flex: 1,
        flexDirection: "column",
        gap: 16,
        backgroundColor: getColor('light', 200),
        borderTopStartRadius: 16,
        borderTopEndRadius: 16,
        padding: 16,
    },
    flexGrow: {
        flex: 1,
    },
    HStack: {
        flexDirection: "row"
    },
    VStack: {
        flexDirection: "column"
    },
    justifyBetween: {
        justifyContent: "space-between",
    },
    alignCenter: {
        alignItems: "center"
    },
    gap8: {
        gap: 8,
    },
    gap16: {
        gap: 16,
    },
    gap12: {
        gap: 12,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: getColor('green', 500, 0.1),
        zIndex: 2,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})