import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components"

interface VerifyEmailProps {
  url: string
}

export default function VerifyEmail({ url }: VerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Verify your email</Heading>
          <Text style={text}>
            Click the link below to verify your email address and complete your registration.
          </Text>
          <Link href={url} style={link}>
            Verify Email Address
          </Link>
          <Text style={footer}>
            If you did not create an account, you can safely ignore this email.
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

const link = {
  display: "block",
  textAlign: "center" as const,
  backgroundColor: "#2563eb",
  color: "#fff",
  fontSize: "15px",
  fontWeight: "600" as const,
  textDecoration: "none",
  padding: "11px 23px",
  borderRadius: "6px",
  margin: "16px 40px",
}

const footer = {
  fontSize: "13px",
  lineHeight: "1.4",
  color: "#898989",
  padding: "0 40px",
  marginTop: "20px",
}
