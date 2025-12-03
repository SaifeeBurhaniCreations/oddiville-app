import { RootState } from '@/src/redux/store'
import Input from '../Inputs/Input'
import { InputComponentProps } from '@/src/types/bottomSheet'
import { StyleSheet, View } from 'react-native'
import {  useSelector } from 'react-redux'
import { useGlobalFormValidator } from '@/src/sbc/form/globalFormInstance'
import { AddPackageSizeForm, AddProductPackageForm } from './InputWithSelectComponent'

export type AddPackageQuantityForm = {
  quantity: string;
};

const InputComponent: React.FC<InputComponentProps> = ({ data, color }) => {
  const { label, placeholder, addon, keyboardType = "default", formField } = data;
  const { meta } = useSelector((state: RootState) => state.bottomSheet);

  const packageFormValidator = useGlobalFormValidator<AddProductPackageForm>("add-product-package");

  const packageSizeValidator = useGlobalFormValidator<AddPackageSizeForm>("add-package-size");

  const packageQuantityForm = useGlobalFormValidator<AddPackageQuantityForm>("add-package-quantity");
  

  const { values, errors, setField } =
        meta?.type === "add-product-package" ? packageFormValidator : meta?.type === "add-package" ? packageSizeValidator : packageQuantityForm;

  if (label) {
    return (
      <View style={styles.container}>
        <Input
          value={values[formField as any] || ""}
          placeholder={placeholder ? placeholder : "Enter something... "}
          addonText={addon}
          onChangeText={(val: string) => {setField(formField as any, val)}}
          style={styles.input}
          keyboardType={keyboardType}
          error={errors[formField as any] && errors[formField as any]}
        >
          {label}
        </Input>
      </View>
    )
  } else {
    return (
      <View style={styles.container}>
        <Input
          value={values[formField as any] || ""}
          placeholder={placeholder ? placeholder : "Enter something... "}
          addonText={addon}
          onChangeText={(val: string) => setField(formField as any, val)}
          error={errors[formField as any] && errors[formField as any]}
          style={styles.input}
        />
      </View>
    )
  }
}

export default InputComponent

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  input: {
    marginBottom: 0,
  }
})