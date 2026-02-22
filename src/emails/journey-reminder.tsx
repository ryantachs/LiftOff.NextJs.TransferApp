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

interface JourneyReminderEmailProps {
  reference: string
  pickupAddress: string
  dropoffAddress: string
  pickupDateTime: string
  driverName?: string
  vehicleDetails?: string
}

export function JourneyReminderEmail({
  reference,
  pickupAddress,
  dropoffAddress,
  pickupDateTime,
  driverName,
  vehicleDetails,
}: JourneyReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reminder: Your transfer {reference} is in 2 hours</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Journey Reminder</Heading>
          <Text style={text}>
            This is a friendly reminder that your airport transfer is in approximately 2 hours.
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
              <strong>Date/Time:</strong> {pickupDateTime}
            </Text>
            {driverName && (
              <Text style={detailRow}>
                <strong>Driver:</strong> {driverName}
              </Text>
            )}
            {vehicleDetails && (
              <Text style={detailRow}>
                <strong>Vehicle:</strong> {vehicleDetails}
              </Text>
            )}
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Please be ready at the pickup location on time. If you need to make changes, please contact us as soon as possible.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default JourneyReminderEmail

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
