import { useState, useRef } from "react";
import { useRouter } from "@tanstack/react-router";
import {
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { importTransactions } from "@/server/transactions.functions";

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
}

interface ParsedRow {
  line: number;
  type: "income" | "expense" | null;
  amount: string;
  description: string;
  categoryName: string;
  categoryId: string | undefined;
  date: string;
  errors: string[];
  valid: boolean;
}

interface Props {
  categories: Category[];
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}

function parseCSV(text: string, categories: Category[]): ParsedRow[] {
  const lines = text.trim().split(/\r?\n/);
  const rows: ParsedRow[] = [];

  const startIndex = lines[0]?.toLowerCase().includes("tipo") ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(";");
    const [rawTipo, rawMonto, rawDesc, rawCat, rawFecha] = cols;

    const errors: string[] = [];

    // Type
    let type: "income" | "expense" | null = null;
    const tipoNorm = (rawTipo ?? "").trim().toLowerCase();
    if (tipoNorm === "ingreso") type = "income";
    else if (tipoNorm === "gasto") type = "expense";
    else errors.push("Tipo inválido (usa 'Ingreso' o 'Gasto')");

    // Amount
    const amountRaw = (rawMonto ?? "").trim().replace(/[^\d]/g, "");
    if (!amountRaw || Number(amountRaw) <= 0) errors.push("Monto inválido");

    // Date — accepts DD/MM/YYYY or YYYY-MM-DD, normalizes to YYYY-MM-DD
    let date = (rawFecha ?? "").trim();
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      const [dd, mm, yyyy] = date.split("/");
      date = `${yyyy}-${mm}-${dd}`;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
      errors.push("Fecha inválida (usa DD/MM/YYYY)");

    // Category (optional, match by name)
    const categoryName = (rawCat ?? "").trim();
    let categoryId: string | undefined;
    if (categoryName) {
      const match = categories.find(
        (c) =>
          c.name.toLowerCase() === categoryName.toLowerCase() &&
          (type === null || c.type === type),
      );
      categoryId = match?.id;
    }

    rows.push({
      line: i + 1,
      type,
      amount: amountRaw,
      description: (rawDesc ?? "").trim(),
      categoryName,
      categoryId,
      date,
      errors,
      valid: errors.length === 0,
    });
  }

  return rows;
}

const formatAmt = (n: string) =>
  n ? new Intl.NumberFormat("es-CO").format(Number(n)) : "";

export function ImportTransactionsModal({ categories, open: openProp, onOpenChange: onOpenChangeProp }: Props) {
  const [openInternal, setOpenInternal] = useState(false);
  const open = openProp ?? openInternal;
  const setOpen = onOpenChangeProp ?? setOpenInternal;
  const [step, setStep] = useState<"upload" | "preview">("upload");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text, categories);
      setRows(parsed);
      setStep("preview");
    };
    reader.readAsText(file, "utf-8");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) handleFile(file);
  };

  const validRows = rows.filter((r) => r.valid);

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setLoading(true);
    try {
      await importTransactions({
        data: {
          rows: validRows.map((r) => ({
            type: r.type!,
            amount: r.amount,
            description: r.description || undefined,
            categoryId: r.categoryId,
            date: r.date,
          })),
        },
      });
      setOpen(false);
      router.invalidate();
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      setStep("upload");
      setRows([]);
    }
    setOpen(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90dvh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>Importar movimientos</DialogTitle>
          <DialogDescription>
            {step === "upload"
              ? "Sube un archivo CSV con tus movimientos. Usa el mismo formato del exportador."
              : `${rows.length} filas encontradas · ${validRows.length} válidas · ${rows.length - validRows.length} con errores`}
          </DialogDescription>
        </DialogHeader>

        {step === "upload" ? (
          <div className="space-y-4 overflow-y-auto">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 sm:p-10 cursor-pointer transition-colors ${
                dragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-accent/30"
              }`}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                <FileText size={22} className="text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">Arrastra tu CSV aquí</p>
                <p className="text-xs text-muted-foreground mt-1">
                  o haz clic para seleccionar
                </p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>

            <div className="rounded-lg bg-muted/50 px-4 py-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">
                Formato esperado (separador:{" "}
                <code className="font-mono">;</code>)
              </p>
              <p className="font-mono">
                Tipo;Monto;Descripción;Categoría;Fecha
              </p>
              <p className="font-mono">
                Gasto;50000;Netflix;Entretenimiento;15/03/2026
              </p>
              <p className="font-mono">
                Ingreso;5000000;Salario;Trabajo;01/03/2026
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 flex-1 min-h-0">
            <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground w-6">
                      #
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground" />
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      Tipo
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      Monto
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      Descripción
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      Categoría
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.line}
                      className={`border-t border-border/50 ${row.valid ? "" : "bg-red-500/5"}`}
                    >
                      <td className="px-3 py-2 text-muted-foreground">
                        {row.line}
                      </td>
                      <td className="px-3 py-2">
                        {row.valid ? (
                          <CheckCircle2 size={14} className="text-green-500" />
                        ) : (
                          <span title={row.errors.join(" · ")}>
                            <XCircle size={14} className="text-red-500" />
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {row.type === "income"
                          ? "Ingreso"
                          : row.type === "expense"
                            ? "Gasto"
                            : <span className="text-red-400">—</span>}
                      </td>
                      <td className="px-3 py-2 font-mono">
                        {row.amount ? (
                          formatAmt(row.amount)
                        ) : (
                          <span className="text-red-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 max-w-32 truncate">
                        {row.description || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {row.categoryName ? (
                          <span className="flex items-center gap-1">
                            {row.categoryName}
                            {!row.categoryId && (
                              <AlertCircle
                                size={11}
                                className="text-amber-500 shrink-0"
                                title="Categoría no encontrada, se importará sin categoría"
                              />
                            )}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono">
                        {row.date || (
                          <span className="text-red-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rows.some((r) => !r.valid) && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <XCircle size={12} className="text-red-500 shrink-0" />
                Las filas con errores serán omitidas. Pasa el cursor sobre el
                ícono para ver el detalle.
              </p>
            )}
            {rows.some((r) => r.valid && r.categoryName && !r.categoryId) && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <AlertCircle size={12} className="text-amber-500 shrink-0" />
                Las categorías marcadas con ⚠ no se encontraron y se importarán
                sin categoría.
              </p>
            )}

            <div className="flex justify-between gap-2 shrink-0">
              <button
                onClick={() => {
                  setStep("upload");
                  setRows([]);
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                Cambiar archivo
              </button>
              <Button
                onClick={handleImport}
                disabled={validRows.length === 0 || loading}
              >
                {loading
                  ? "Importando..."
                  : `Importar ${validRows.length} movimiento${validRows.length !== 1 ? "s" : ""}`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
