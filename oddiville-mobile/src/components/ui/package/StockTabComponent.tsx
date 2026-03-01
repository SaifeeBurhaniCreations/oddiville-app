import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { Dispatch, SetStateAction } from 'react'
import { B4 } from '../../typography/Typography';
import Button from '../Buttons/Button';
import ProductContextSection from './ProductContextSection';
import RawMaterialConsumptionSection from './RawMaterialConsumptionSection';
import PackingSKUSection from './PackingSKUSection';
import EmptyState, { EmptyStateStyles } from '../EmptyState';
import { useToast } from '@/src/context/ToastContext';
import { getEmptyStateData } from '@/src/utils/common';
import { PackingFormController, PackingSubmitPayload } from '@/src/hooks/packing/usePackingForm';
import { RawMaterialConsumptionSetter } from '@/src/hooks/packing/useRawMaterialConsumption';
import { ChamberStock } from '@/src/hooks/useChamberStock';

interface StockTabComponentProps {
  form: PackingFormController;

  rm: RawMaterialConsumptionSetter; 
  rmUsed: ChamberStock[]; 
  isCurrentProduct: boolean;
  setIsCurrentProduct: Dispatch<SetStateAction<boolean>>;

  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;

  isPending: boolean;

  disableButton: boolean;
  isSubmitDisabled: boolean;

  submitDisabledReason: string | null;

  showTooltip: boolean;
  setShowTooltip: Dispatch<SetStateAction<boolean>>;

  onSubmit: (data: PackingSubmitPayload) => void;

  handleOverPackChange: (key: string, value: boolean) => void;

  packingSession: number;
}

const StockTabComponent = ({
  form,
  rm,
  rmUsed,
  isCurrentProduct,
  setIsCurrentProduct,
  isLoading,
  setIsLoading,
  isPending,
  disableButton,
  isSubmitDisabled,
  submitDisabledReason,
  showTooltip,
  setShowTooltip,
  onSubmit,
  handleOverPackChange,
  packingSession,
}: StockTabComponentProps) => {
      const toast = useToast();
      const emptyStateData = getEmptyStateData("products");
    
  return (
    <View style={{ flex: 1 }}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 56 }}
              >
                <View key={packingSession} style={styles.storageColumn}>
                  <ProductContextSection
                    setIsLoading={setIsLoading}
                    form={form}
                    setIsCurrentProduct={setIsCurrentProduct}
                  />
                  <RawMaterialConsumptionSection
                    setIsLoading={setIsLoading}
                    isCurrentProduct={isCurrentProduct}
                    form={form}
                    rm={rm}
                    rmUsed={rmUsed}
                  />
                  <PackingSKUSection
                    setIsLoading={setIsLoading}
                    isCurrentProduct={isCurrentProduct}
                    form={form}
                    onOverPackChange={handleOverPackChange}
                    rmUsed={rmUsed}
                  />

                  {!isCurrentProduct && (
                    <View style={EmptyStateStyles.center}>
                      <EmptyState stateData={emptyStateData} />
                    </View>
                  )}
                </View>
              </ScrollView>
              <View style={{ paddingHorizontal: 16 }}>
                <View>
                  <Pressable
                    disabled={isSubmitDisabled || isPending}
                    onPress={() => {
                      if (disableButton) {
                        setShowTooltip(true);
                        toast.error("Not enough packets in stock");
                        return;
                      }
                      if (isSubmitDisabled) {
                        setShowTooltip(true);
                        toast.error(submitDisabledReason || "Form is invalid");
                        return;
                      }

                      const result = form.validateForm();

                      if (!result.success) {
                        setShowTooltip(true);
                        const firstError = Object.values(result.errors)[0];
                        toast.error(firstError);
                        return;
                      }

                      onSubmit(result.data);
                    }}
                  >
                    <Button
                      variant="fill"
                      interactive={false}
                      disableUi={isSubmitDisabled}
                      disabled={isPending || disableButton}
                    >
                      Pack product
                    </Button>
                  </Pressable>

                  {showTooltip && submitDisabledReason && (
                    <View style={styles.tooltip}>
                      <B4 style={styles.tooltipText}>{submitDisabledReason}</B4>
                    </View>
                  )}
                </View>
              </View>
            </View>
  )
}

export default StockTabComponent

const styles = StyleSheet.create({
    storageColumn: {
    flexDirection: "column",
    gap: 16,
    paddingTop: 20,
    flex: 1,
  },

  tooltip: {
    position: "absolute",
    bottom: 56,
    left: 0,
    right: 0,
    backgroundColor: "#000",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  tooltipText: {
    color: "#fff",
    fontSize: 12,
  },
})