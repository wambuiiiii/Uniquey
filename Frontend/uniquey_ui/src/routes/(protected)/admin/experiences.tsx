import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, Loader2, PlusCircle, X, UploadCloud } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import axiosInstance from "@/api/axios";

export const Route = createFileRoute("/(protected)/admin/experiences")({
  component: AdminExperiences,
});

type FAQ = { q: string; a: string };

type Package = {
  id?: string;
  name: string;
  tagline: string;
  slug: string;
  description: string;
  hero_image?: string | null;
  starting_price: string;
  active: boolean;
  audience: string[];
  included: string[];
  addons: string[];
  faqs: FAQ[];
};

const emptyDraft: Package = {
  name: "", tagline: "", slug: "", description: "", hero_image: null, starting_price: "", active: true,
  audience: [], included: [], addons: [], faqs: [],
};

const arrToStr = (arr: string[]) => (Array.isArray(arr) ? arr : []).join("\n");
const strToArr = (str: string) => str.split("\n").map(s => s.trim()).filter(Boolean);

function AdminExperiences() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Package>(emptyDraft);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await axiosInstance.get("packages/");
      setPackages(response.data.results || response.data);
    } catch (error) {
      console.error("Failed to fetch packages", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFile = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleOpenNew = () => {
    setDraft(emptyDraft);
    setImageFile(null);
    setImagePreview(null);
    setIsEditing(false);
    setOpen(true);
  };

  const handleOpenEdit = (pkg: Package) => {
    setDraft(pkg);
    setImageFile(null);
    setImagePreview(pkg.hero_image || null);
    setIsEditing(true);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!draft.name) {
      alert("Please enter a Title for the experience.");
      return;
    }

    setIsSaving(true);

    const formData = new FormData();
    formData.append("name", draft.name);
    formData.append("tagline", draft.tagline || "");
    formData.append("description", draft.description || "");
    formData.append("starting_price", draft.starting_price || "0.00");
    formData.append("active", String(draft.active));

    const slug = draft.slug || draft.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    formData.append("slug", slug);

    formData.append("audience", JSON.stringify(draft.audience || []));
    formData.append("included", JSON.stringify(draft.included || []));
    formData.append("addons", JSON.stringify(draft.addons || []));
    formData.append("faqs", JSON.stringify(draft.faqs || []));

    if (imageFile) {
      formData.append("hero_image", imageFile);
    }

    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (isEditing && draft.id) {
        const res = await axiosInstance.patch(`packages/${draft.id}/`, formData, config);
        setPackages((prev) => prev.map((p) => (p.id === draft.id ? res.data : p)));
      } else {
        const res = await axiosInstance.post("packages/", formData, config);
        setPackages((prev) => [res.data, ...prev]);
      }
      setOpen(false);
    } catch (error: any) {
      console.error("Save failed:", error.response?.data || error);
      alert("Failed to save experience. Please check your backend connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this experience?")) return;
    try {
      await axiosInstance.delete(`packages/${id}/`);
      setPackages((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete the package.");
    }
  };

  const filtered = packages.filter((p) =>
    (p.name + p.description).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Catalog</p>
          <h1 className="mt-1 font-serif text-3xl text-foreground">Experiences</h1>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <Button variant="hero" onClick={handleOpenNew}>
            <Plus className="mr-1.5 h-4 w-4" /> Add experience
          </Button>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif">{isEditing ? "Edit experience" : "New experience"}</DialogTitle>
              <DialogDescription>
                Fill out the details below to create or update an experience package.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-2">

              {/* Photo Upload Area */}
              <div className="space-y-1.5">
                <Label>Hero Image</Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleSelectFile(e.target.files[0])}
                />
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center ${
                    isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  {imagePreview ? (
                    <div className="relative w-full max-h-48 overflow-hidden rounded-md group">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-md" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-medium">
                        Click or drag to replace image
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-3 bg-muted rounded-full inline-block">
                        <UploadCloud className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">Drag and drop high-res cover photo, or click to browse</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP (Recommended: 1200 x 800px)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Starting Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Starting Price (KES)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={draft.starting_price}
                    onChange={(e) => setDraft({ ...draft, starting_price: e.target.value })}
                  />
                </div>
              </div>

              {/* Tagline */}
              <div className="space-y-1.5">
                <Label>Tagline (Short Summary for cards & header)</Label>
                <Input
                  value={draft.tagline}
                  onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
                />
              </div>

              {/* Full Description */}
              <div className="space-y-1.5">
                <Label>Full Description</Label>
                <Textarea
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>

              {/* Lists - Removed placeholder text info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Who this is for (1 per line)</Label>
                  <Textarea
                    rows={4}
                    value={arrToStr(draft.audience)}
                    onChange={(e) => setDraft({ ...draft, audience: strToArr(e.target.value) })}
                    className="text-xs"
                    placeholder=""
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">What's included (1 per line)</Label>
                  <Textarea
                    rows={4}
                    value={arrToStr(draft.included)}
                    onChange={(e) => setDraft({ ...draft, included: strToArr(e.target.value) })}
                    className="text-xs"
                    placeholder=""
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Optional add-ons (1 per line)</Label>
                  <Textarea
                    rows={4}
                    value={arrToStr(draft.addons)}
                    onChange={(e) => setDraft({ ...draft, addons: strToArr(e.target.value) })}
                    className="text-xs"
                    placeholder=""
                  />
                </div>
              </div>

              {/* FAQs */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between items-center">
                  <Label>Frequently Asked Questions</Label>
                  <Button variant="outline" size="sm" onClick={() => setDraft({ ...draft, faqs: [...draft.faqs, { q: "", a: "" }] })}>
                    <PlusCircle className="h-4 w-4 mr-1"/> Add FAQ
                  </Button>
                </div>
                {draft.faqs.map((faq, i) => (
                  <div key={i} className="flex gap-2 items-start bg-muted/30 p-2 rounded-md">
                    <div className="grid flex-1 gap-2">
                      <Input
                        placeholder="Question"
                        value={faq.q}
                        onChange={(e) => {
                          const newFaqs = [...draft.faqs]; newFaqs[i].q = e.target.value; setDraft({ ...draft, faqs: newFaqs });
                        }}
                      />
                      <Input
                        placeholder="Answer"
                        value={faq.a}
                        onChange={(e) => {
                          const newFaqs = [...draft.faqs]; newFaqs[i].a = e.target.value; setDraft({ ...draft, faqs: newFaqs });
                        }}
                      />
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDraft({ ...draft, faqs: draft.faqs.filter((_, idx) => idx !== i) })}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <p className="text-sm font-medium">Publish to live site</p>
                <Switch checked={draft.active} onCheckedChange={(v) => setDraft({ ...draft, active: v })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="hero" onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save experience"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search experiences" className="pl-9" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12 text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => (
            <Card key={r.id} className="border-border/60 overflow-hidden flex flex-col">
              {r.hero_image && (
                <div className="h-48 w-full overflow-hidden bg-muted flex items-center justify-center">
                  {/* object-cover ensures the image fills the space cleanly for a catalog card view */}
                  <img src={r.hero_image} alt={r.name} className="h-full w-full object-cover" />
                </div>
              )}
              <CardContent className="space-y-3 p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-serif text-lg text-foreground">{r.name}</p>
                  <Badge variant="outline" className={r.active ? "border-forest/40 bg-forest/10 text-forest" : "bg-muted text-muted-foreground"}>
                    {r.active ? <><Eye className="mr-1 h-3 w-3" /> Live</> : <><EyeOff className="mr-1 h-3 w-3" /> Draft</>}
                  </Badge>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">{r.tagline || r.description}</p>

                {/* mt-auto pushes the buttons to the bottom */}
                <div className="flex gap-2 pt-4 mt-auto">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleOpenEdit(r)}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => r.id && handleDelete(r.id)}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}