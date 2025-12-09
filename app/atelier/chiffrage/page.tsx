"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, Package, Pencil, Plus, Trash2 } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { MobileBackButton } from "@/components/layout/mobile-back-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

type CatalogMaterial = {
  id: string;
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
};

type CustomLine = {
  id: string;
  name: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  total: number;
};

type ClientOption = {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  companyName?: string | null;
};

const generateId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function ChiffragePage() {
  const [catalog, setCatalog] = useState<CatalogMaterial[]>([]);
  const [savedCalculations, setSavedCalculations] = useState<any[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [allClients, setAllClients] = useState<any[]>([]);

  const [lines, setLines] = useState<CustomLine[]>([]);
  const [calcName, setCalcName] = useState("");
  const [marginPercent, setMarginPercent] = useState("15");
  const [laborCost, setLaborCost] = useState("0");
  const [selectionId, setSelectionId] = useState("");
  const [selectionQuantity, setSelectionQuantity] = useState("1");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedClientName, setSelectedClientName] = useState("");
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingCalcId, setEditingCalcId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState({
    name: "",
    category: "bois",
    unit: "",
    unitPrice: "",
    quantity: "",
  });

  useEffect(() => {
    fetchCatalog();
    fetchCalculations();
    fetchClients();
  }, []);

  const fetchCatalog = async () => {
    try {
      const res = await fetch("/api/materials");
      if (!res.ok) throw new Error("Impossible de charger votre catalogue.");
      const data = await res.json();
      setCatalog(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    }
  };

  const fetchCalculations = async () => {
    try {
      const res = await fetch("/api/materials/calculations");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            errorData.details ||
            "Impossible de charger l'historique."
        );
      }
      const data = await res.json();
      setSavedCalculations(data);
    } catch (err) {
      console.error("Erreur lors du chargement de l'historique:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Impossible de charger vos clients.");
      const data = await res.json();
      setAllClients(data);
      setClients(
        data.map((client: any) => ({
          id: client.id,
          label: client.companyName || `${client.firstName} ${client.lastName}`,
          firstName: client.firstName,
          lastName: client.lastName,
          companyName: client.companyName,
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const updateLine = (id: string, field: keyof CustomLine, value: string) => {
    setLines((current) =>
      current.map((line) => {
        if (line.id !== id) return line;
        const next: CustomLine = { ...line };
        if (field === "unitPrice" || field === "quantity") {
          const numeric = parseFloat(value);
          next[field] = Number.isNaN(numeric) ? 0 : numeric;
        } else {
          // @ts-expect-error dynamic assign
          next[field] = value;
        }
        next.total = Math.round(next.unitPrice * next.quantity * 100) / 100;
        return next;
      })
    );
  };

  const addManualLine = () => {
    // Validation du formulaire
    if (!manualForm.name.trim()) {
      setError("Le nom est obligatoire.");
      return;
    }
    if (!manualForm.unit.trim()) {
      setError("L'unité est obligatoire.");
      return;
    }
    const parsedPrice = parseFloat(manualForm.unitPrice);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Indique un prix unitaire valide.");
      return;
    }
    const parsedQuantity = parseFloat(manualForm.quantity);
    if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setError("Indique une quantité valide.");
      return;
    }

    const total = Math.round(parsedPrice * parsedQuantity * 100) / 100;
    setLines((current) => [
      ...current,
      {
        id: generateId(),
        name: manualForm.name.trim(),
        unit: manualForm.unit.trim(),
        unitPrice: parsedPrice,
        quantity: parsedQuantity,
        total,
      },
    ]);
    
    // Réinitialiser le formulaire
    setManualForm({
      name: "",
      category: "bois",
      unit: "",
      unitPrice: "",
      quantity: "",
    });
    setShowManualForm(false);
    setMessage("Ligne libre ajoutée.");
    setError(null);
  };

  const addCatalogLine = () => {
    if (!selectionId) {
      setError("Choisis un matériau dans ton catalogue.");
      return;
    }
    const quantity = parseFloat(selectionQuantity);
    if (Number.isNaN(quantity) || quantity <= 0) {
      setError("Indique une quantité valide.");
      return;
    }
    const material = catalog.find((item) => item.id === selectionId);
    if (!material) {
      setError("Matériau introuvable.");
      return;
    }

    const total = Math.round(material.unitPrice * quantity * 100) / 100;
    setLines((current) => [
      ...current,
      {
        id: generateId(),
        name: material.name,
        unit: material.unit,
        unitPrice: material.unitPrice,
        quantity,
        total,
      },
    ]);
    setSelectionId("");
    setSelectionQuantity("1");
    setError(null);
    setMessage("Ligne ajoutée depuis le catalogue.");
  };

  const removeLine = (id: string) => {
    setLines((current) => current.filter((line) => line.id !== id));
  };

  const resetLines = () => {
    setLines([]);
    setMessage(null);
    setError(null);
    setEditingCalcId(null);
    setCalcName("Projet sur mesure");
    setMarginPercent("15");
    setLaborCost("0");
    setSelectedClientId("");
  };

  const materialsTotal = useMemo(
    () =>
      Math.round(lines.reduce((sum, line) => sum + line.total, 0) * 100) / 100,
    [lines]
  );
  const laborValue = useMemo(() => parseFloat(laborCost) || 0, [laborCost]);
  const marginValue = useMemo(
    () => parseFloat(marginPercent) || 0,
    [marginPercent]
  );
  const baseTotal = useMemo(
    () => materialsTotal + laborValue,
    [materialsTotal, laborValue]
  );
  const finalTotal = useMemo(
    () => Math.round(baseTotal * (1 + marginValue / 100) * 100) / 100,
    [baseTotal, marginValue]
  );

  const saveCalculation = async () => {
    if (lines.length === 0) {
      setError("Ajoute au moins une ligne avant de sauvegarder.");
      return;
    }
    setError(null);
    setMessage(null);
    try {
      const payload = {
        projectType: calcName || "Projet sur mesure",
        dimensions: {
          mode: "custom",
          marginPercent: marginValue,
          laborCost: laborValue,
          name: calcName,
        },
        materials: lines.map((line) => ({
          name: line.name,
          unit: line.unit,
          unitPrice: line.unitPrice,
          quantity: line.quantity,
          total: line.total,
        })),
        totalCost: finalTotal,
        clientId: selectedClientId || null,
      };

      const url = editingCalcId
        ? `/api/materials/calculations/${editingCalcId}`
        : "/api/materials/calculations";
      const method = editingCalcId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Impossible de sauvegarder ce calcul.");
      }

      setMessage(editingCalcId ? "Calcul mis à jour." : "Calcul sauvegardé.");
      setEditingCalcId(null);
      fetchCalculations();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    }
  };

  const loadCalculation = (calc: any) => {
    try {
      const parsedMaterials = JSON.parse(calc.materials || "[]");
      const parsedDimensions = JSON.parse(calc.dimensions || "{}");
      setLines(
        parsedMaterials.map((item: any) => ({
          id: generateId(),
          name: item.name,
          unit: item.unit,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          total: item.total,
        }))
      );
      setCalcName(calc.projectType || "");
      setMarginPercent(
        parsedDimensions?.marginPercent !== undefined
          ? String(parsedDimensions.marginPercent)
          : marginPercent
      );
      setLaborCost(
        parsedDimensions?.laborCost !== undefined
          ? String(parsedDimensions.laborCost)
          : laborCost
      );
      setSelectedClientId(calc.client?.id || "");
      setEditingCalcId(calc.id);
      setMessage("Calcul chargé dans le formulaire.");
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger ce calcul.");
    }
  };

  const deleteCalculation = async (id: string) => {
    const confirmed = window.confirm("Supprimer ce chiffrage ?");
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/materials/calculations/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Impossible de supprimer ce chiffrage.");
      if (editingCalcId === id) {
        resetLines();
      }
      setMessage("Chiffrage supprimé.");
      fetchCalculations();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-10">
        <MobileBackButton href="/atelier" label="Retour à l'atelier" />
        <div>
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
            Chiffrage personnalisé
          </p>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Compose tes devis sur mesure
          </h1>
          <p className="text-base text-muted-foreground max-w-3xl">
            Sélectionne les matériaux de ton catalogue, ajoute des lignes
            libres, applique ta marge et ta main-d'œuvre puis sauvegarde le
            chiffrage pour l'injecter dans un devis ou une facture.
          </p>
        </div>

        <Card className="hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Chiffrage
            </CardTitle>
            <CardDescription>
              Utilise ton catalogue ou crée des lignes sur mesure.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Titre du projet</Label>
                <Input
                  value={calcName}
                  onChange={(e) => setCalcName(e.target.value)}
                  placeholder="Ex: Cuisine moderne avec îlot"
                />
              </div>
              <div className="space-y-2">
                <Label>Marge (%)</Label>
                <Input
                  type="number"
                  value={marginPercent}
                  onChange={(e) => setMarginPercent(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Main-d'œuvre (€)</Label>
                <Input
                  type="number"
                  value={laborCost}
                  onChange={(e) => setLaborCost(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Associer à un client</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowClientModal(true)}
                >
                  {selectedClientName || "Sélectionner un client"}
                </Button>
              </div>
            </div>

            <div className="space-y-4 p-4 bg-muted/30 rounded-2xl border-2 border-dashed">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">
                  Depuis ton catalogue
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Sélectionne un matériau déjà enregistré dans ton catalogue. Le
                nom, le prix et l'unité sont automatiquement pré-remplis avec
                tes tarifs personnels.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-3 space-y-2">
                  <Label>Matériau du catalogue</Label>
                  <Select
                    value={selectionId}
                    onChange={(e) => setSelectionId(e.target.value)}
                  >
                    <option value="">Choisir un matériau</option>
                    {catalog.map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.name} • {formatCurrency(material.unitPrice)} /{" "}
                        {material.unit}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantité</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={selectionQuantity}
                    onChange={(e) => setSelectionQuantity(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    className="w-full"
                    onClick={addCatalogLine}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4 bg-muted/30 rounded-2xl border-2 border-dashed">
              <div className="flex items-center gap-2 mb-3">
                <Plus className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Ligne libre</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Crée une ligne manuelle pour un matériau ponctuel non présent
                dans ton catalogue. Saisis toutes les informations nécessaires.
              </p>
              
              {!showManualForm ? (
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowManualForm(true);
                      setError(null);
                      setMessage(null);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une ligne libre
                  </Button>
                  {lines.length > 0 && (
                    <Button type="button" variant="ghost" onClick={resetLines}>
                      Réinitialiser
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4 p-4 bg-background rounded-2xl border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nom *</Label>
                      <Input
                        value={manualForm.name}
                        onChange={(e) =>
                          setManualForm({ ...manualForm, name: e.target.value })
                        }
                        placeholder="Ex: Plan de travail"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Catégorie</Label>
                      <Select
                        value={manualForm.category}
                        onChange={(e) =>
                          setManualForm({ ...manualForm, category: e.target.value })
                        }
                      >
                        <option value="bois">Bois</option>
                        <option value="quincaillerie">Quincaillerie</option>
                        <option value="fourniture">Fourniture</option>
                        <option value="finitions">Finitions</option>
                        <option value="autre">Autre</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Unité de mesure *</Label>
                      <Select
                        value={manualForm.unit}
                        onChange={(e) =>
                          setManualForm({ ...manualForm, unit: e.target.value })
                        }
                      >
                        <option value="">Sélectionner une unité</option>
                        <option value="m²">m² (mètre carré)</option>
                        <option value="m">m (mètre linéaire)</option>
                        <option value="m³">m³ (mètre cube)</option>
                        <option value="kg">kg (kilogramme)</option>
                        <option value="unité">unité</option>
                        <option value="lot">lot</option>
                        <option value="forfait">forfait</option>
                        <option value="paire">paire</option>
                        <option value="pièce">pièce</option>
                        <option value="boîte">boîte</option>
                        <option value="rouleau">rouleau</option>
                        <option value="plaquette">plaquette</option>
                        <option value="panneau">panneau</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Prix unitaire (€) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={manualForm.unitPrice}
                        onChange={(e) =>
                          setManualForm({ ...manualForm, unitPrice: e.target.value })
                        }
                        placeholder="Ex: 80.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Quantité *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={manualForm.quantity}
                        onChange={(e) =>
                          setManualForm({ ...manualForm, quantity: e.target.value })
                        }
                        placeholder="Ex: 5"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" onClick={addManualLine}>
                      Ajouter la ligne
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowManualForm(false);
                        setManualForm({
                          name: "",
                          category: "bois",
                          unit: "",
                          unitPrice: "",
                          quantity: "",
                        });
                        setError(null);
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && !error && (
              <p className="text-sm text-primary">{message}</p>
            )}

            {lines.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ajoute des matériaux pour démarrer ton chiffrage.
              </p>
            ) : (
              <div className="space-y-3">
                {lines.map((line) => (
                  <div
                    key={line.id}
                    className="rounded-2xl border p-4 space-y-3 bg-secondary/40"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Nom de l'article</Label>
                        <Input
                          value={line.name}
                          onChange={(e) =>
                            updateLine(line.id, "name", e.target.value)
                          }
                          placeholder="Ex: Plan de travail"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Unité</Label>
                        <Input
                          value={line.unit}
                          onChange={(e) =>
                            updateLine(line.id, "unit", e.target.value)
                          }
                          placeholder="Ex: m², m, unité"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Quantité</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={
                            line.quantity === 0 ? "" : line.quantity.toString()
                          }
                          onChange={(e) =>
                            updateLine(line.id, "quantity", e.target.value)
                          }
                          placeholder="Ex: 5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Prix unitaire (€)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={
                            line.unitPrice === 0
                              ? ""
                              : line.unitPrice.toString()
                          }
                          onChange={(e) =>
                            updateLine(line.id, "unitPrice", e.target.value)
                          }
                          placeholder="Ex: 80.00"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Total ligne :{" "}
                        <span className="font-semibold">
                          {formatCurrency(line.total)}
                        </span>
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLine(line.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/40 p-4 rounded-2xl">
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Matériaux
                </p>
                <p className="font-semibold">
                  {formatCurrency(materialsTotal)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Main-d'œuvre
                </p>
                <p className="font-semibold">{formatCurrency(laborValue)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Marge ({marginValue} %)
                </p>
                <p className="font-semibold">
                  {formatCurrency(Math.max(finalTotal - baseTotal, 0))}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Total TTC estimé
                </p>
                <p className="font-bold text-primary">
                  {formatCurrency(finalTotal)}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              {editingCalcId && (
                <Button type="button" variant="ghost" onClick={resetLines}>
                  Annuler la modification
                </Button>
              )}
              <Button type="button" size="lg" onClick={saveCalculation}>
                {editingCalcId ? "Mettre à jour" : "Sauvegarder ce calcul"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle>Historique des chiffrages</CardTitle>
            <CardDescription>
              Les derniers calculs sauvegardés (max 10). Réutilise-les dans tes
              devis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {savedCalculations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun calcul sauvegardé pour le moment.
              </p>
            ) : (
              <div className="space-y-3">
                {savedCalculations.map((calc) => (
                  <div
                    key={calc.id}
                    className="p-4 rounded-2xl bg-secondary/50 border border-border/60 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-semibold">{calc.projectType}</p>
                      <p className="text-sm text-muted-foreground">
                        Total : {formatCurrency(calc.totalCost)}
                      </p>
                      {calc.client && (
                        <p className="text-xs text-muted-foreground">
                          Client :{" "}
                          {calc.client.companyName ||
                            `${calc.client.firstName} ${calc.client.lastName}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {new Date(calc.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadCalculation(calc)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => deleteCalculation(calc.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-3xl border bg-card shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <p className="text-lg font-semibold text-foreground">
                  Sélectionner un client
                </p>
                <p className="text-sm text-muted-foreground">
                  Choisissez un client pour associer ce chiffrage.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClientModal(false)}
              >
                Fermer
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClientId("");
                    setSelectedClientName("Aucun");
                    setShowClientModal(false);
                  }}
                  className="w-full text-left rounded-xl border p-4 hover:bg-muted transition-colors"
                >
                  <p className="font-semibold text-foreground">Aucun client</p>
                  <p className="text-sm text-muted-foreground">
                    Ne pas associer de client à ce chiffrage
                  </p>
                </button>
                {allClients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => {
                      setSelectedClientId(client.id);
                      setSelectedClientName(
                        client.companyName ||
                          `${client.firstName} ${client.lastName}`
                      );
                      setShowClientModal(false);
                    }}
                    className="w-full text-left rounded-xl border p-4 hover:bg-muted transition-colors"
                  >
                    <p className="font-semibold text-foreground">
                      {client.companyName ||
                        `${client.firstName} ${client.lastName}`}
                    </p>
                    {client.companyName && (
                      <p className="text-sm text-muted-foreground">
                        Contact : {client.firstName} {client.lastName}
                      </p>
                    )}
                    {client.email && (
                      <p className="text-xs text-muted-foreground">
                        {client.email}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
