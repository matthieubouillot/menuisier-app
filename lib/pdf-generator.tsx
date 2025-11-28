import React from "react"
import { renderToStream } from "@react-pdf/renderer"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import { formatCurrency, formatDate, formatClientName } from "./utils"

interface DevisData {
  number: string
  title: string
  description?: string | null
  createdAt: Date
  validUntil?: Date | null
  totalHT: number
  totalTTC: number
  tvaRate: number
  advancePayment?: number | null
  paymentTerms?: string | null
  isVatApplicable: boolean
  items: Array<{
    description: string
    quantity: number
    unit: string
    unitPrice: number
    total: number
  }>
  user: {
    name?: string | null
    companyName?: string | null
    address?: string | null
    city?: string | null
    postalCode?: string | null
    phone?: string | null
    email?: string | null
    siret?: string | null
    rcs?: string | null
    vatNumber?: string | null
  }
  client: {
    firstName?: string | null
    lastName?: string | null
    companyName?: string | null
    address?: string | null
    city?: string | null
    postalCode?: string | null
    email?: string | null
    phone?: string | null
  } | null
}

const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontSize: 9,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    fontWeight: "bold",
    width: 120,
  },
  value: {
    flex: 1,
  },
  table: {
    marginTop: 10,
    marginBottom: 18,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    padding: 6,
    fontWeight: "bold",
    fontSize: 8,
  },
  tableRow: {
    flexDirection: "row",
    padding: 6,
    borderBottom: "1pt solid #e0e0e0",
    fontSize: 8,
  },
  tableCell: {
    flex: 1,
  },
  totals: {
    marginTop: 0,
    marginLeft: "auto",
    width: 200,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalLabel: {
    fontWeight: "bold",
    fontSize: 9,
  },
  totalValue: {
    fontWeight: "bold",
    fontSize: 9,
  },
  legal: {
    marginTop: 0,
    fontSize: 8,
    lineHeight: 1.4,
  },
})

