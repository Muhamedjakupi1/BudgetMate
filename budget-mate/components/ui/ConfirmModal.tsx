import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'

type ConfirmModalProps = {
  visible: boolean;
  type?: "success" | "error";
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  showConfirm?: boolean;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    visible,
    type = "success",
    message,
    onClose,
    onConfirm,
    showConfirm
}) => {
    const isSuccess = type === "success"
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={[styles.box, isSuccess ? styles.successBox : styles.errorBox]}>
                    <Text style={styles.title}>{isSuccess ? "Success" : "Error"}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.buttons}>
                        {showConfirm && onConfirm && (
                            <TouchableOpacity onPress={() => {
                                onConfirm();
                                onClose();
                            }} style={[styles.btn, isSuccess ? styles.successBtn : styles.errorBtn]}>
                            <Text style={[styles.btnText]}>Confirm</Text>
                        </TouchableOpacity>)}
                        <TouchableOpacity onPress={onClose} style={[styles.btn, { backgroundColor: "gray" }]}>
                            <Text style={styles.btnText}>{showConfirm ? "Cancel" : "OK"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default ConfirmModal

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    box: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 12,
        width: "75%",
        alignItems: "center",
        borderWidth: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: "center",
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "center",
    },
    btn: {
        paddingVertical: 8,
        paddingHorizontal: 25,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    btnText: {
        color: "white",
        fontWeight: "bold",
    },

    successBox: { borderColor: "#28a745" },
    successText: { color: "#28a745" },
    successBtn: { backgroundColor: "#28a745" },
  
    errorBox: { borderColor: "#dc3545" },
    errorText: { color: "#dc3545" },
    errorBtn: { backgroundColor: "#dc3545" },
});