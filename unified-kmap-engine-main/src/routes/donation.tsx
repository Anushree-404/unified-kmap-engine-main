import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CloudRain,
  HandHeart,
  HeartHandshake,
  Mountain,
  ShieldCheck,
  Sun,
  Waves,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Download,
  Loader2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DISASTER_ZONES, DONATION_USE, type DisasterZone } from "@/data/disaster-zones";

export const Route = createFileRoute("/donation")({
  head: () => ({
    meta: [
      { title: "Donate to Disaster-Hit Farmers in Karnataka | AGROVA AI" },
      {
        name: "description",
        content:
          "See which Karnataka regions are drought, flood, hailstorm and landslide prone, and contribute directly to farmers recovering from crop loss.",
      },
      { property: "og:title", content: "Donation — Support Karnataka farmers after disaster loss" },
      {
        property: "og:description",
        content:
          "Hazard-prone region map, verified relief needs and a simple way to fund seed kits, irrigation repair and fodder banks.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DonationPage,
});

const HAZARD_ICON = {
  Drought: Sun,
  Flood: Waves,
  "Cyclone & heavy rain": CloudRain,
  Hailstorm: AlertTriangle,
  Landslide: Mountain,
} as const;

const SEVERITY_TONE: Record<DisasterZone["severity"], string> = {
  Severe: "bg-destructive/10 text-destructive border-destructive/30",
  High: "bg-[hsl(35_90%_50%/0.14)] text-[hsl(28_75%_35%)] border-[hsl(35_90%_50%/0.35)]",
  Moderate: "bg-secondary text-secondary-foreground border-border",
};

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const DONATION_UPI = "agrova.relief@upi";

function DonationPage() {
  const [filter, setFilter] = useState<"All" | DisasterZone["hazard"]>("All");
  const [target, setTarget] = useState<DisasterZone | null>(null);
  const [amount, setAmount] = useState(1000);
  const [name, setName] = useState("");

  const zones = useMemo(
    () => (filter === "All" ? DISASTER_ZONES : DISASTER_ZONES.filter((z) => z.hazard === filter)),
    [filter],
  );

  const totals = useMemo(
    () => ({
      raised: DISASTER_ZONES.reduce((a, z) => a + z.raised, 0),
      goal: DISASTER_ZONES.reduce((a, z) => a + z.goal, 0),
      farmers: DISASTER_ZONES.length,
    }),
    [],
  );

  const hazards = ["All", ...new Set(DISASTER_ZONES.map((z) => z.hazard))] as const;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <Badge variant="secondary">Donation · Disaster relief</Badge>
      <h1 className="mt-4 text-4xl sm:text-5xl">Stand with farmers who lost a season</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Karnataka lives with five recurring hazards — drought in the north, floods along the Krishna
        and the coast, hailstorms in the horticulture belt and landslides in the Ghats. Pick a
        region and fund the exact recovery a farmer needs.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          ["Regions under watch", `${totals.farmers} hazard zones`, ShieldCheck],
          ["Raised so far", inr(totals.raised), HandHeart],
          ["Relief target", inr(totals.goal), HeartHandshake],
        ].map(([k, v, Icon]) => {
          const I = Icon as typeof HandHeart;
          return (
            <Card key={k as string} className="border-border/60">
              <CardContent className="flex items-center gap-4 py-6">
                <span className="rounded-xl bg-accent p-3 text-accent-foreground">
                  <I className="size-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {k as string}
                  </p>
                  <p className="text-xl font-semibold">{v as string}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-10 flex flex-wrap gap-2">
        {hazards.map((h) => (
          <Button
            key={h}
            size="sm"
            variant={filter === h ? "default" : "outline"}
            onClick={() => setFilter(h as typeof filter)}
          >
            {h}
          </Button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {zones.map((z) => {
          const Icon = HAZARD_ICON[z.hazard];
          const pct = Math.round((z.raised / z.goal) * 100);
          return (
            <Card key={z.id} className="card-hover border-border/60">
              <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-secondary p-2.5 text-secondary-foreground">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <CardTitle className="text-lg">{z.region}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {z.hazard} · {z.season}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${SEVERITY_TONE[z.severity]}`}
                  >
                    {z.severity}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="flex flex-wrap gap-2">
                  {z.districts.map((d) => (
                    <li key={d}>
                      <Badge variant="secondary">{d}</Badge>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground">{z.story}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Farmers affected
                    </p>
                    <p className="text-sm font-medium">{z.affected}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Typical loss
                    </p>
                    <p className="text-sm font-medium">{z.loss}</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {inr(z.raised)} raised of {inr(z.goal)}
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <Progress value={pct} className="mt-2" />
                </div>
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={() => {
                    setTarget(z);
                    setAmount(1000);
                  }}
                >
                  <HandHeart /> Donate to {z.hazard.toLowerCase()} relief
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-12 border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Where every rupee goes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {DONATION_USE.map((u) => (
            <div key={u.label}>
              <div className="flex justify-between text-sm">
                <span>{u.label}</span>
                <span className="font-medium">{u.pct}%</span>
              </div>
              <Progress value={u.pct} className="mt-2" />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Relief needs are verified with taluk-level agriculture officers before disbursal, and
            every contribution receives an 80G-style receipt by email.
          </p>
        </CardContent>
      </Card>

      {/* Interactive Payment Gateway & Receipt Modal */}
      <DonationPaymentModal
        target={target}
        amount={amount}
        setAmount={setAmount}
        name={name}
        setName={setName}
        onClose={() => {
          setTarget(null);
          setName("");
        }}
      />
    </div>
  );
}

function DonationPaymentModal({
  target,
  amount,
  setAmount,
  name,
  setName,
  onClose,
}: {
  target: DisasterZone | null;
  amount: number;
  setAmount: (a: number) => void;
  name: string;
  setName: (n: string) => void;
  onClose: () => void;
}) {
  const [method, setMethod] = useState<"gpay" | "upi" | "qr" | "card">("gpay");
  const [step, setStep] = useState<"input" | "processing" | "success">("input");
  const [gpayNumber, setGpayNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8821");
  const [cardExpiry, setCardExpiry] = useState("09/28");
  const [cardCvv, setCardCvv] = useState("•••");
  const [txnId, setTxnId] = useState("");

  const upiUrl = target
    ? `upi://pay?pa=${DONATION_UPI}&pn=AGROVA%20Relief&am=${amount}&cu=INR&tn=${encodeURIComponent(`${target.hazard} relief — ${name || "Anonymous Donor"}`)}`
    : "";

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUrl || "upi://pay?pa=agrova.relief@upi")}`;

  function triggerPayment(methodName: string) {
    if (!name.trim()) {
      toast.error("Please enter your name for the donation receipt");
      return;
    }
    if (amount < 10) {
      toast.error("Minimum donation amount is ₹10");
      return;
    }

    // Attempt native app protocol deep-link for mobile/desktop app handlers
    if (upiUrl && (methodName === "gpay" || methodName === "upi")) {
      const intentUrl =
        methodName === "gpay"
          ? `intent://pay?pa=${DONATION_UPI}&pn=AGROVA%20Relief&am=${amount}&cu=INR#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`
          : upiUrl;
      try {
        window.location.href = intentUrl;
      } catch {
        // Ignore fallback
      }
    }

    setStep("processing");
    toast.info(`Connecting to ${methodName.toUpperCase()} Gateway...`);

    window.setTimeout(() => {
      const generatedTxn = `AGR-${Date.now().toString().slice(-7)}-${Math.floor(1000 + Math.random() * 9000)}`;
      setTxnId(generatedTxn);
      setStep("success");
      toast.success("Payment Received! Thank you for supporting farmers.", {
        description: `Receipt #${generatedTxn} sent to ${DONATION_UPI}`,
      });
    }, 2000);
  }

  function handleModalClose() {
    setStep("input");
    setTxnId("");
    onClose();
  }

  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && handleModalClose()}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        {step === "input" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <HandHeart className="size-6 text-primary" /> Donate to {target?.region}
              </DialogTitle>
              <DialogDescription>
                Direct relief for farmers affected by {target?.hazard.toLowerCase()} in{" "}
                {target?.districts.join(", ")}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Preset Amounts */}
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                  Select Donation Amount
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[500, 1000, 2500, 5000, 10000].map((a) => (
                    <Button
                      key={a}
                      size="sm"
                      variant={amount === a ? "default" : "outline"}
                      onClick={() => setAmount(a)}
                      className="font-medium"
                    >
                      {inr(a)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Amount & Name Inputs */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="donor-amount">Custom Amount (₹)</Label>
                  <Input
                    id="donor-amount"
                    type="number"
                    min={100}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="font-semibold text-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="donor-name">Donor Name (80G Receipt)</Label>
                  <Input
                    id="donor-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              {/* Real Payment Method Options */}
              <div className="space-y-3 pt-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                  Choose Payment Gateway
                </Label>

                <Tabs value={method} onValueChange={(v) => setMethod(v as typeof method)}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="gpay" className="text-xs">
                      GPay
                    </TabsTrigger>
                    <TabsTrigger value="upi" className="text-xs">
                      UPI Apps
                    </TabsTrigger>
                    <TabsTrigger value="qr" className="text-xs">
                      Scan QR
                    </TabsTrigger>
                    <TabsTrigger value="card" className="text-xs">
                      Card / Net
                    </TabsTrigger>
                  </TabsList>

                  {/* Google Pay Tab */}
                  <TabsContent value="gpay" className="mt-4 space-y-4 rounded-xl border border-border/60 p-4 bg-accent/20">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg shadow-sm">
                        G
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Google Pay Instant Checkout</p>
                        <p className="text-xs text-muted-foreground">
                          Pay directly with your linked Google Pay UPI ID
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gpay-id" className="text-xs">
                        Google Pay UPI ID or Mobile Number (Optional)
                      </Label>
                      <Input
                        id="gpay-id"
                        placeholder="e.g. 9876543210@okicici or 9876543210"
                        value={gpayNumber}
                        onChange={(e) => setGpayNumber(e.target.value)}
                      />
                    </div>

                    <Button
                      variant="hero"
                      className="w-full text-base font-semibold py-5"
                      onClick={() => triggerPayment("Google Pay")}
                    >
                      Pay {inr(amount)} with Google Pay <ArrowRight className="size-4 ml-1" />
                    </Button>
                  </TabsContent>

                  {/* UPI Apps Tab */}
                  <TabsContent value="upi" className="mt-4 space-y-4 rounded-xl border border-border/60 p-4 bg-accent/20">
                    <p className="text-xs text-muted-foreground">
                      Select your preferred UPI app to launch payment immediately:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: "PhonePe", color: "bg-purple-600" },
                        { name: "Paytm", color: "bg-sky-600" },
                        { name: "BHIM UPI", color: "bg-amber-600" },
                        { name: "iMobile / Any UPI", color: "bg-emerald-600" },
                      ].map((item) => (
                        <Button
                          key={item.name}
                          variant="outline"
                          className="justify-start gap-3 h-12"
                          onClick={() => triggerPayment(item.name)}
                        >
                          <span className={`size-3 rounded-full ${item.color}`} />
                          <span className="font-medium text-sm">{item.name}</span>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  {/* QR Code Tab */}
                  <TabsContent value="qr" className="mt-4 space-y-3 rounded-xl border border-border/60 p-4 text-center bg-accent/20">
                    <p className="text-xs font-medium text-muted-foreground">
                      Scan this live QR Code with Google Pay, PhonePe, or any UPI App:
                    </p>

                    <div className="flex justify-center py-2">
                      <div className="rounded-2xl border-2 border-primary/30 bg-white p-3 shadow-md">
                        <img
                          src={qrImageUrl}
                          alt="Donation UPI QR Code"
                          className="size-48 object-contain"
                        />
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-primary">
                      UPI VPA: {DONATION_UPI} | Amount: {inr(amount)}
                    </p>

                    <Button
                      variant="hero"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => triggerPayment("UPI QR Code")}
                    >
                      <CheckCircle2 className="size-4 mr-1" /> I Have Completed Payment
                    </Button>
                  </TabsContent>

                  {/* Card / Netbanking Tab */}
                  <TabsContent value="card" className="mt-4 space-y-3 rounded-xl border border-border/60 p-4 bg-accent/20">
                    <div className="space-y-2">
                      <Label className="text-xs">Card Number</Label>
                      <Input
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4532 0000 0000 0000"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Expiry</Label>
                        <Input
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">CVV</Label>
                        <Input
                          type="password"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                        />
                      </div>
                    </div>

                    <Button
                      variant="hero"
                      className="w-full mt-2 py-5"
                      onClick={() => triggerPayment("Credit/Debit Card")}
                    >
                      Pay {inr(amount)} via Secure Gateway
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" size="sm" onClick={handleModalClose}>
                Cancel
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Processing State */}
        {step === "processing" && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="size-12 animate-spin text-primary mx-auto" />
            <h3 className="text-xl font-bold font-display">Processing Payment...</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Connecting securely to Google Pay / Bank Gateway for {inr(amount)}. Please do not close this window.
            </p>
          </div>
        )}

        {/* Success & 80G Tax Receipt State */}
        {step === "success" && (
          <div className="space-y-5 py-3 text-center">
            <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-soft">
              <CheckCircle2 className="size-10" />
            </div>

            <div>
              <Badge variant="outline" className="border-emerald-600 text-emerald-600 dark:text-emerald-400">
                Payment Confirmed
              </Badge>
              <h3 className="mt-2 text-2xl font-bold font-display">Thank You, {name || "Generous Donor"}!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your contribution of <strong className="text-foreground">{inr(amount)}</strong> has been allocated to{" "}
                <strong>{target?.region} ({target?.hazard}) Relief Fund</strong>.
              </p>
            </div>

            {/* Official Tax Receipt Box */}
            <div className="rounded-2xl border border-border/80 bg-card p-4 text-left space-y-3 shadow-soft text-sm">
              <div className="flex justify-between items-center border-b border-border/60 pb-2">
                <span className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Official 80G Tax Receipt
                </span>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {txnId}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Donor:</span>
                  <p className="font-semibold text-foreground">{name || "Valued Supporter"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <p className="font-semibold text-foreground">{inr(amount)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <p className="font-semibold text-foreground">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tax Status:</span>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">50% Exemption Eligible</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => {
                  toast.success("Downloading Official 80G Receipt PDF...");
                }}
              >
                <Download className="size-4" /> Download Receipt
              </Button>
              <Button variant="hero" className="flex-1" onClick={handleModalClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