const DevisPDFDocument = ({ devis }: { devis: DevisData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>DEVIS</Text>

      <View style={{ ...styles.section, alignItems: "center", marginBottom: 20 }}>
        <Text style={{ fontSize: 12, marginBottom: 6 }}>Devis n° {devis.number}</Text>
        <Text style={{ fontSize: 9, marginBottom: 4 }}>Date d'émission : {formatDate(devis.createdAt)}</Text>
        {devis.validUntil && (
          <Text style={{ fontSize: 9 }}>Valide jusqu'au : {formatDate(devis.validUntil)}</Text>
        )}
      </View>

      <View style={{ flexDirection: "row", marginBottom: 18, gap: 35 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Entreprise :</Text>
          {devis.user.companyName && <Text>{devis.user.companyName}</Text>}
          {devis.user.name && <Text>{devis.user.name}</Text>}
          {devis.user.address && <Text>{devis.user.address}</Text>}
          {devis.user.postalCode && devis.user.city && (
            <Text>{`${devis.user.postalCode} ${devis.user.city}`}</Text>
          )}
          {devis.user.phone && <Text>{`Tél. : ${devis.user.phone}`}</Text>}
          {devis.user.email && <Text>{`Email : ${devis.user.email}`}</Text>}
          {devis.user.siret && <Text>{`SIRET : ${devis.user.siret}`}</Text>}
          {devis.user.rcs && <Text>{`RCS : ${devis.user.rcs}`}</Text>}
          {devis.user.vatNumber && (
            <Text>{`N° TVA : ${devis.user.vatNumber}`}</Text>
          )}
        </View>

        {devis.client && (
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Client :</Text>
            <Text>{formatClientName(devis.client)}</Text>
            {devis.client.address && <Text>{devis.client.address}</Text>}
            {devis.client.postalCode && devis.client.city && (
              <Text>{`${devis.client.postalCode} ${devis.client.city}`}</Text>
            )}
            {devis.client.email && <Text>{`Email : ${devis.client.email}`}</Text>}
            {devis.client.phone && <Text>{`Tél. : ${devis.client.phone}`}</Text>}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { flex: 4 }]}>Description</Text>
            <Text style={styles.tableCell}>Qté</Text>
            <Text style={styles.tableCell}>Prix unit.</Text>
            <Text style={styles.tableCell}>Total</Text>
          </View>
          {devis.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 4 }]}>
                {item.description || ""}
              </Text>
              <Text style={styles.tableCell}>{item.quantity}</Text>
              <Text style={styles.tableCell}>
                {formatCurrency(item.unitPrice)}
              </Text>
              <Text style={styles.tableCell}>
                {formatCurrency(item.total)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ flexDirection: "row", marginTop: 15, gap: 35 }}>
        <View style={{ flex: 1 }}>
          <View style={styles.legal}>
            <Text style={styles.sectionTitle}>Mentions légales :</Text>
            {devis.paymentTerms && (
              <Text style={{ fontSize: 8, marginBottom: 5 }}>Délai de paiement : {devis.paymentTerms}</Text>
            )}
            <Text style={{ fontSize: 8, marginBottom: 5 }}>
              Modalités de paiement : {devis.paymentTerms || "À convenir"}
            </Text>
            <Text style={{ fontSize: 8, marginBottom: 7 }}>
              TVA :{" "}
              {devis.isVatApplicable
                ? `TVA applicable au taux de ${devis.tvaRate}%`
                : "TVA non applicable"}
            </Text>
            <Text style={{ fontSize: 7, lineHeight: 1.3, marginBottom: 12 }}>
              En cas de retard de paiement, des pénalités de retard au taux de 3 fois le taux d'intérêt légal en vigueur seront appliquées, ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40€.
            </Text>
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={{ fontSize: 8, marginBottom: 5 }}>Date : ___________________</Text>
            <Text style={{ fontSize: 8, marginTop: 18 }}>Signature :</Text>
            <Text style={{ fontSize: 8, fontStyle: "italic", marginTop: 20 }}>
              "Bon pour accord, lu et approuvé"
            </Text>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total HT :</Text>
              <Text style={styles.totalValue}>{formatCurrency(devis.totalHT)}</Text>
            </View>
            {devis.isVatApplicable && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  TVA ({devis.tvaRate}%) :
                </Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(devis.totalTTC - devis.totalHT)}
                </Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { fontSize: 11 }]}>Total TTC :</Text>
              <Text style={[styles.totalValue, { fontSize: 11 }]}>
                {formatCurrency(devis.totalTTC)}
              </Text>
            </View>
            {devis.advancePayment && devis.advancePayment > 0 && (
              <>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Acompte :</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(devis.advancePayment)}
                  </Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Reste à payer :</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(devis.totalTTC - devis.advancePayment)}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </Page>
  </Document>
)

export async function generateDevisPDF(devis: DevisData): Promise<Buffer> {
  try {
    const stream = await renderToStream(
      React.createElement(DevisPDFDocument, { devis })
    )
    
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk))
    }
    
    return Buffer.concat(chunks)
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}

interface FactureData {
  number: string
  title: string
  description?: string | null
  createdAt: Date
  dueDate?: Date | null
  totalHT: number
  totalTTC: number
  tvaRate: number
  paidAmount: number
  paymentTerms?: string | null
  paymentMethod?: string | null
  isVatApplicable: boolean
  items: Array<{
    description: string
    quantity: number
    unit: string
    unitPrice: number
    total: number
  }>
  user: {
    name?: string | null
    companyName?: string | null
    address?: string | null
    city?: string | null
    postalCode?: string | null
    phone?: string | null
    email?: string | null
    siret?: string | null
    rcs?: string | null
    vatNumber?: string | null
  }
  client: {
    firstName?: string | null
    lastName?: string | null
    companyName?: string | null
    address?: string | null
    city?: string | null
    postalCode?: string | null
    email?: string | null
    phone?: string | null
  } | null
}

