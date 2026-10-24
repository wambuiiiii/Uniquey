import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Plus, Search, Pencil, Trash2, Eye, EyeOff, Loader2, UploadCloud,
  MapPin, Home, ShieldCheck, X, ExternalLink, BedDouble, Bath, Users, Wifi, Car, CalendarClock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import axiosInstance from "@/api/axios";
import { format, parseISO } from "date-fns";
import imageCompression from "browser-image-compression"; // NEW IMPORT

export const Route = createFileRoute("/(protected)/admin/apartments")({
  component: AdminProperties,
});

type ActiveBooking = { id: string; check_in: string; check_out: string; notes: string; };
type PropertyImage = { id: string; image: string; is_cover: boolean; };
type Accommodation = {
  id?: string;
  property_name: string;
  host_name: string;
  host_phone: string;
  area: string;
  address: string;
  google_maps_url: string;
  nightly_price: string;
  bedrooms: number;
  bathrooms: number;
  capacity: number;
  wifi: boolean;
  parking: boolean;
  airport_minutes: number;
  supermarket_distance: number;
  hospital_distance: number;
  female_friendly: boolean;
  family_friendly: boolean;
  medical_friendly: boolean;
  business_friendly: boolean;
  safety_score: number;
  verification_status: boolean;
  notes: string;
  images?: PropertyImage[];
  active_bookings?: ActiveBooking[];
};

const emptyDraft: Accommodation = {
  property_name: "", host_name: "", host_phone: "", area: "", address: "", google_maps_url: "",
  nightly_price: "", bedrooms: 1, bathrooms: 1, capacity: 2, wifi: true, parking: true,
  airport_minutes: 0, supermarket_distance: 0, hospital_distance: 0, female_friendly: false,
  family_friendly: false, medical_friendly: false, business_friendly: false, safety_score: 0,
  verification_status: false, notes: "", images: [],
};

