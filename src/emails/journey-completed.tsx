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

interface JourneyCompletedProps {
  customerName: string
  reference: string
  pickupAddress: string
  dropoffAddress: string
  totalPrice: string
  currency: string
}

export default function JourneyCompleted({
  customerName,
  reference,
  pickupAddress,
  dropoffAddress,
  totalPrice,
  currency,
}: JourneyCompletedProps) {
  return (
    <Html>
      <Head />
      <Preview>Journey completed — {reference}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Journey Completed</Heading>
          <Text style={text}>Hi {customerName},</Text>
          <Text style={text}>
            Your journey has been completed. We hope you had a pleasant trip!
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
              <strong>Total:</strong> {currency} {totalPrice}
            </Text>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Thank you for choosing our airport transfer service.
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
