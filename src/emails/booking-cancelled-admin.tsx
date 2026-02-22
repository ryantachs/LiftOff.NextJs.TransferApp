import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface BookingCancelledAdminProps {
  customerName: string
  reference: string
  pickupAddress: string
  dropoffAddress: string
  reason: string
  refundInitiated: boolean
}

export default function BookingCancelledAdmin({
  customerName,
  reference,
  pickupAddress,
  dropoffAddress,
  reason,
  refundInitiated,
}: BookingCancelledAdminProps) {
  return (
    <Html>
      <Head />
      <Preview>Booking cancelled — {reference}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Booking Cancelled</Heading>
          <Text style={text}>Hi {customerName},</Text>
          <Text style={text}>
            Your booking has been cancelled by our team. We apologise for any inconvenience.
          </Text>
          <Section style={details}>
            <Text style={detailRow}>
              <strong>Reference:</strong> {reference}
            </Text>
            <Text style={detailRow}>
              <strong>Pickup:</strong> {pickupAddress}
            </Text>
            <Text style={detailRow}>
              <strong>Dropoff:</strong> {dropoffAddress}
            </Text>
            <Text style={detailRow}>
              <strong>Reason:</strong> {reason}
            </Text>
          </Section>
          {refundInitiated && (
            <Text style={text}>
              A refund has been initiated and will appear on your statement within 5-10 business days.
            </Text>
          )}
          <Hr style={hr} />
          <Text style={footer}>
            If you have any questions, please contact our support team.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
}

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "700" as const,
  color: "#484848",
  padding: "17px 0 0",
  textAlign: "center" as const,
}

const text = {
  margin: "0 0 10px",
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#3c4149",
  padding: "0 40px",
}

const details = {
  backgroundColor: "#f4f4f5",
  borderRadius: "4px",
  margin: "16px 40px",
  padding: "16px 24px",
}

const detailRow = {
  margin: "4px 0",
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#3c4149",
  padding: "0",
}

const hr = {
  borderColor: "#dfe1e4",
  margin: "26px 40px",
}

const footer = {
  fontSize: "13px",
  lineHeight: "1.4",
  color: "#898989",
  padding: "0 40px",
}
