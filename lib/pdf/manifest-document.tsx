import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { formatDate } from "@/lib/utils";
import { PAYMENT_STATUS_LABEL } from "@/lib/labels";
import type { CompanyProfile } from "@/lib/settings";

const BRAND = "#2563eb";

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 9, fontFamily: "Helvetica", color: "#171717" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: 2,
    borderBottomColor: BRAND,
    paddingBottom: 10,
    marginBottom: 12,
  },
  companyName: { fontSize: 13, fontFamily: "Helvetica-Bold", color: BRAND },
  companyMeta: { fontSize: 8, color: "#666666", marginTop: 2 },
  title: { fontSize: 14, fontFamily: "Helvetica-Bold", textAlign: "right" },
  subtitle: { fontSize: 9, color: "#666666", textAlign: "right", marginTop: 2 },
  infoBar: {
    flexDirection: "row",
    gap: 16,
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 3,
    marginBottom: 12,
  },
  infoLabel: { fontSize: 7, color: "#888888", textTransform: "uppercase" },
  infoValue: { fontSize: 9, fontFamily: "Helvetica-Bold", marginTop: 1 },
  tableHead: {
    flexDirection: "row",
    backgroundColor: "#eff6ff",
    borderBottom: 1,
    borderBottomColor: BRAND,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  th: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#1e40af" },
  tr: {
    flexDirection: "row",
    borderBottom: 0.5,
    borderBottomColor: "#e5e5e5",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  cNo: { width: 22 },
  cName: { flex: 2.2 },
  cPhone: { flex: 1.5 },
  cId: { flex: 1.6 },
  cEmergency: { flex: 1.6 },
  cStatus: { width: 48, textAlign: "right" },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 28,
    right: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: "#999999",
    borderTop: 0.5,
    borderTopColor: "#e5e5e5",
    paddingTop: 6,
  },
});

export interface ManifestParticipant {
  name: string;
  phone: string;
  idNumber: string | null;
  emergencyContact: string | null;
  paymentStatus: string;
}

export interface ManifestData {
  tripName: string;
  destination: string;
  departureDate: Date;
  returnDate: Date;
  participants: ManifestParticipant[];
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function renderManifestPdf(
  data: ManifestData,
  company: CompanyProfile
): Promise<Buffer> {
  const contact = [company.phone, company.email].filter(Boolean).join("  ·  ");

  return renderToBuffer(
    <Document title={`Manifest ${data.tripName}`} author={company.companyName}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={{ maxWidth: 280 }}>
            <Text style={styles.companyName}>{company.companyName}</Text>
            {company.address && (
              <Text style={styles.companyMeta}>{company.address}</Text>
            )}
            {contact && <Text style={styles.companyMeta}>{contact}</Text>}
          </View>
          <View>
            <Text style={styles.title}>MANIFEST PESERTA</Text>
            <Text style={styles.subtitle}>{data.tripName}</Text>
          </View>
        </View>

        <View style={styles.infoBar}>
          <Info label="Destinasi" value={data.destination} />
          <Info label="Berangkat" value={formatDate(data.departureDate)} />
          <Info label="Kembali" value={formatDate(data.returnDate)} />
          <Info label="Total Peserta" value={`${data.participants.length} pax`} />
        </View>

        <View style={styles.tableHead}>
          <Text style={[styles.th, styles.cNo]}>No</Text>
          <Text style={[styles.th, styles.cName]}>Nama Peserta</Text>
          <Text style={[styles.th, styles.cPhone]}>Telepon</Text>
          <Text style={[styles.th, styles.cId]}>No. Identitas</Text>
          <Text style={[styles.th, styles.cEmergency]}>Kontak Darurat</Text>
          <Text style={[styles.th, styles.cStatus]}>Bayar</Text>
        </View>

        {data.participants.map((p, i) => (
          <View key={i} style={styles.tr} wrap={false}>
            <Text style={styles.cNo}>{i + 1}</Text>
            <Text style={styles.cName}>{p.name}</Text>
            <Text style={styles.cPhone}>{p.phone}</Text>
            <Text style={styles.cId}>{p.idNumber ?? "-"}</Text>
            <Text style={styles.cEmergency}>{p.emergencyContact ?? "-"}</Text>
            <Text style={styles.cStatus}>
              {PAYMENT_STATUS_LABEL[p.paymentStatus] ?? p.paymentStatus}
            </Text>
          </View>
        ))}

        {data.participants.length === 0 && (
          <Text style={{ marginTop: 16, color: "#888888" }}>
            Belum ada peserta terdaftar.
          </Text>
        )}

        <View style={styles.footer} fixed>
          <Text>
            Dicetak {formatDate(new Date())} — {company.companyName}
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Halaman ${pageNumber} dari ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
