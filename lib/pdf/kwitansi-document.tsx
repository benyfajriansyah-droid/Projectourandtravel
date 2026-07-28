import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { formatCurrency, formatDate } from "@/lib/utils";
import { amountToWords } from "@/lib/terbilang";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: "Helvetica" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    borderBottom: 2,
    borderBottomColor: "#171717",
    paddingBottom: 12,
  },
  companyName: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", textAlign: "right" },
  noText: { fontSize: 10, color: "#666666", textAlign: "right", marginTop: 4 },
  row: { flexDirection: "row", marginBottom: 8 },
  label: { width: 140, color: "#444444" },
  value: { flex: 1, fontFamily: "Helvetica-Bold" },
  amountBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
  },
  amountLabel: { fontSize: 10, color: "#666666" },
  amountValue: { fontSize: 20, fontFamily: "Helvetica-Bold", marginTop: 2 },
  terbilang: { fontSize: 10, fontStyle: "italic", marginTop: 4, color: "#444444" },
  footer: { marginTop: 48, flexDirection: "row", justifyContent: "flex-end" },
  signBox: { width: 180, textAlign: "center" },
  signLine: { marginTop: 48, borderTop: 1, borderTopColor: "#171717", paddingTop: 4 },
});

export interface KwitansiData {
  id: string;
  date: Date;
  amount: number;
  category: string | null;
  note: string | null;
  method: string | null;
  participantName: string | null;
  tripName: string | null;
  departureDateLabel: string | null;
}

export function renderKwitansiPdf(data: KwitansiData): Promise<Buffer> {
  const untuk =
    [data.category, data.tripName, data.departureDateLabel]
      .filter(Boolean)
      .join(" — ") || "-";

  return renderToBuffer(
    <Document>
      <Page size="A5" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.companyName}>Tour & Travel Ops</Text>
          <View>
            <Text style={styles.title}>KWITANSI</Text>
            <Text style={styles.noText}>
              No. {data.id.slice(0, 10).toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Tanggal</Text>
          <Text style={styles.value}>{formatDate(data.date)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Telah terima dari</Text>
          <Text style={styles.value}>{data.participantName ?? "-"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Untuk pembayaran</Text>
          <Text style={styles.value}>{untuk}</Text>
        </View>
        {data.method && (
          <View style={styles.row}>
            <Text style={styles.label}>Metode</Text>
            <Text style={styles.value}>{data.method}</Text>
          </View>
        )}
        {data.note && (
          <View style={styles.row}>
            <Text style={styles.label}>Catatan</Text>
            <Text style={styles.value}>{data.note}</Text>
          </View>
        )}

        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Jumlah</Text>
          <Text style={styles.amountValue}>{formatCurrency(data.amount)}</Text>
          <Text style={styles.terbilang}>{amountToWords(data.amount)}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.signBox}>
            <Text>Penerima,</Text>
            <Text style={styles.signLine}> </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

