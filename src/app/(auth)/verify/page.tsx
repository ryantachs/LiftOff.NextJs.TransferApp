import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription>
            We&apos;ve sent you a verification link. Click the link in your email to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            If you don&apos;t see the email, check your spam folder.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
