import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { LoadingState, ErrorState } from "@/components/LoadingState";
import { useColors } from "@/hooks/useColors";
import { useFees, useRecordPayment, ApiFee } from "@/hooks/useApi";

function FeeRow({ fee, onCollect }: { fee: ApiFee; onCollect: (fee: ApiFee) => void }) {
  const colors = useColors();
  const remaining = fee.amount - fee.paid;
  const statusMap = {
    paid: { color: colors.success, bg: colors.successLight, label: "Paid" },
    pending: { color: colors.warning, bg: colors.warningLight, label: "Pending" },
    overdue: { color: colors.danger, bg: colors.dangerLight, label: "Overdue" },
  };
  const s = statusMap[fee.status];

  return (
    <View style={[styles.feeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.feeTop}>
        <View style={styles.feeLeft}>
          <Text style={[styles.feeName, { color: colors.foreground }]}>{fee.studentName}</Text>
          <Text style={[styles.feeMonth, { color: colors.mutedForeground }]}>{fee.month}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: s.bg }]}>
          <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
        </View>
      </View>

      <View style={styles.feeAmounts}>
        <View>
          <Text style={[styles.amountLabel, { color: colors.mutedForeground }]}>Total</Text>
          <Text style={[styles.amountValue, { color: colors.foreground }]}>₹{fee.amount.toLocaleString("en-IN")}</Text>
        </View>
        {fee.paid > 0 && (
          <View>
            <Text style={[styles.amountLabel, { color: colors.mutedForeground }]}>Paid</Text>
            <Text style={[styles.amountValue, { color: colors.success }]}>₹{fee.paid.toLocaleString("en-IN")}</Text>
          </View>
        )}
        {remaining > 0 && (
          <View>
            <Text style={[styles.amountLabel, { color: colors.mutedForeground }]}>Remaining</Text>
            <Text style={[styles.amountValue, { color: s.color }]}>₹{remaining.toLocaleString("en-IN")}</Text>
          </View>
        )}
      </View>

      <View style={styles.feeBottom}>
        <View style={styles.dueRow}>
          <Feather name="calendar" size={12} color={colors.mutedForeground} />
          <Text style={[styles.dueText, { color: colors.mutedForeground }]}>Due {fee.dueDate}</Text>
        </View>
        {fee.status !== "paid" && (
          <TouchableOpacity
            style={[styles.collectBtn, { backgroundColor: colors.primary }]}
            onPress={() => onCollect(fee)}
            activeOpacity={0.8}
          >
            <Feather name="dollar-sign" size={13} color="#fff" />
            <Text style={styles.collectBtnText}>Collect</Text>
          </TouchableOpacity>
        )}
        {fee.status === "paid" && (
          <View style={[styles.paidChip, { backgroundColor: colors.successLight }]}>
            <Feather name="check-circle" size={13} color={colors.success} />
            <Text style={[styles.paidText, { color: colors.success }]}>Collected {fee.paidDate}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function CollectModal({
  fee,
  onClose,
  onSubmit,
  submitting,
}: {
  fee: ApiFee;
  onClose: () => void;
  onSubmit: (amount: number, method: string) => void;
  submitting: boolean;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState(String(fee.amount - fee.paid));
  const [method, setMethod] = useState<"cash" | "upi" | "bank">("cash");

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.sheetHandle} />
          <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Collect Payment</Text>
          <Text style={[styles.sheetSub, { color: colors.mutedForeground }]}>
            {fee.studentName} · {fee.month}
          </Text>

          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Amount (₹)</Text>
          <TextInput
            style={[styles.fieldInput, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground }]}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="Enter amount"
            placeholderTextColor={colors.mutedForeground}
            editable={!submitting}
          />

          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Payment Method</Text>
          <View style={styles.methods}>
            {(["cash", "upi", "bank"] as const).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.methodChip, {
                  backgroundColor: method === m ? colors.primary : colors.secondary,
                  borderColor: method === m ? colors.primary : colors.border,
                }]}
                onPress={() => setMethod(m)}
                disabled={submitting}
              >
                <Text style={[styles.methodText, { color: method === m ? "#fff" : colors.foreground }]}>
                  {m.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: submitting ? colors.mutedForeground : colors.primary }]}
            onPress={() => {
              const a = parseFloat(amount);
              if (!a || a <= 0) return;
              onSubmit(a, method);
            }}
            activeOpacity={0.85}
            disabled={submitting}
          >
            <Text style={styles.submitBtnText}>{submitting ? "Recording…" : "Confirm Payment"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn} disabled={submitting}>
            <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function FeesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<"all" | "pending" | "overdue" | "paid">("all");
  const [collectFee, setCollectFee] = useState<ApiFee | null>(null);

  const {
    data: allFees = [],
    isLoading,
    isError,
    refetch,
  } = useFees();

  const { mutateAsync: recordPayment, isPending: submitting } = useRecordPayment();

  const fees = useMemo(() => {
    if (filter === "all") return allFees;
    return allFees.filter((f) => f.status === filter);
  }, [allFees, filter]);

  const totalPending = useMemo(
    () => allFees.filter((f) => f.status !== "paid").reduce((s, f) => s + (f.amount - f.paid), 0),
    [allFees]
  );

  const extraPad = Platform.OS === "web" ? 67 : 0;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom;

  if (isLoading && !allFees.length) return <LoadingState message="Loading fees…" />;
  if (isError && !allFees.length) return <ErrorState onRetry={refetch} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {collectFee && (
        <CollectModal
          fee={collectFee}
          submitting={submitting}
          onClose={() => setCollectFee(null)}
          onSubmit={async (amount, method) => {
            try {
              await recordPayment({ feeId: collectFee.id, amount, method });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setCollectFee(null);
              Alert.alert(
                "Payment Recorded",
                `₹${amount.toLocaleString("en-IN")} via ${method.toUpperCase()} recorded for ${collectFee.studentName}`
              );
            } catch (e: any) {
              Alert.alert("Error", e.message || "Could not record payment. Try again.");
            }
          }}
        />
      )}

      <FlatList
        data={fees}
        keyExtractor={(f) => f.id}
        renderItem={({ item }) => (
          <FeeRow
            fee={item}
            onCollect={(f) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setCollectFee(f);
            }}
          />
        )}
        contentContainerStyle={[styles.list, { paddingTop: extraPad + 8, paddingBottom: bottomPad + 90 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <View>
            <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
              <Text style={styles.summaryLabel}>Total Outstanding</Text>
              <Text style={styles.summaryValue}>₹{totalPending.toLocaleString("en-IN")}</Text>
            </View>
            <View style={styles.filters}>
              {(["all", "pending", "overdue", "paid"] as const).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.chip, {
                    backgroundColor: filter === f ? colors.primary : colors.card,
                    borderColor: filter === f ? colors.primary : colors.border,
                  }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(f); }}
                >
                  <Text style={[styles.chipText, { color: filter === f ? "#fff" : colors.foreground }]}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={<EmptyState icon="check-circle" title="All clear!" subtitle="No fees in this category" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16 },
  summaryCard: { borderRadius: 16, padding: 20, marginBottom: 16 },
  summaryLabel: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontFamily: "Inter_400Regular" },
  summaryValue: { color: "#fff", fontSize: 32, fontFamily: "Inter_700Bold", letterSpacing: -1, marginTop: 4 },
  filters: { flexDirection: "row", gap: 8, marginBottom: 12, flexWrap: "wrap" },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  feeCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12, gap: 12 },
  feeTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  feeLeft: { gap: 2 },
  feeName: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  feeMonth: { fontSize: 12, fontFamily: "Inter_400Regular" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  feeAmounts: { flexDirection: "row", gap: 20 },
  amountLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 2 },
  amountValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  feeBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dueRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  dueText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  collectBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  collectBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  paidChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  paidText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#E2E8F0", alignSelf: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 4 },
  sheetSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  fieldInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontFamily: "Inter_400Regular", marginBottom: 16 },
  methods: { flexDirection: "row", gap: 10, marginBottom: 24 },
  methodChip: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  methodText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  submitBtn: { borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  submitBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  cancelBtn: { marginTop: 12, alignItems: "center" },
  cancelText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
