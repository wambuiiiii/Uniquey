import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/(protected)/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Workspace</p>
        <h1 className="mt-1 font-serif text-3xl text-foreground">Settings</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="font-serif">Organisation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Business name</Label><Input defaultValue="UNIQUEY Concierge Ltd." /></div>
            <div className="space-y-1.5"><Label>Support email</Label><Input defaultValue="hello@uniquey.co" /></div>
            <div className="space-y-1.5"><Label>WhatsApp</Label><Input defaultValue="+254 700 000 000" /></div>
            <div className="space-y-1.5"><Label>Base currency</Label><Input defaultValue="KES" /></div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Accept new inquiries</p>
              <p className="text-xs text-muted-foreground">Turn off during high-season pauses.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Auto-assign concierge</p>
              <p className="text-xs text-muted-foreground">Round-robin among on-duty staff.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Send SMS transfer reminders</p>
              <p className="text-xs text-muted-foreground">Guest gets pickup details 3h before landing.</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="font-serif">Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            "New inquiry submitted",
            "Quote accepted",
            "Guest lands in Kenya",
            "Invoice overdue",
          ].map((n) => (
            <div key={n} className="flex items-center justify-between">
              <p className="text-sm text-foreground">{n}</p>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button variant="hero">Save changes</Button>
      </div>
    </div>
  );
}
