import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LoadingState } from "@/components/LoadingState";
import { useColors } from "@/hooks/useColors";
import { useParentFees, useParentChildren } from "@/hooks/useApi";

const TUTOR_WHATSAPP = "919876543210";

export default function ParentFeesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const { data: fees = [], isLoading: feesLoading, refetch: refetchFees } = useParentFees();
  const { data: children = [], isLoading: childrenLoading, refetch: refetchChildren } = useParentChildren();

  const isLoading = feesLoading || childrenLoading;
  const onRefresh = () => { refetchFees(); refetchChildren(); };

  const extraPad = Platform.OS === "web" ? 67 : 0;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom;

  const totalDue = fees.filter((f) => f.status !== "paid").reduce((sum, f) => sum + (f.amount - f.paid), 0);

  const contactTutor = (msg?: string) => {
    const text = msg ? encodeURIComponent(msg) : encodeURIComponent("Hi, I have a question about the fee payment.");
    Linking.openURL(`https://wa.me/${TUTOR_WHATSAPP}?text=${text}`);
  };

  if (isLoading && !fees.length) return <LoadingState message="Loading fees…" />;

  const s = innerStyles(colors);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[s.container, { paddingTop: extraPad + 16, paddingBottom: bottomPad + 100 }]}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[s.title, { color: colors.foreground }]}>Fees</Text>

      {totalDue > 0 ? (
        <View style={[s.dueBanner, { backgroundColor: colors.dangerLight, borderColor: colors.danger + "40" }]}>
          <Feather name="alert-circle" size={20} color={colors.danger} />
          <View style={{ flex: 1 }}>
            <Text style={[s.dueAmount, { color: colors.danger }]}>₹{totalDue.toLocaleString("en-IN")} total due</Text>
            <Text style={[s.dueSubtitle, { color: colors.danger + "cc" }]}>Please pay before the due date to avoid a late fee.</Text>
          </View>
        </View>
      ) : (
        <View style={[s.dueBanner, { backgroundColor: colors.successLight, borderColor: colors.success + "40" }]}>
          <Feather name="check-circle" size={20} color={colors.success} />
          <Text style={[s.dueAmount, { color: colors.success }]}>All fees paid — thank you!</Text>
        </View>
      )}

      {children.map((child) => {
        const childFees = fees.filter((f) => f.studentId === child.id);
        if (childFees.length === 0) return null;
        return (
          <View key={child.id} style={s.childSection}>
            <Text style={[s.childName, { color: colors.foreground }]}>{child.name}</Text>
            <Text style={[s.childGrade, { color: colors.mutedForeground }]}>{child.grade} Grade</Text>
            {childFees.map((fee) => {
              const due = fee.amount - fee.paid;
              const isPaid = fee.status === "paid";
              const isOverdue = fee.status === "overdue";
              const badgeColor = isPaid ? colors.success : isOverdue ? colors.danger : colors.warning;
              const badgeBg = isPaid ? colors.successLight : isOverdue ? colors.dangerLight : colors.warningLight;
              return (
                <View key={fee.id} style={[s.feeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={s.feeTop}>
                    <View>
                      <Text style={[s.feeMonth, { color: colors.foreground }]}>{fee.month}</Text>
                      <Text style={[s.feeDueDate, { color: colors.mutedForeground }]}>
                        {isPaid ? `Paid on ${fee.paidDate}` : `Due by ${fee.dueDate}`}
                      </Text>
                    </View>
                    <View style={[s.feeBadge, { backgroundColor: badgeBg }]}>
                      <Text style={[s.feeBadgeText, { color: badgeColor }]}>
                        {isPaid ? "Paid" : isOverdue ? "Overdue" : "Pending"}
                      </Text>
                    </View>
                  </View>
                  <View style={s.feeAmounts}>
                    <View style={s.feeAmountItem}>
                      <Text style={[s.amountLabel, { color: colors.mutedForeground }]}>Total</Text>
                      <Text style={[s.amountValue, { color: colors.foreground }]}>₹{fee.amount.toLocaleString("en-IN")}</Text>
                    </View>
                    {fee.paid > 0 && !isPaid && (
                      <View style={s.feeAmountItem}>
                        <Text style={[s.amountLabel, { color: colors.mutedForeground }]}>Paid</Text>
                        <Text style={[s.amountValue, { color: colors.success }]}>₹{fee.paid.toLocaleString("en-IN")}</Text>
                      </View>
                    )}
                    {!isPaid && (
                      <View style={s.feeAmountItem}>
                        <Text style={[s.amountLabel, { color: colors.mutedForeground }]}>Balance</Text>
                        <Text style={[s.amountValue, { color: badgeColor }]}>₹{due.toLocaleString("en-IN")}</Text>
                      </View>
                    )}
                  </View>
                  {!isPaid && (
                    <TouchableOpacity
                      style={[s.payBtn, { backgroundColor: "#25D366" }]}
                      onPress={() => contactTutor(`Hi, I want to pay the fee of ₹${due.toLocaleString("en-IN")} for ${child.name} (${fee.month}).`)}
                      activeOpacity={0.85}
                    >
                      <Feather name="message-circle" size={16} color="#fff" />
                      <Text style={s.payBtnText}>Contact to Pay (WhatsApp)</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        );
      })}

      <TouchableOpacity style={[s.contactBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => contactTutor()} activeOpacity={0.8}>
        <Feather name="phone" size={16} color={colors.primary} />
        <Text style={[s.contactBtnText, { color: colors.primary }]}>Contact Tutor for fee queries</Text>
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const innerStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { paddingHorizontal: 16 },
    title: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 16 },
    dueBanner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 20 },
    dueAmount: { fontSize: 16, fontFamily: "Inter_700Bold" },
    dueSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
    childSection: { marginBottom: 20 },
    childName: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 2 },
    childGrade: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 10 },
    feeCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 10, gap: 14 },
    feeTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    feeMonth: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
    feeDueDate: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
    feeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    feeBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
    feeAmounts: { flexDirection: "row", gap: 20 },
    feeAmountItem: { gap: 2 },
    amountLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
    amountValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
    payBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 12, borderRadius: 12 },
    payBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
    contactBtn: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
    contactBtnText: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  });
