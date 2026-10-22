
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";

const API_URL = "http://10.203.200.16:5000";

type Loan = {
  id: number;
  friend_name: string;
  amount: string;
  due_date: string;
  status: "pending" | "repaid";
};

export default function HomeScreen() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [friendName, setFriendName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [summary, setSummary] = useState({
    total_lent: "0",
    total_repaid: "0",
    overdue_amount: "0",
  });

  async function request(path: string, options?: RequestInit) {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.details || data.error || "Request failed");
    return data;
  }

  async function sendOtp() {
    try {
      await request("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });
      setOtpSent(true);
      Alert.alert("OTP sent", "Check the backend terminal for the demo OTP.");
    } catch (error) {
      Alert.alert("Error", String(error));
    }
  }

  async function verifyOtp() {
    try {
      await request("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ phone, otp }),
      });
      setLoggedIn(true);
      await refreshData();
    } catch (error) {
      Alert.alert("Login failed", String(error));
    }
  }

  async function refreshData() {
    try {
      const [loanData, summaryData] = await Promise.all([
        request("/api/loans"),
        request("/api/summary"),
      ]);
      setLoans(loanData);
      setSummary(summaryData);
    } catch (error) {
      Alert.alert("Could not load loans", String(error));
    }
  }

  async function addLoan() {
    try {
      await request("/api/loans", {
        method: "POST",
        body: JSON.stringify({
          friendName,
          amount: Number(amount),
          dueDate,
        }),
      });
      setFriendName("");
      setAmount("");
      setDueDate("");
      setShowForm(false);
      await refreshData();
      Alert.alert("Success", "Loan added!");
    } catch (error) {
      Alert.alert("Could not add loan", String(error));
    }
  }

  async function markRepaid(id: number) {
    try {
      await request(`/api/loans/${id}/repay`, { method: "PATCH" });
      await refreshData();
    } catch (error) {
      Alert.alert("Could not update loan", String(error));
    }
  }

  if (!loggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginCard}>
          <Text style={styles.logo}>MiniLedger</Text>
          <Text style={styles.subtitle}>Keep track of money lent to friends</Text>
          <Text style={styles.label}>Phone number</Text>
          <TextInput
            style={styles.input}
            placeholder="10-digit phone number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          {otpSent && (
            <>
              <Text style={styles.label}>Demo OTP</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit OTP"
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
                maxLength={6}
              />
            </>
          )}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={otpSent ? verifyOtp : sendOtp}
          >
            <Text style={styles.buttonText}>
              {otpSent ? "Verify OTP" : "Send OTP"}
            </Text>
          </TouchableOpacity>
          <Text style={styles.hint}>Demo OTP appears in your backend terminal.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.logo}>MiniLedger</Text>
        <Text style={styles.subtitle}>Your personal lending tracker</Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total lent</Text>
            <Text style={styles.summaryValue}>₹{Number(summary.total_lent).toFixed(0)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Repaid</Text>
            <Text style={styles.summaryValue}>₹{Number(summary.total_repaid).toFixed(0)}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Overdue amount</Text>
          <Text style={[styles.summaryValue, { color: "#DC2626" }]}>
            ₹{Number(summary.overdue_amount).toFixed(0)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setShowForm(!showForm)}
        >
          <Text style={styles.buttonText}>
            {showForm ? "Cancel" : "+ Add a loan"}
          </Text>
        </TouchableOpacity>

        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.label}>Friend's name</Text>
            <TextInput style={styles.input} value={friendName} onChangeText={setFriendName} placeholder="e.g. Rahul" />
            <Text style={styles.label}>Amount (₹)</Text>
            <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="1500" />
            <Text style={styles.label}>Due date (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} value={dueDate} onChangeText={setDueDate} placeholder="2026-12-31" />
            <TouchableOpacity style={styles.primaryButton} onPress={addLoan}>
              <Text style={styles.buttonText}>Save loan</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Your loans</Text>
          <TouchableOpacity onPress={refreshData}>
            <Text style={styles.refresh}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {loans.map((loan) => {
          const overdue =
            loan.status === "pending" &&
            new Date(loan.due_date) < new Date(new Date().toDateString());

          return (
            <View
              key={loan.id}
              style={[styles.loanCard, overdue && styles.overdueCard]}
            >
              <View style={styles.loanTop}>
                <Text style={styles.friendName}>{loan.friend_name}</Text>
                <Text style={styles.loanAmount}>₹{Number(loan.amount).toFixed(0)}</Text>
              </View>
              <Text style={styles.loanDetail}>Due: {String(loan.due_date).slice(0, 10)}</Text>
              <Text style={[styles.status, overdue && { color: "#DC2626" }]}>
                {loan.status === "repaid" ? "Repaid" : overdue ? "OVERDUE" : "Pending"}
              </Text>
              {loan.status === "pending" && (
                <TouchableOpacity
                  style={styles.repaidButton}
                  onPress={() => markRepaid(loan.id)}
                >
                  <Text style={styles.repaidButtonText}>Mark as repaid</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {loans.length === 0 && (
          <Text style={styles.empty}>No loans yet. Add your first loan!</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FB" },
  content: { padding: 20, paddingBottom: 40 },
  loginCard: { margin: 22, marginTop: 70, backgroundColor: "#FFFFFF", padding: 24, borderRadius: 20 },
  logo: { fontSize: 30, fontWeight: "800", color: "#2563EB", marginBottom: 6 },
  subtitle: { color: "#64748B", fontSize: 14, marginBottom: 24 },
  summaryRow: { flexDirection: "row", gap: 12 },
  summaryCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 12 },
  summaryLabel: { color: "#64748B", fontSize: 13, marginBottom: 8 },
  summaryValue: { color: "#0F172A", fontSize: 23, fontWeight: "800" },
  primaryButton: { backgroundColor: "#2563EB", padding: 15, borderRadius: 12, alignItems: "center", marginVertical: 10 },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  label: { color: "#334155", fontWeight: "600", marginBottom: 7, marginTop: 8 },
  input: { borderWidth: 1, borderColor: "#CBD5E1", backgroundColor: "#FFFFFF", borderRadius: 10, padding: 13, marginBottom: 8, color: "#0F172A" },
  hint: { textAlign: "center", color: "#64748B", fontSize: 12, marginTop: 12 },
  formCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginVertical: 12 },
  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14, marginBottom: 10 },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: "#0F172A" },
  refresh: { color: "#2563EB", fontWeight: "700" },
  loanCard: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  overdueCard: { borderColor: "#DC2626", backgroundColor: "#FEF2F2" },
  loanTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  friendName: { fontSize: 17, fontWeight: "700", color: "#0F172A" },
  loanAmount: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
  loanDetail: { color: "#64748B", marginTop: 8 },
  status: { color: "#D97706", fontWeight: "700", marginTop: 8 },
  repaidButton: { backgroundColor: "#DCFCE7", borderRadius: 9, padding: 11, alignItems: "center", marginTop: 12 },
  repaidButtonText: { color: "#166534", fontWeight: "700" },
  empty: { textAlign: "center", color: "#64748B", padding: 25 },
});
