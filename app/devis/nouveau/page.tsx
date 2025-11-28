"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatClientName } from "@/lib/utils";

interface DevisItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export default function NouveauDevisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [calculations, setCalculations] = useState<any[]>([]);
  const [selectedCalculation, setSelectedCalculation] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    clientId: "",
    tvaRate: 20,
    isVatApplicable: true,
    validUntil: "",
    advancePayment: "",
    paymentTerms: "",
  });

  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const [items, setItems] = useState<DevisItem[]>(() => [
    {
      id: generateId(),
      description: "",
      quantity: 1,
      unit: "unité",
      unitPrice: 0,
      total: 0,
    },
  ]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      } else {
        console.error("Impossible de charger les projets");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des projets", error);
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchCalculationsForClient = async (clientId: string) => {
    try {
      const res = await fetch("/api/materials/calculations");
      if (res.ok) {
        const allCalculations = await res.json();
        // Filtrer les calculs pour ce client
        const clientCalculations = allCalculations.filter(
          (calc: any) => calc.clientId === clientId
        );
        setCalculations(clientCalculations);
        
        // Si un seul calcul, le charger automatiquement
        if (clientCalculations.length === 1) {
          loadCalculationIntoDevis(clientCalculations[0]);
        } else if (clientCalculations.length === 0) {
          // Aucun calcul, réinitialiser les items
          setItems([
            {
              id: generateId(),
              description: "",
              quantity: 1,
              unit: "unité",
              unitPrice: 0,
              total: 0,
            },
          ]);
          setSelectedCalculation(null);
        } else {
          // Plusieurs calculs, ne pas charger automatiquement
          setSelectedCalculation(null);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des calculs", error);
      setCalculations([]);
      setSelectedCalculation(null);
    }
  };

  const loadCalculationIntoDevis = (calculation: any) => {
    try {
      const materials = JSON.parse(calculation.materials || "[]");
      const dimensions = JSON.parse(calculation.dimensions || "{}");
      
      const laborValue = parseFloat(dimensions?.laborCost) || 0;
      const marginPercent = parseFloat(dimensions?.marginPercent) || 0;
      
      // Calculer le total des matériaux bruts (prix d'achat)
      const materialsTotalBrut = materials.reduce(
        (sum: number, mat: any) => {
          const quantity = parseFloat(mat.quantity) || 0;
          const unitPrice = parseFloat(mat.unitPrice) || 0;
          return sum + (quantity * unitPrice);
        },
        0
      );
      
      // Calculer la marge totale à répartir sur les matériaux
      const baseTotal = materialsTotalBrut + laborValue;
      const totalMargin = Math.round((baseTotal * marginPercent / 100) * 100) / 100;
      
      // Répartir la marge proportionnellement sur chaque matériau
      const marginRatio = materialsTotalBrut > 0 ? totalMargin / materialsTotalBrut : 0;
      
      // Créer les lignes de matériaux avec marge intégrée dans le prix unitaire
      const materialItems: DevisItem[] = materials.map((mat: any) => {
        const quantity = parseFloat(mat.quantity) || 0;
        const unitPriceBrut = parseFloat(mat.unitPrice) || 0;
        
        // Appliquer la marge sur le prix unitaire (prix de vente = prix d'achat × (1 + ratio de marge))
        const unitPriceWithMargin = Math.round(unitPriceBrut * (1 + marginRatio) * 100) / 100;
        const total = Math.round(quantity * unitPriceWithMargin * 100) / 100;
        
        return {
          id: generateId(),
          description: mat.name || mat.description || "",
          quantity: quantity,
          unit: mat.unit || "unité",
          unitPrice: unitPriceWithMargin,
          total: total,
        };
      });
      
      // Ajouter la ligne main-d'œuvre si elle existe (présentée de manière professionnelle)
      const allItems: DevisItem[] = [...materialItems];
      if (laborValue > 0) {
        allItems.push({
          id: generateId(),
          description: "Pose et installation",
          quantity: 1,
          unit: "forfait",
          unitPrice: laborValue,
          total: laborValue,
        });
      }
      
      if (allItems.length > 0) {
        setItems(allItems);
        setSelectedCalculation(calculation);
      } else {
        // Si pas de matériaux, réinitialiser avec une ligne vide
        setItems([
          {
            id: generateId(),
            description: "",
            quantity: 1,
            unit: "unité",
            unitPrice: 0,
            total: 0,
          },
        ]);
        setSelectedCalculation(null);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du calcul", error);
      setSelectedCalculation(null);
    }
  };

  const handleProjectChange = async (projectId: string) => {
    if (!projectId) {
      setSelectedProject(null);
      setCalculations([]);
      setSelectedCalculation(null);
      setItems([
        {
          id: generateId(),
          description: "",
          quantity: 1,
          unit: "unité",
          unitPrice: 0,
          total: 0,
        },
      ]);
      setFormData((prev) => ({
        ...prev,
        projectId: "",
        clientId: "",
      }));
      return;
    }

    const project = projects.find((p) => p.id === projectId);
    if (!project) {
      return;
    }

    setSelectedProject(project);

    // Toujours préremplir avec les données du projet sélectionné
    setFormData((prev) => ({
      ...prev,
      projectId: projectId,
      clientId: project.client?.id || "",
      title: project.name || "",
      description: project.description || "",
    }));

    // Si le projet a un client, charger les calculs associés
    if (project.client?.id) {
      await fetchCalculationsForClient(project.client.id);
    } else {
      setCalculations([]);
      setSelectedCalculation(null);
      // Réinitialiser les items si pas de client
      setItems([
        {
          id: generateId(),
          description: "",
          quantity: 1,
          unit: "unité",
          unitPrice: 0,
          total: 0,
        },
      ]);
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
          // Calculer le total avec arrondi cohérent
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
        unit: "unité",
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const calculateTotals = () => {
    // Calculer le total HT avec arrondi cohérent
    const totalHT = Math.round(
      items.reduce((sum, item) => sum + item.total, 0) * 100
    ) / 100;
    
    // Calculer la TVA avec arrondi cohérent
    const tva = formData.isVatApplicable
      ? Math.round(totalHT * (formData.tvaRate / 100) * 100) / 100
      : 0;
    
    // Calculer le total TTC avec arrondi cohérent
    const totalTTC = Math.round((totalHT + tva) * 100) / 100;
    
    return { totalHT, tva, totalTTC };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.projectId) {
      alert("Veuillez sélectionner un projet");
      return;
    }

    setLoading(true);

    const { totalHT, totalTTC } = calculateTotals();

    try {
      const response = await fetch("/api/devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: items.map(({ id, ...item }) => item), // Retirer l'ID avant l'envoi
          totalHT,
          totalTTC,
          projectId: formData.projectId || null,
          clientId: formData.clientId || null, // Récupéré automatiquement depuis le projet
          validUntil: formData.validUntil
            ? new Date(formData.validUntil).toISOString()
            : null,
          advancePayment: formData.advancePayment
            ? parseFloat(formData.advancePayment)
            : null,
          paymentTerms: formData.paymentTerms || null,
          isVatApplicable: formData.isVatApplicable !== false,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du devis");
      }

      router.push("/devis");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la création du devis");
    } finally {
      setLoading(false);
    }
  };

  const { totalHT, tva, totalTTC } = calculateTotals();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="text-4xl font-bold mb-8 lg:mb-12 text-foreground">
          Nouveau devis
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="hover:shadow-xl transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="text-xl">
                    Informations générales
                  </CardTitle>
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
                    {projectsLoading && (
                      <p className="text-sm text-muted-foreground">
                        Chargement des projets...
                      </p>
                    )}
                    {selectedProject && (
                      <div className="mt-2 p-3 bg-muted/50 rounded-xl border">
                        {selectedProject.client ? (
                          <>
                            <p className="text-sm font-medium text-foreground mb-1">
                              Client associé :
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatClientName(selectedProject.client)}
                              {selectedProject.client.email &&
                                ` • ${selectedProject.client.email}`}
                              {selectedProject.client.phone &&
                                ` • ${selectedProject.client.phone}`}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            ⚠️ Ce projet n'a pas de client associé. Le devis
                            sera créé sans client.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                      <p className="text-xs text-muted-foreground">
                        Obligatoire pour un devis légal
                      </p>
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
                  <div className="grid grid-cols-2 gap-4">
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
                      <p className="text-xs text-muted-foreground">
                        Montant de l'acompte éventuel
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentTerms">Délai de paiement *</Label>
                      <Input
                        id="paymentTerms"
                        value={formData.paymentTerms}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentTerms: e.target.value,
                          })
                        }
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Obligatoire pour un devis légal
                      </p>
                    </div>
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
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="space-y-2">
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
                            <Input
                              value={item.unit}
                              onChange={(e) =>
                                updateItem(item.id, "unit", e.target.value)
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
                  {loading ? "Création..." : "Créer le devis"}
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
