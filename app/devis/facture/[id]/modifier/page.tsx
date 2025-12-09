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

interface FactureItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export default function ModifierFacturePage() {
  const router = useRouter();
  const params = useParams();
  const factureId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [userPaymentTerms, setUserPaymentTerms] = useState<string | null>(null);
  const [userPaymentMethod, setUserPaymentMethod] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    clientId: "",
    tvaRate: 20,
    isVatApplicable: true,
    dueDate: "",
    serviceDate: "",
    paymentTerms: "",
    paymentMethod: "",
    legalMentions: "",
  });

  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const [items, setItems] = useState<FactureItem[]>([]);

  useEffect(() => {
    fetchFacture();
    fetchProjects();
    fetchUserSettings();
  }, [factureId]);

  const fetchFacture = async () => {
    try {
      const res = await fetch(`/api/facture/${factureId}`);
      if (!res.ok) {
        throw new Error("Facture non trouvée");
      }
      const facture = await res.json();

      // Pré-remplir le formulaire avec les données de la facture
      setFormData({
        title: facture.title || "",
        description: facture.description || "",
        projectId: facture.projectId || "",
        clientId: facture.clientId || "",
        tvaRate: facture.tvaRate || 20,
        isVatApplicable: facture.isVatApplicable !== false,
        dueDate: facture.dueDate
          ? new Date(facture.dueDate).toISOString().split("T")[0]
          : "",
        serviceDate: facture.serviceDate
          ? new Date(facture.serviceDate).toISOString().split("T")[0]
          : "",
        paymentTerms: facture.paymentTerms || "",
        paymentMethod: facture.paymentMethod || "",
        legalMentions: facture.legalMentions || "",
      });

      // Pré-remplir les items
      if (facture.items && facture.items.length > 0) {
        setItems(
          facture.items.map((item: any) => ({
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
      if (facture.project) {
        setSelectedProject(facture.project);
      }

      setLoadingData(false);
    } catch (error) {
      console.error("Erreur lors du chargement de la facture:", error);
      alert("Erreur lors du chargement de la facture");
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
        setUserPaymentMethod(user.paymentMethod || null);
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
    field: keyof Omit<FactureItem, "id">,
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

    if (!formData.title.trim()) {
      errors.push("Le titre est obligatoire");
    }

    if (!formData.serviceDate) {
      errors.push("La date de prestation est obligatoire");
    }

    if (!formData.paymentTerms || formData.paymentTerms.trim() === "") {
      errors.push("Le délai de paiement est obligatoire");
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
        "Au moins une ligne de facture doit avoir un montant supérieur à 0"
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
      const response = await fetch(`/api/facture/${factureId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: items.map(({ id, ...item }) => item),
          totalHT,
          totalTTC,
          projectId: formData.projectId || null,
          clientId: formData.clientId || null,
          dueDate: formData.dueDate
            ? new Date(formData.dueDate).toISOString()
            : null,
          serviceDate: formData.serviceDate
            ? new Date(formData.serviceDate).toISOString()
            : null,
          paymentTerms: formData.paymentTerms || userPaymentTerms || null,
          paymentMethod: formData.paymentMethod || userPaymentMethod || null,
          legalMentions: formData.legalMentions || null,
          isVatApplicable: formData.isVatApplicable !== false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Erreur lors de la modification de la facture"
        );
      }

      router.push(`/devis/facture/${factureId}`);
    } catch (error: any) {
      console.error("Erreur détaillée:", error);
      alert(error?.message || "Erreur lors de la modification de la facture");
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
        <MobileBackButton
          href={`/devis/facture/${factureId}`}
          label="Retour à la facture"
        />
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 lg:mb-12 text-foreground">
          Modifier la facture
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
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
                    <Label htmlFor="projectId">Projet</Label>
                    <Select
                      id="projectId"
                      value={formData.projectId}
                      onChange={(e) => {
                        handleProjectChange(e.target.value);
                      }}
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
                      <Label htmlFor="serviceDate">Date de prestation *</Label>
                      <Input
                        id="serviceDate"
                        type="date"
                        value={formData.serviceDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            serviceDate: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Date d'échéance</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dueDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Délai de paiement *</Label>
                    <Textarea
                      id="paymentTerms"
                      value={formData.paymentTerms}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentTerms: e.target.value,
                        })
                      }
                      rows={2}
                      placeholder="Ex: 30 jours, À réception, etc."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Moyens de paiement acceptés</Label>
                    <Textarea
                      id="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentMethod: e.target.value,
                        })
                      }
                      rows={2}
                      placeholder="Ex: Virement bancaire, Chèque, Espèces, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legalMentions">Mentions légales complémentaires</Label>
                    <Textarea
                      id="legalMentions"
                      value={formData.legalMentions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          legalMentions: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Mentions légales spécifiques à cette facture"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Lignes de facture</CardTitle>
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
                  <div className="border-t pt-4 flex justify-between text-lg font-bold">
                    <span>Total TTC</span>
                    <span>{totalTTC.toFixed(2)} €</span>
                  </div>
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

