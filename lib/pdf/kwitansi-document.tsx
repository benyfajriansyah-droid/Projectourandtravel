import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { formatCurrency, formatDate } from "@/lib/utils";
import { amountToWords } from "@/lib/terbilang";
import type { CompanyProfile } from "@/lib/settings";

const BRAND = "#2563eb";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#171717" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: BRAND,
    paddingBottom: 12,
  },
  companyName: { fontSize: 15, fontFamily: "Helvetica-Bold", color: BRAND },
  companyMeta: { fontSize: 8, color: "#666666", marginTop: 3, lineHeight: 1.4 },
  title: { fontSize: 17, fontFamily: "Helvetica-Bold", textAlign: "right" },
  noText: { fontSize: 9, color: "#666666", textAlign: "right", marginTop: 3 },
  row: { flexDirection: "row", marginBottom: 7 },
  label: { width: 120, color: "#555555" },
  value: { flex: 1, fontFamily: "Helvetica-Bold" },
  amountBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: "#eff6ff",
    borderRadius: 4,
    borderLeft: 3,
    borderLeftColor: BRAND,
  },
  amountLabel: { fontSize: 9, color: "#666666" },
  amountValue: {
    fontSize: 19,
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
    color: BRAND,
  },
  terbilang: {
    fontSize: 9,
    fontStyle: "italic",
    marginTop: 4,
    color: "#444444",
  },
  footer: { marginTop: 40, flexDirection: "row", justifyContent: "space-between" },
  footerNote: { fontSize: 8, color: "#888888", maxWidth: 220 },
  signBox: { width: 170, textAlign: "center" },
  signLine: {
    marginTop: 44,
    borderTop: 1,
    borderTopColor: "#171717",
    paddingTop: 4,
    fontSize: 9,
  },
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

export function renderKwitansiPdf(
  data: KwitansiData,
  company: CompanyProfile
): Promise<Buffer> {
  const untuk =
    [data.category, data.tripName, data.departureDateLabel]
      .filter(Boolean)
      .join(" — ") || "-";

  const contact = [company.phone, company.email, company.website]
    .filter(Boolean)
    .join("  ·  ");

  return renderToBuffer(
    <Document
      title={`Kwitansi ${data.id.slice(0, 10).toUpperCase()}`}
      author={company.companyName}
    >
      <Page size="A5" style={styles.page}>
        <View style={styles.header}>
          <View style={{ maxWidth: 230 }}>
            <Text style={styles.companyName}>{company.companyName}</Text>
            {company.address && (
              <Text style={styles.companyMeta}>{company.address}</Text>
            )}
            {contact && <Text style={styles.companyMeta}>{contact}</Text>}
          </View>
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
          <Text style={styles.footerNote}>{company.footerNote ?? ""}</Text>
          <View style={styles.signBox}>
            <Text>Penerima,</Text>
            <Text style={styles.signLine}>{company.companyName}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