function AdminProperties() {
  const [properties, setProperties] = useState<Accommodation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Accommodation>(emptyDraft);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false); // NEW STATE

  const [previewProp, setPreviewProp] = useState<Accommodation | null>(null);
  const [zoomedImg, setZoomedImg] = useState<string | null>(null);

  const [bookOpen, setBookOpen] = useState(false);
  const [targetProp, setTargetProp] = useState<Accommodation | null>(null);
  const [bookStart, setBookStart] = useState("");
  const [bookEnd, setBookEnd] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const propRes = await axiosInstance.get("properties/");
      setProperties(propRes.data.results || propRes.data);
    } catch (error) {
      console.error("Failed to fetch accommodations", error);
    } finally {
      setIsLoading(false);
    }
  };

  // CHANGED: Async function to compress images before saving them to state
  const handleSelectFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsCompressing(true);

    try {
      const compressedFilesArray: File[] = [];
      const previewUrlsArray: string[] = [];

      const options = {
        maxSizeMB: 0.5, // 500KB Max
        maxWidthOrHeight: 1920, // Strict HD width limit
        useWebWorker: true,
        fileType: "image/webp" as string, // Force WebP formatting
        initialQuality: 0.8,
      };

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 1. Compress it via the browser
        const compressedBlob = await imageCompression(file, options);

        // 2. Cast the blob back to a File object for FormData and rename extension to .webp
        const compressedFile = new File(
          [compressedBlob],
          file.name.replace(/\.[^/.]+$/, ".webp"),
          { type: "image/webp" }
        );

        compressedFilesArray.push(compressedFile);
        previewUrlsArray.push(URL.createObjectURL(compressedFile));
      }

      setNewImageFiles((prev) => [...prev, ...compressedFilesArray]);
      setImagePreviews((prev) => [...prev, ...previewUrlsArray]);
    } catch (error) {
      console.error("Compression failed", error);
      alert("Error compressing images. Try smaller files.");
    } finally {
      setIsCompressing(false);
      // Reset input so you can select the exact same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeSelectedFile = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOpenNew = () => {
    setDraft(emptyDraft);
    setNewImageFiles([]);
    setImagePreviews([]);
    setIsEditing(false);
    setOpen(true);
  };

  const handleOpenEdit = (property: Accommodation) => {
    setDraft({ ...property, notes: property.notes || "", address: property.address || "", google_maps_url: property.google_maps_url || "" });
    setNewImageFiles([]);
    setImagePreviews((property.images || []).map((img) => img.image));
    setIsEditing(true);
    setOpen(true);
  };

  const handleOpenBook = (property: Accommodation) => {
    setTargetProp(property);
    setBookStart("");
    setBookEnd("");
    setBookOpen(true);
  };

  const handleSubmit = async () => {
    if (!draft.property_name || !draft.area) { alert("Property name and area required."); return; }
    setIsSaving(true);
    const formData = new FormData();
    Object.entries(draft).forEach(([key, value]) => {
      if (key === "images" || key === "id" || key === "active_bookings") return;
      if (value === null || value === undefined) formData.append(key, "");
      else if (typeof value === "boolean") formData.append(key, value ? "true" : "false");
      else formData.append(key, String(value));
    });
    newImageFiles.forEach((file) => formData.append("images", file));

    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      if (isEditing && draft.id) {
        const res = await axiosInstance.patch(`properties/${draft.id}/`, formData, config);
        setProperties((prev) => prev.map((p) => (p.id === draft.id ? res.data : p)));
      } else {
        const res = await axiosInstance.post("properties/", formData, config);
        setProperties((prev) => [res.data, ...prev]);
      }
      setOpen(false);
    } catch (error) {
      alert("Failed to save property. Please check inputs.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBookSubmit = async () => {
    if (!targetProp?.id || !bookStart || !bookEnd) {
      alert("Check-in and Check-out dates are required.");
      return;
    }
    if (new Date(bookStart) >= new Date(bookEnd)) {
      alert("Check-out must be after check-in.");
      return;
    }

    setIsBooking(true);
    try {
      const res = await axiosInstance.post(`properties/${targetProp.id}/book_dates/`, {
        check_in: bookStart,
        check_out: bookEnd
      });
      setProperties((prev) => prev.map((p) => (p.id === targetProp.id ? res.data : p)));
      setBookOpen(false);
    } catch (error: any) {
      console.error("Booking failed:", error);
      alert("Failed to book dates. Please ensure the backend endpoint is named correctly.");
    } finally {
      setIsBooking(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this property?")) return;
    try {
      await axiosInstance.delete(`properties/${id}/`);
      setProperties((prev) => prev.filter((p) => p.id !== id));
      if (previewProp?.id === id) setPreviewProp(null);
    } catch (error) {
      alert("Failed to delete property.");
    }
  };

  const filtered = properties.filter((p) =>
    (p.property_name + p.area + p.host_name).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      {zoomedImg && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoomedImg(null)}
        >
          <button className="absolute top-6 right-6 text-white bg-black/50 p-2 rounded-full hover:bg-black/80">
            <X className="h-6 w-6" />
          </button>
          <img src={zoomedImg} alt="Zoomed" className="max-w-full max-h-[90vh] object-contain rounded-md" />
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Inventory</p>
          <h1 className="mt-1 font-serif text-3xl text-foreground">Apartments & Stays</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button variant="hero" onClick={handleOpenNew}><Plus className="mr-1.5 h-4 w-4" /> Add Property</Button>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif">{isEditing ? "Edit Property" : "Add Property Listing"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-2">
              <div className="space-y-2">
                <Label>Photo Gallery</Label>
                <input type="file" multiple ref={fileInputRef} accept="image/*" className="hidden" onChange={(e) => handleSelectFiles(e.target.files)} />
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleSelectFiles(e.dataTransfer.files); }}
                  onClick={() => !isCompressing && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors flex flex-col items-center justify-center ${isCompressing ? 'cursor-not-allowed opacity-70 bg-muted' : 'cursor-pointer'} ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                      <p className="text-sm font-medium">Optimizing images...</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">Click or drag & drop photos here</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Select multiple photos at once. Files are automatically compressed to WebP.</p>
                    </>
                  )}
                </div>
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative group rounded-md overflow-hidden border aspect-video bg-muted">
                        <img src={src} className="h-full w-full object-cover" alt={`Selected property photo ${idx + 1}`} />
                        <button type="button" aria-label={`Remove photo ${idx + 1}`} onClick={() => removeSelectedFile(idx)} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-semibold flex items-center gap-2"><Home className="h-4 w-4 text-primary" /> Property & Host</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5"><Label>Property Name</Label><Input value={draft.property_name} onChange={(e) => setDraft({ ...draft, property_name: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Host Name</Label><Input value={draft.host_name} onChange={(e) => setDraft({ ...draft, host_name: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Host Phone</Label><Input value={draft.host_phone} onChange={(e) => setDraft({ ...draft, host_phone: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1.5"><Label>Nightly Rate (KES)</Label><Input type="number" step="0.01" value={draft.nightly_price} onChange={(e) => setDraft({ ...draft, nightly_price: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Capacity</Label><Input type="number" value={draft.capacity} onChange={(e) => setDraft({ ...draft, capacity: parseInt(e.target.value) || 0 })} /></div>
                  <div className="space-y-1.5"><Label>Bedrooms</Label><Input type="number" value={draft.bedrooms} onChange={(e) => setDraft({ ...draft, bedrooms: parseInt(e.target.value) || 0 })} /></div>
                  <div className="space-y-1.5"><Label>Bathrooms</Label><Input type="number" value={draft.bathrooms} onChange={(e) => setDraft({ ...draft, bathrooms: parseInt(e.target.value) || 0 })} /></div>
                </div>
              </div>
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Location & Mapping</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Neighborhood / Area</Label><Input value={draft.area} onChange={(e) => setDraft({ ...draft, area: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Google Maps URL</Label><Input value={draft.google_maps_url} onChange={(e) => setDraft({ ...draft, google_maps_url: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="space-y-1.5"><Label className="text-xs">Airport (mins)</Label><Input type="number" value={draft.airport_minutes} onChange={(e) => setDraft({ ...draft, airport_minutes: parseInt(e.target.value) || 0 })} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Supermarket (mins)</Label><Input type="number" value={draft.supermarket_distance} onChange={(e) => setDraft({ ...draft, supermarket_distance: parseInt(e.target.value) || 0 })} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Hospital (mins)</Label><Input type="number" value={draft.hospital_distance} onChange={(e) => setDraft({ ...draft, hospital_distance: parseInt(e.target.value) || 0 })} /></div>
                </div>
              </div>
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Amenities & Safety</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[{ label: "WiFi", key: "wifi" }, { label: "Parking", key: "parking" }, { label: "Female Friendly", key: "female_friendly" }, { label: "Family Friendly", key: "family_friendly" }, { label: "Medical Friendly", key: "medical_friendly" }].map((item) => (
                    <div key={item.key} className="flex items-center justify-between border rounded-md p-2.5 bg-muted/20">
                      <Label className="text-xs cursor-pointer">{item.label}</Label>
                      <Switch checked={Boolean(draft[item.key as keyof Accommodation])} onCheckedChange={(val) => setDraft({ ...draft, [item.key]: val })} />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5"><Label>Safety Audit Score (0 - 100)</Label><Input type="number" value={draft.safety_score} onChange={(e) => setDraft({ ...draft, safety_score: parseInt(e.target.value) || 0 })} /></div>
                  <div className="flex items-center justify-between border rounded-md p-3"><Label>Verification Badge</Label><Switch checked={draft.verification_status} onCheckedChange={(val) => setDraft({ ...draft, verification_status: val })} /></div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="hero" onClick={handleSubmit} disabled={isSaving || isCompressing}>{isSaving ? "Saving..." : "Save Property"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search properties..." className="pl-9" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : properties.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground border rounded-lg bg-muted/20">No properties found. Add your first property!</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => {
            const coverImage = r.images && r.images.length > 0 ? r.images[0].image : null;
            return (
              <Card key={r.id} className="border-border/60 overflow-hidden flex flex-col hover:border-primary/30 transition-colors cursor-pointer" onClick={() => setPreviewProp(r)}>
                <div className="h-48 w-full overflow-hidden bg-muted relative">
                  {coverImage ? <img src={coverImage} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-xs">No photos</div>}
                  {r.images && r.images.length > 1 && <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-md font-medium">+{r.images.length - 1} photos</span>}
                </div>
                <CardContent className="space-y-3 p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-serif text-lg text-foreground">{r.property_name}</p>
                    <Badge variant="outline" className={r.verification_status ? "border-forest/40 bg-forest/10 text-forest" : "bg-muted text-muted-foreground"}>
                      {r.verification_status ? <><Eye className="mr-1 h-3 w-3" /> Verified</> : <><EyeOff className="mr-1 h-3 w-3" /> Unverified</>}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1 flex-1">
                    <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" /> {r.area}</p>
                    <p className="text-xs">{r.bedrooms} Bed · {r.bathrooms} Bath · Sleeps {r.capacity}</p>

                    {r.active_bookings && r.active_bookings.length > 0 && (
                      <div className="mt-2 pt-2 border-t text-[10px] space-y-1">
                        <span className="font-semibold uppercase tracking-wider text-destructive">Booked Dates:</span>
                        {r.active_bookings.map((b) => (
                          <div key={b.id} className="flex justify-between">
                            <span>{format(parseISO(b.check_in), "MMM d")} - {format(parseISO(b.check_out), "MMM d")}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-4 mt-auto">
                    <Button size="sm" variant="outline" className="flex-1" onClick={(e) => { e.stopPropagation(); handleOpenBook(r); }}>
                      <CalendarClock className="mr-1.5 h-3.5 w-3.5" /> Book
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={(e) => { e.stopPropagation(); handleOpenEdit(r); }}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* BOOK DATES MODAL */}
      <Dialog open={bookOpen} onOpenChange={setBookOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Book Property Dates</DialogTitle>
            <DialogDescription>
              Manually reserve <span className="font-bold text-foreground">{targetProp?.property_name}</span> to prevent overlapping recommendations.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Check In</Label>
                <Input type="date" value={bookStart} onChange={(e) => setBookStart(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Check Out</Label>
                <Input type="date" value={bookEnd} onChange={(e) => setBookEnd(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBookOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={handleBookSubmit} disabled={isBooking}>
              {isBooking ? "Booking..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FULL PROPERTY PREVIEW DIALOG */}
      <Dialog open={!!previewProp} onOpenChange={(o) => !o && setPreviewProp(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          {previewProp && (
            <>
              <div
                className="relative h-72 w-full bg-black cursor-pointer group"
                onClick={() => previewProp.images?.[0] && setZoomedImg(previewProp.images[0].image)}
              >
                {previewProp.images && previewProp.images.length > 0 ? (
                  <img src={previewProp.images[0].image} className="w-full h-full object-cover opacity-90 group-hover:opacity-75 transition-opacity" alt="Cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50">No Cover Photo</div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-black/60 text-white px-4 py-2 rounded-md font-medium text-sm backdrop-blur-sm">Click to expand</span>
                </div>
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 pointer-events-none">
                  <h2 className="text-3xl font-serif text-white">{previewProp.property_name}</h2>
                  <div className="flex items-center gap-4 mt-1 text-white/80 text-sm">
                    <p className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {previewProp.area}</p>
                    {previewProp.google_maps_url && (
                      <a href={previewProp.google_maps_url} target="_blank" rel="noopener noreferrer" className="hover:text-white underline flex items-center pointer-events-auto">
                        Open Map <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {previewProp.images && previewProp.images.length > 1 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Photo Gallery</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                      {previewProp.images.slice(1).map((img, idx) => (
                        <div
                          key={idx}
                          className="relative h-32 w-48 shrink-0 snap-center cursor-pointer group"
                          onClick={() => setZoomedImg(img.image)}
                        >
                          <img src={img.image} className="h-full w-full object-cover rounded-md border group-hover:opacity-80 transition-opacity" alt="Gallery" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <span className="bg-black/60 text-white p-1.5 rounded-full backdrop-blur-sm"><ExternalLink className="h-4 w-4" /></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold mb-3 border-b pb-2">Property Specs</h3>
                      <div className="grid grid-cols-2 gap-y-3 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2"><BedDouble className="h-4 w-4 text-primary" /> {previewProp.bedrooms} Bedrooms</p>
                        <p className="flex items-center gap-2"><Bath className="h-4 w-4 text-primary" /> {previewProp.bathrooms} Bathrooms</p>
                        <p className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Sleeps {previewProp.capacity}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-3 border-b pb-2">Amenities</h3>
                      <div className="grid grid-cols-2 gap-y-3 text-sm text-muted-foreground">
                        {previewProp.wifi && <p className="flex items-center gap-2"><Wifi className="h-4 w-4" /> WiFi Included</p>}
                        {previewProp.parking && <p className="flex items-center gap-2"><Car className="h-4 w-4" /> Secure Parking</p>}
                        {previewProp.verification_status && <p className="flex items-center gap-2 text-forest font-medium"><ShieldCheck className="h-4 w-4" /> Verified Property</p>}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-3 border-b pb-2">Distances & Host</h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p><strong>Airport:</strong> {previewProp.airport_minutes} mins drive</p>
                      <p><strong>Hospital:</strong> {previewProp.hospital_distance} mins drive</p>
                      <p><strong>Supermarket:</strong> {previewProp.supermarket_distance} mins drive</p>
                      <div className="mt-4 p-3 bg-muted/40 rounded-md border text-xs">
                        <p className="uppercase tracking-widest mb-1">Host Information</p>
                        <p className="font-medium text-foreground">{previewProp.host_name || "N/A"} {previewProp.host_phone && `(${previewProp.host_phone})`}</p>
                      </div>
                      <div className="mt-2 p-3 bg-muted/40 rounded-md border text-xs">
                        <p className="uppercase tracking-widest mb-1">Safety Audit Score</p>
                        <p className="text-2xl font-serif text-foreground">{previewProp.safety_score} / 100</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end gap-3">
                  <Button variant="ghost" className="text-destructive" onClick={() => { if (previewProp.id) handleDelete(previewProp.id); }}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                  <Button variant="outline" onClick={() => { handleOpenEdit(previewProp); setPreviewProp(null); }}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit Details
                  </Button>
                  <Button variant="hero" onClick={() => setPreviewProp(null)}>Done</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}