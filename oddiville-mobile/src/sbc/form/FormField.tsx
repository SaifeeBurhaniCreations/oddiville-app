import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import get from 'lodash/get';

type FormFieldProps<T> = {
    name: string;
    form: {
        values: T;
        setField: (key: string, value: any) => void;
        errors: Record<string, string | undefined>;
    };
    style?: StyleProp<ViewStyle>;
    children: (field: {
        value: any;
        onChange: (val: any) => void;
        error?: string;
        style?: StyleProp<ViewStyle>;
    }) => React.ReactNode;
};

function FormField<T>({
    name,
    form,
    style,
    children,
}: FormFieldProps<T>) {
    const value = get(form.values, name);
    const error = form.errors[name];

    return children({
        value,
        onChange: (val) => form.setField(name, val),
        error,
        style,
    });
}

export default FormField;