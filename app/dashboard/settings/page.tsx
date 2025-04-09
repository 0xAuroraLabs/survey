import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserSettingsForm } from "@/components/user-settings-form"
import { getCurrentUser } from "@/lib/session"

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <UserSettingsForm user={user} />
        </CardContent>
      </Card>
    </div>
  )
}
