"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { MobileBackButton } from "@/components/layout/mobile-back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { formatClientName } from "@/lib/utils";

interface DevisItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export default function ModifierDevisPage() {
  const router = useRouter();
  const params = useParams();
  const devisId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [userPaymentTerms, setUserPaymentTerms] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    clientId: "",
    tvaRate: 20,
    isVatApplicable: true,
    validUntil: "",
    advancePayment: "",
    cgvReference: "",
    workStartDate: "",
    workDuration: "",
    travelExpenses: "",
    insuranceInfo: "",
    afterSalesService: "",
  });

  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const [items, setItems] = useState<DevisItem[]>([]);

  useEffect(() => {
    fetchDevis();
    fetchProjects();
    fetchUserSettings();
  }, [devisId]);

  const fetchDevis = async () => {
    try {
      const res = await fetch(`/api/devis/${devisId}`);
      if (!res.ok) {
        throw new Error("Devis non trouvé");
      }
      const devis = await res.json();

      // Pré-remplir le formulaire avec les données du devis
      setFormData({
        title: devis.title || "",
        description: devis.description || "",
        projectId: devis.projectId || "",
        clientId: devis.clientId || "",
        tvaRate: devis.tvaRate || 20,
        isVatApplicable: devis.isVatApplicable !== false,
        validUntil: devis.validUntil
          ? new Date(devis.validUntil).toISOString().split("T")[0]
          : "",
        advancePayment: devis.advancePayment?.toString() || "",
        cgvReference: devis.cgvReference || "",
        workStartDate: devis.workStartDate
          ? new Date(devis.workStartDate).toISOString().split("T")[0]
          : "",
        workDuration: devis.workDuration || "",
        travelExpenses: devis.travelExpenses?.toString() || "",
        insuranceInfo: devis.insuranceInfo || "",
        afterSalesService: devis.afterSalesService || "",
      });

      // Pré-remplir les items
      if (devis.items && devis.items.length > 0) {
        setItems(
          devis.items.map((item: any) => ({
            id: generateId(),
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            total: item.total,
          }))
        );
      } else {
        setItems([
          {
            id: generateId(),
            description: "",
            quantity: 1,
            unit: "m²",
            unitPrice: 0,
            total: 0,
          },
        ]);
      }

      // Pré-remplir le projet sélectionné
      if (devis.project) {
        setSelectedProject(devis.project);
      }

      setLoadingData(false);
    } catch (error) {
      console.error("Erreur lors du chargement du devis:", error);
      alert("Erreur lors du chargement du devis");
      router.push("/devis");
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des projets", error);
    }
  };

  const fetchUserSettings = async () => {
    try {
      const res = await fetch("/api/user/settings");
      if (res.ok) {
        const user = await res.json();
        setUserPaymentTerms(user.paymentTerms || null);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des paramètres", error);
    }
  };

  const handleProjectChange = (projectId: string) => {
    if (!projectId) {
      setSelectedProject(null);
      setFormData((prev) => ({
        ...prev,
        projectId: "",
        clientId: "",
      }));
      return;
    }

    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      setFormData((prev) => ({
        ...prev,
        projectId: projectId,
        clientId: project.client?.id || "",
      }));
    }
  };

  const updateItem = (
    id: string,
    field: keyof Omit<DevisItem, "id">,
    value: any
  ) => {
    const newItems = items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          const quantity = parseFloat(updated.quantity.toString()) || 0;
          const unitPrice = parseFloat(updated.unitPrice.toString()) || 0;
          updated.total = Math.round(quantity * unitPrice * 100) / 100;
        }
        return updated;
      }
      return item;
    });
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: generateId(),
        description: "",
        quantity: 1,
        unit: "m²",
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const calculateTotals = () => {
    const totalHT =
      Math.round(items.reduce((sum, item) => sum + item.total, 0) * 100) / 100;
    const tva = formData.isVatApplicable
      ? Math.round(totalHT * (formData.tvaRate / 100) * 100) / 100
      : 0;
    const totalTTC = Math.round((totalHT + tva) * 100) / 100;
    return { totalHT, tva, totalTTC };
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.projectId) {
      errors.push("Veuillez sélectionner un projet");
    }

    if (!formData.title.trim()) {
      errors.push("Le titre est obligatoire");
    }

    if (!formData.validUntil) {
      errors.push("La date de validité est obligatoire");
    }

    if (!userPaymentTerms || userPaymentTerms.trim() === "") {
      errors.push(
        "Le délai de paiement est obligatoire. Veuillez le configurer dans vos paramètres entreprise."
      );
    }

    if (!formData.workStartDate) {
      errors.push("La date de début des travaux est obligatoire");
    }

    if (!formData.workDuration.trim()) {
      errors.push("La durée estimée des travaux est obligatoire");
    }

    const emptyItems = items.filter(
      (item) =>
        !item.description.trim() || item.quantity <= 0 || item.unitPrice <= 0
    );
    if (emptyItems.length > 0) {
      errors.push(
        "Toutes les lignes doivent avoir une description, une quantité et un prix unitaire valides"
      );
    }

    const validItems = items.filter((item) => item.total > 0);
    if (validItems.length === 0) {
      errors.push(
        "Au moins une ligne de devis doit avoir un montant supérieur à 0"
      );
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      alert("Erreurs de validation :\n" + errors.join("\n"));
      return;
    }

    setLoading(true);

    const { totalHT, totalTTC } = calculateTotals();

    try {
      const response = await fetch(`/api/devis/${devisId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: items.map(({ id, ...item }) => item),
          totalHT,
          totalTTC,
          projectId: formData.projectId || null,
          clientId: formData.clientId || null,
          validUntil: formData.validUntil
            ? new Date(formData.validUntil).toISOString()
            : null,
          advancePayment: formData.advancePayment
            ? parseFloat(formData.advancePayment)
            : null,
          paymentTerms: userPaymentTerms || null,
          isVatApplicable: formData.isVatApplicable !== false,
          cgvReference: formData.cgvReference || null,
          workStartDate: formData.workStartDate
            ? new Date(formData.workStartDate).toISOString()
            : null,
          workDuration: formData.workDuration || null,
          travelExpenses: formData.travelExpenses
            ? parseFloat(formData.travelExpenses)
            : null,
          insuranceInfo: formData.insuranceInfo || null,
          afterSalesService: formData.afterSalesService || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Erreur lors de la modification du devis"
        );
      }

      router.push(`/devis/${devisId}`);
    } catch (error: any) {
      console.error("Erreur détaillée:", error);
      alert(error?.message || "Erreur lors de la modification du devis");
    } finally {
      setLoading(false);
    }
  };

  const { totalHT, tva, totalTTC } = calculateTotals();

  if (loadingData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-12">
          <p className="text-center">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-12">
        <MobileBackButton href={`/devis/${devisId}`} label="Retour au devis" />
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 lg:mb-12 text-foreground">
          Modifier le devis
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-4 sm:gap-6">
              <Card className="hover:shadow-xl transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="text-xl">Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="projectId">Projet *</Label>
                    <Select
                      id="projectId"
                      value={formData.projectId}
                      onChange={(e) => {
                        handleProjectChange(e.target.value);
                      }}
                      required
                    >
                      <option value="">Sélectionner un projet</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}{" "}
                          {project.client
                            ? `- ${formatClientName(project.client)}`
                            : ""}
                        </option>
                      ))}
                    </Select>
                    {selectedProject && (
                      <div className="mt-2 p-3 bg-muted/50 rounded-xl border">
                        {selectedProject.client ? (
                          <>
                            <p className="text-sm font-medium text-foreground mb-1">
                              Client associé :
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatClientName(selectedProject.client)}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            ⚠️ Ce projet n'a pas de client associé.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="validUntil">Valide jusqu'au *</Label>
                      <Input
                        id="validUntil"
                        type="date"
                        value={formData.validUntil}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            validUntil: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="isVatApplicable">TVA applicable</Label>
                      <Select
                        id="isVatApplicable"
                        value={formData.isVatApplicable ? "true" : "false"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isVatApplicable: e.target.value === "true",
                          })
                        }
                      >
                        <option value="true">Oui (redevable TVA)</option>
                        <option value="false">Non (art. 293 B du CGI)</option>
                      </Select>
                    </div>
                  </div>
                  {formData.isVatApplicable && (
                    <div className="space-y-2">
                      <Label htmlFor="tvaRate">Taux TVA (%)</Label>
                      <Input
                        id="tvaRate"
                        type="number"
                        value={formData.tvaRate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tvaRate: parseFloat(e.target.value),
                          })
                        }
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="advancePayment">Acompte (€)</Label>
                    <Input
                      id="advancePayment"
                      type="number"
                      value={formData.advancePayment}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          advancePayment: e.target.value,
                        })
                      }
                      min="0"
                      step="0.01"
                    />
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      Montant de l'acompte éventuel
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="workStartDate">
                        Date de début des travaux *
                      </Label>
                      <Input
                        id="workStartDate"
                        type="date"
                        value={formData.workStartDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            workStartDate: e.target.value,
                          })
                        }
                        required
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workDuration">
                        Durée estimée des travaux *
                      </Label>
                      <Select
                        id="workDuration"
                        value={formData.workDuration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            workDuration: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Sélectionner une durée</option>
                        <option value="1 semaine">1 semaine</option>
                        <option value="2 semaines">2 semaines</option>
                        <option value="3 semaines">3 semaines</option>
                        <option value="4 semaines">4 semaines</option>
                        <option value="1 mois">1 mois</option>
                        <option value="1,5 mois">1,5 mois</option>
                        <option value="2 mois">2 mois</option>
                        <option value="3 mois">3 mois</option>
                        <option value="4 mois">4 mois</option>
                        <option value="5 mois">5 mois</option>
                        <option value="6 mois">6 mois</option>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="travelExpenses">
                        Frais de déplacement (€)
                      </Label>
                      <Input
                        id="travelExpenses"
                        type="number"
                        value={formData.travelExpenses}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            travelExpenses: e.target.value,
                          })
                        }
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        Si des frais de déplacement sont prévus
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cgvReference">Référence CGV</Label>
                      <Input
                        id="cgvReference"
                        value={formData.cgvReference}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cgvReference: e.target.value,
                          })
                        }
                        placeholder="Ex: CGV-2024, Voir conditions générales"
                      />
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        Référence aux Conditions Générales de Vente
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insuranceInfo">
                      Assurance professionnelle
                    </Label>
                    <Textarea
                      id="insuranceInfo"
                      value={formData.insuranceInfo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          insuranceInfo: e.target.value,
                        })
                      }
                      rows={2}
                      placeholder="Ex: Assurance RC Pro souscrite auprès de [Assureur], couverture géographique: France métropolitaine"
                    />
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      Recommandé pour les artisans : nom de l'assureur,
                      couverture géographique
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="afterSalesService">
                      Conditions de service après-vente
                    </Label>
                    <Textarea
                      id="afterSalesService"
                      value={formData.afterSalesService}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          afterSalesService: e.target.value,
                        })
                      }
                      rows={2}
                      placeholder="Ex: Garantie 2 ans pièces et main-d'œuvre, intervention sous 48h"
                    />
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      Si applicable, précisez les conditions du service
                      après-vente
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Lignes de devis</CardTitle>
                    <Button
                      type="button"
                      onClick={addItem}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border p-4 space-y-3 bg-secondary/40"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                            <Label className="text-xs">Nom de l'article</Label>
                            <Input
                              value={item.description}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Ex: Plan de travail"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Unité</Label>
                            <Select
                              value={item.unit}
                              onChange={(e) =>
                                updateItem(item.id, "unit", e.target.value)
                              }
                            >
                              <option value="m²">m² (mètre carré)</option>
                              <option value="m">m (mètre linéaire)</option>
                              <option value="m³">m³ (mètre cube)</option>
                              <option value="unité">unité</option>
                              <option value="lot">lot</option>
                              <option value="forfait">forfait</option>
                              <option value="paire">paire</option>
                              <option value="pièce">pièce</option>
                              <option value="planche">planche</option>
                              <option value="panneau">panneau</option>
                              <option value="boîte">boîte</option>
                              <option value="rouleau">rouleau</option>
                              <option value="kg">kg (kilogramme)</option>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Quantité</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={
                                item.quantity === 0
                                  ? ""
                                  : item.quantity.toString()
                              }
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "quantity",
                                  parseFloat(e.target.value) || 0
                                )
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
                                item.unitPrice === 0
                                  ? ""
                                  : item.unitPrice.toString()
                              }
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "unitPrice",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder="Ex: 80.00"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Total ligne :{" "}
                            <span className="font-semibold">
                              {item.total.toFixed(2)} €
                            </span>
                          </p>
                          {items.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="hover:shadow-xl transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="text-xl">Récapitulatif</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total HT</span>
                    <span className="font-medium">{totalHT.toFixed(2)} €</span>
                  </div>
                  {formData.isVatApplicable ? (
                    <div className="flex justify-between">
                      <span>TVA ({formData.tvaRate}%)</span>
                      <span className="font-medium">{tva.toFixed(2)} €</span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span>TVA</span>
                      <span className="font-medium text-muted-foreground">
                        Non applicable
                      </span>
                    </div>
                  )}
                  {formData.advancePayment &&
                    parseFloat(formData.advancePayment) > 0 && (
                      <div className="flex justify-between pt-2 border-t">
                        <span>Acompte</span>
                        <span className="font-medium text-primary">
                          {parseFloat(formData.advancePayment).toFixed(2)} €
                        </span>
                      </div>
                    )}
                  <div className="border-t pt-4 flex justify-between text-lg font-bold">
                    <span>Total TTC</span>
                    <span>{totalTTC.toFixed(2)} €</span>
                  </div>
                  {formData.advancePayment &&
                    parseFloat(formData.advancePayment) > 0 && (
                      <div className="flex justify-between text-base font-semibold pt-2 border-t text-primary">
                        <span>Reste à payer</span>
                        <span>
                          {(
                            totalTTC - parseFloat(formData.advancePayment)
                          ).toFixed(2)}{" "}
                          €
                        </span>
                      </div>
                    )}
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? "Modification..." : "Enregistrer les modifications"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  size="lg"
                  className="rounded-xl"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