const FacturePDFDocument = ({ facture }: { facture: FactureData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>FACTURE</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vendeur :</Text>
        {facture.user.companyName && <Text>{facture.user.companyName}</Text>}
        {facture.user.name && <Text>{facture.user.name}</Text>}
        {facture.user.address && <Text>{facture.user.address}</Text>}
        {facture.user.postalCode && facture.user.city && (
          <Text>{`${facture.user.postalCode} ${facture.user.city}`}</Text>
        )}
        {facture.user.phone && <Text>{`Tél. : ${facture.user.phone}`}</Text>}
        {facture.user.email && <Text>{`Email : ${facture.user.email}`}</Text>}
        {facture.user.siret && <Text>{`SIRET : ${facture.user.siret}`}</Text>}
        {facture.user.rcs && <Text>{`RCS : ${facture.user.rcs}`}</Text>}
        {facture.user.vatNumber && (
          <Text>{`N° TVA : ${facture.user.vatNumber}`}</Text>
        )}
      </View>

      {facture.client && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acheteur :</Text>
          <Text>{formatClientName(facture.client)}</Text>
          {facture.client.address && <Text>{facture.client.address}</Text>}
          {facture.client.postalCode && facture.client.city && (
            <Text>{`${facture.client.postalCode} ${facture.client.city}`}</Text>
          )}
          {facture.client.email && (
            <Text>{`Email : ${facture.client.email}`}</Text>
          )}
          {facture.client.phone && (
            <Text>{`Tél. : ${facture.client.phone}`}</Text>
          )}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Facture n° {facture.number}</Text>
        <Text>Titre : {facture.title}</Text>
        <Text>Date d'émission : {formatDate(facture.createdAt)}</Text>
        {facture.dueDate && (
          <Text>Date d'échéance : {formatDate(facture.dueDate)}</Text>
        )}
      </View>

      {facture.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description :</Text>
          <Text>{facture.description}</Text>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { flex: 4 }]}>Description</Text>
            <Text style={styles.tableCell}>Qté</Text>
            <Text style={styles.tableCell}>Prix unit.</Text>
            <Text style={styles.tableCell}>Total</Text>
          </View>
          {facture.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 4 }]}>
                {item.description || ""}
              </Text>
              <Text style={styles.tableCell}>{item.quantity}</Text>
              <Text style={styles.tableCell}>
                {formatCurrency(item.unitPrice)}
              </Text>
              <Text style={styles.tableCell}>
                {formatCurrency(item.total)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total HT :</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(facture.totalHT)}
          </Text>
        </View>
        {facture.isVatApplicable && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              TVA ({facture.tvaRate}%) :
            </Text>
            <Text style={styles.totalValue}>
              {formatCurrency(facture.totalTTC - facture.totalHT)}
            </Text>
          </View>
        )}
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { fontSize: 14 }]}>
            Total TTC :
          </Text>
          <Text style={[styles.totalValue, { fontSize: 14 }]}>
            {formatCurrency(facture.totalTTC)}
          </Text>
        </View>
        {facture.paidAmount > 0 && (
          <>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Montant payé :</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(facture.paidAmount)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Reste à payer :</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(facture.totalTTC - facture.paidAmount)}
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.legal}>
        <Text style={styles.sectionTitle}>Mentions légales :</Text>
        {facture.paymentTerms && (
          <Text>Conditions de paiement : {facture.paymentTerms}</Text>
        )}
        {facture.paymentMethod && (
          <Text>Moyen de paiement : {facture.paymentMethod}</Text>
        )}
        {facture.dueDate && (
          <Text>Date d'échéance : {formatDate(facture.dueDate)}</Text>
        )}
        <Text>
          TVA :{" "}
          {facture.isVatApplicable
            ? `TVA applicable au taux de ${facture.tvaRate}%`
            : "TVA non applicable"}
        </Text>
      </View>
    </Page>
  </Document>
)

export async function generateFacturePDF(
  facture: FactureData
): Promise<Buffer> {
  try {
    const stream = await renderToStream(
      React.createElement(FacturePDFDocument, { facture })
    )
    
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk))
    }
    
    return Buffer.concat(chunks)
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}
