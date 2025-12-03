import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Button from '../Buttons/Button';
import { B1, B2, H2 } from '../../typography/Typography';
import { ModalProps } from '@/src/types';
import CrossIcon from '../../icons/page/CrossIcon';
import { getColor } from '@/src/constants/colors';

const Modal = ({ showPopup, setShowPopup, modalData, markdown }: ModalProps) => {

    const closePopup = () => setShowPopup(false);
    const { title = "", description = "", type, buttons = [], extraDetails = null } = modalData;

    return (
        <View style={[styles.popupOverlay, !showPopup && styles.dNone]}>
            <View style={styles.popup}>
                <View style={styles.popupHeader}>
                    <View style={styles.flexWrap}>
                        <H2>{title}</H2>
                       <View style={[{justifyContent: "center",  flexWrap: "wrap",
        width: "100%"}]}>
                       {
                            description && <B2 color={getColor(type === "danger" ? "red" : "green", 400)} style={[styles.flexWrap, {backgroundColor: getColor("red", 100, 0.5), borderWidth: 1, borderColor: "red", marginTop: 12, padding: 8, borderRadius: 8}]}>
                            {description}
                        </B2>
                        }
                       </View>
                    </View>
                    <TouchableOpacity onPress={closePopup}>
                        <CrossIcon size={20} color={getColor("green", 700)} />
                    </TouchableOpacity>
                </View>
                {
                    extraDetails && <View style={styles.popupBody}>
                        {extraDetails}
                    </View>
                }
                <View style={styles.popupFooter}>
                    {buttons?.length > 0 && buttons?.map((btn, index) => (
                        <Button
                            key={index}
                            color={type === "danger" ? "red" : btn.color ?? "green"}
                            onPress={() => {
                                closePopup();
                                btn.action?.();
                            }}
                            variant={btn.variant || "fill"}
                        >
                            {btn.label}
                        </Button>
                    ))}
                </View>
            </View>
        </View>
    )
}

export default Modal

const styles = StyleSheet.create({

    popupOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#00110DB2",
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3,
        paddingHorizontal: 16,

    },
    popup: {
        width: "100%",
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        gap: 24,
        flexDirection: "column",
        alignItems: 'flex-end',
    },
    popupHeader: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start"
    },
    popupBody: {
        width: "100%",
        flexDirection: "column",
        gap: 12
    },
    popupFooter: {
        flexDirection: 'row',
        gap: 24,
        alignItems: "center",

    },
    dNone: {
        display: "none"
    },
    flexWrap: {
        flexWrap: "wrap",
        width: "96%"
    }
})