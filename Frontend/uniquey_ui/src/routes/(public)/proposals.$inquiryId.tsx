import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Loader2, MapPin, CheckCircle2, ShieldCheck, Wifi, Car,
  BedDouble, Bath, Users, ExternalLink, X
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import axiosInstance from "@/api/axios";

export const Route = createFileRoute("/(public)/proposals/$inquiryId")({
  component: ClientProposalPage,
});

function ClientProposalPage() {
  const { inquiryId } = useParams({ strict: false }) as { inquiryId: string };
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [previewRec, setPreviewRec] = useState<any | null>(null);
  const [zoomedImg, setZoomedImg] = useState<string | null>(null);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const res = await axiosInstance.get(`recommendations/?inquiry=${inquiryId}`);
        const rawData = res.data.results || res.data;

        // Ensure absolutely no duplicates exist on the frontend by filtering unique property IDs
        const uniqueData = Array.from(new Map(rawData.map((item: any) => [item.accommodation.id, item])).values());

        setRecommendations(uniqueData);
        if (uniqueData.some((r: any) => r.accepted)) {
          setSuccess(true);
        }
      } catch (err) {
        console.error("Failed to load proposals", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (inquiryId) {
      fetchProposals();
    }
  }, [inquiryId]);

  const handleSelectProperty = async (recommendationId: string) => {
    setIsAccepting(recommendationId);
    try {
      await axiosInstance.post(`recommendations/${recommendationId}/accept/`);
      setPreviewRec(null);
      setSuccess(true);
    } catch (err) {
      console.error("Failed to accept property", err);
      alert("Something went wrong. Please contact your concierge.");
      setIsAccepting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--ivory)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--ivory)] p-4 text-center">
        <Card className="max-w-md p-8 shadow-xl">
          <div className="mx-auto w-16 h-16 bg-forest/10 text-forest rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl text-foreground mb-2">Apartment Selected</h1>
          <p className="text-muted-foreground">
            We have notified your concierge. Your official invoice and booking details are being prepared and will be sent to you shortly.
          </p>
        </Card>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--ivory)] p-4">
        <Card className="max-w-md p-8 text-center">
          <p className="text-muted-foreground">No apartment recommendations found for this link.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--ivory)] py-8 px-4 relative">
      {zoomedImg && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 cursor-pointer"
          onClick={() => setZoomedImg(null)}
        >
          <button className="absolute top-6 right-6 text-white bg-black/50 p-2 rounded-full hover:bg-black/80">
            <X className="h-6 w-6" />
          </button>
          <img src={zoomedImg} alt="Zoomed room" className="max-w-full max-h-[90vh] object-contain rounded-md" />
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {recommendations.map((rec) => {
          const apt = rec.accommodation;
          if (!apt || typeof apt !== "object") return null;

          return (
            <Card key={rec.id} className="overflow-hidden border-border/60 shadow-sm flex flex-col md:flex-row bg-background">
              {/* Left Column: Image Gallery with Light Background */}
              <div className="md:w-[45%] bg-slate-100/50 flex flex-col border-r border-border/40">
                <div
                  className="h-60 relative cursor-pointer group"
                  onClick={() => apt.images?.[0] && setZoomedImg(apt.images[0].image)}
                >
                  {apt.images && apt.images.length > 0 ? (
                    <img
                      src={apt.images[0].image}
                      className="h-full w-full object-cover group-hover:opacity-90 transition-opacity"
                      alt={apt.property_name}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
                      No photos uploaded
                    </div>
                  )}
                  {apt.images && apt.images.length > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="bg-black/60 text-white px-3 py-1.5 rounded-md text-xs backdrop-blur-sm flex items-center gap-1.5">
                        <ExternalLink className="h-3.5 w-3.5" /> View Full Photo
                      </span>
                    </div>
                  )}
                </div>

                {apt.images && apt.images.length > 1 && (
                  <div className="flex overflow-x-auto p-2 gap-2 bg-slate-100/80 border-t border-border/40">
                    {apt.images.map((img: any, idx: number) => (
                      <img
                        key={img.id || idx}
                        src={img.image}
                        className="h-14 w-20 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity shrink-0 border border-border"
                        onClick={() => setZoomedImg(img.image)}
                        alt={`${apt.property_name} thumbnail ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Property Info */}
              <div className="p-6 md:w-[55%] flex flex-col">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <h2
                      className="font-serif text-2xl text-foreground hover:text-primary cursor-pointer transition-colors"
                      onClick={() => setPreviewRec(rec)}
                    >
                      {apt.property_name}
                    </h2>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary" /> {apt.area}
                      </span>
                      {apt.google_maps_url && (
                        <a
                          href={apt.google_maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center text-xs"
                        >
                          View Map <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-sm text-muted-foreground my-4 bg-muted/30 p-4 rounded-lg border border-border/50">
                  <p className="flex items-center gap-2 text-foreground font-medium">
                    <BedDouble className="h-4 w-4 text-primary" /> {apt.bedrooms} Bedrooms
                  </p>
                  <p className="flex items-center gap-2 text-foreground font-medium">
                    <Bath className="h-4 w-4 text-primary" /> {apt.bathrooms} Bathrooms
                  </p>
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" /> Sleeps {apt.capacity}
                  </p>
                  {apt.wifi && (
                    <p className="flex items-center gap-2"><Wifi className="h-4 w-4" /> High-speed WiFi</p>
                  )}
                  {apt.parking && (
                    <p className="flex items-center gap-2"><Car className="h-4 w-4" /> Secure Parking</p>
                  )}
                  {apt.verification_status && (
                    <p className="flex items-center gap-2 text-forest font-medium">
                      <ShieldCheck className="h-4 w-4" /> UNIQUEY Verified
                    </p>
                  )}
                </div>

                <div className="mt-auto pt-3 border-t flex flex-wrap items-center justify-between gap-3">
                  <Button variant="outline" size="sm" onClick={() => setPreviewRec(rec)}>
                    View Full Details
                  </Button>
                  <Button
                    variant="hero"
                    onClick={() => handleSelectProperty(rec.id)}
                    disabled={isAccepting !== null}
                  >
                    {isAccepting === rec.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    {isAccepting === rec.id ? "Securing..." : "Select This Apartment"}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* FULL APARTMENT DETAILS MODAL */}
      <Dialog open={!!previewRec} onOpenChange={(o) => !o && setPreviewRec(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          {previewRec && previewRec.accommodation && (
            <>
              <div
                className="relative h-72 w-full bg-slate-100 cursor-pointer group"
                onClick={() => previewRec.accommodation.images?.[0] && setZoomedImg(previewRec.accommodation.images[0].image)}
              >
                {previewRec.accommodation.images && previewRec.accommodation.images.length > 0 ? (
                  <img
                    src={previewRec.accommodation.images[0].image}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-75 transition-opacity"
                    alt="Cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Cover Photo</div>
                )}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 pointer-events-none">
                  <h2 className="text-3xl font-serif text-white">{previewRec.accommodation.property_name}</h2>
                  <p className="text-white/80 text-sm mt-1 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {previewRec.accommodation.area}
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {previewRec.accommodation.images && previewRec.accommodation.images.length > 1 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Click any photo to enlarge</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                      {previewRec.accommodation.images.map((img: any, idx: number) => (
                        <img
                          key={img.id || idx}
                          src={img.image}
                          onClick={() => setZoomedImg(img.image)}
                          className="h-32 w-48 object-cover rounded-md snap-center shrink-0 border border-border cursor-pointer hover:opacity-80 transition-opacity"
                          alt="Room view"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold mb-3 border-b pb-2">Property Specifications</h3>
                      <div className="grid grid-cols-2 gap-y-3 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2"><BedDouble className="h-4 w-4 text-primary" /> {previewRec.accommodation.bedrooms} Bedrooms</p>
                        <p className="flex items-center gap-2"><Bath className="h-4 w-4 text-primary" /> {previewRec.accommodation.bathrooms} Bathrooms</p>
                        <p className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Sleeps {previewRec.accommodation.capacity}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold mb-3 border-b pb-2">Amenities</h3>
                      <div className="grid grid-cols-2 gap-y-3 text-sm text-muted-foreground">
                        {previewRec.accommodation.wifi && <p className="flex items-center gap-2"><Wifi className="h-4 w-4" /> High-speed WiFi</p>}
                        {previewRec.accommodation.parking && <p className="flex items-center gap-2"><Car className="h-4 w-4" /> Secure Parking</p>}
                        {previewRec.accommodation.verification_status && <p className="flex items-center gap-2 text-forest font-medium"><ShieldCheck className="h-4 w-4" /> Verified Property</p>}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-3 border-b pb-2">Proximity & Safety</h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p><strong>Airport:</strong> {previewRec.accommodation.airport_minutes} mins drive</p>
                      <p><strong>Hospital:</strong> {previewRec.accommodation.hospital_distance} mins drive</p>
                      <p><strong>Supermarket:</strong> {previewRec.accommodation.supermarket_distance} mins drive</p>
                      <div className="mt-4 p-3 bg-muted/40 rounded-md border">
                        <p className="text-xs uppercase tracking-widest mb-1">Safety Audit Score</p>
                        <p className="text-2xl font-serif text-foreground">{previewRec.accommodation.safety_score} / 100</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setPreviewRec(null)}>Close</Button>
                  <Button
                    variant="hero"
                    onClick={() => handleSelectProperty(previewRec.id)}
                    disabled={isAccepting !== null}
                  >
                    {isAccepting === previewRec.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    Select This Apartment
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}