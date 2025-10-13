"use client";

import type * as React from "react";
import { useMemo, useRef, useState } from "react";
import { GripVertical, ImagePlus, X, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface VariantType {
  id: string;
  name: string;
  values: string[];
}

export interface VariantRow {
  id: string;
  position: number;
  image?: string;
  sku: string;
  attrs: Record<string, string>;
  name: string;
  barcode?: string;
  stock?: string;
  price?: {
    usd?: number;
    idr?: number;
    sgd?: number;
    hkd?: number;
  };
  selected?: boolean;
}

type VariantEditorProps = {
  value: VariantRow[];
  onChange: (rows: VariantRow[]) => void;
  variantTypes: VariantType[];
  onTypesChange: (types: VariantType[]) => void;
  className?: string;
};

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

function buildNameFromAttrs(attrs: Record<string, string>, order: string[]) {
  return order
    .map((k) => attrs[k])
    .filter(Boolean)
    .join("-");
}

export function VariantEditor({
  value,
  onChange,
  variantTypes,
  onTypesChange,
  className,
}: VariantEditorProps) {
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const typeNames = useMemo(
    () => variantTypes.map((t) => t.name),
    [variantTypes]
  );

  const defaultOptions = ["Warna", "Ukuran"];
  const existingTypeNames = new Set(
    variantTypes.map((t) => t.name.toLowerCase())
  );

  const availableOptions = defaultOptions.filter(
    (option) => !existingTypeNames.has(option.toLowerCase())
  );

  function updateRow(id: string, patch: Partial<VariantRow>) {
    onChange(value.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function removeType(name: string) {
    const nextTypes = variantTypes.filter((t) => t.name !== name);
    onTypesChange(nextTypes);
    const order = nextTypes.map((t) => t.name);
    onChange(
      value.map((r) => {
        const { [name]: _, ...rest } = r.attrs;
        return { ...r, attrs: rest, name: buildNameFromAttrs(rest, order) };
      })
    );
  }

  function addType(typeName: string) {
    const trimmedName = typeName.trim();
    if (!trimmedName) return;

    // Check if type already exists (case insensitive)
    const existing = variantTypes.find(
      (t) => t.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (existing) return;

    const next: VariantType = {
      id: makeId(),
      name: trimmedName,
      values: [],
    };
    onTypesChange([...variantTypes, next]);
    setInputValue("");
    setIsSelectOpen(false);
  }

  function handleSelectOption(option: string) {
    addType(option);
  }

  function handleInputSubmit() {
    if (inputValue.trim()) {
      addType(inputValue);
    }
  }

  function updateTypeName(id: string, name: string) {
    const prev = variantTypes.find((t) => t.id === id);
    if (!prev) return;
    const next = variantTypes.map((t) => (t.id === id ? { ...t, name } : t));
    onTypesChange(next);
    if (prev.name !== name) {
      const order = next.map((t) => t.name);
      onChange(
        value.map((r) => {
          if (!(prev.name in r.attrs)) return r;
          const { [prev.name]: v, ...rest } = r.attrs;
          const attrs = { ...rest, [name]: v };
          return { ...r, attrs, name: buildNameFromAttrs(attrs, order) };
        })
      );
    }
  }

  function addEmptyRow() {
    const order = variantTypes.map((t) => t.name);
    const attrs: Record<string, string> = {};
    const id = makeId();
    onChange([
      ...value,
      {
        id,
        position: value.length + 1,
        attrs,
        sku: "",
        name: buildNameFromAttrs(attrs, order),
        barcode: "",
        image: undefined,
      },
    ]);
  }

  function removeSelected() {
    onChange(value.filter((v) => !v.selected));
  }

  function handleFilePick(id: string) {
    const el = fileInputs.current[id];
    if (!el) return;
    el.click();
  }

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateRow(id, { image: String(reader.result) });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {variantTypes.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1"
            >
              <Input
                value={t.name}
                onChange={(e) => updateTypeName(t.id, e.target.value)}
                className="h-7 w-[96px] border-none px-0 text-sm focus-visible:ring-0"
                aria-label="Nama tipe variasi"
              />
              <button
                aria-label={`Hapus tipe ${t.name}`}
                onClick={() => removeType(t.name)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          {/* Custom Select Component */}
          <div className="relative">
            <Button
              type="button"
              size="sm"
              onClick={() => setIsSelectOpen(!isSelectOpen)}
              className="h-8 cursor-pointer"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Variation Type
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>

            {isSelectOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="p-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleInputSubmit();
                      }
                    }}
                    placeholder="Ketik tipe variasi..."
                    className="h-8 text-sm"
                    autoFocus
                  />
                  {inputValue.trim() && (
                    <button
                      onClick={handleInputSubmit}
                      className="w-full mt-1 p-2 text-left text-sm hover:bg-gray-100 rounded flex items-center"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah "{inputValue}"
                    </button>
                  )}
                </div>

                {availableOptions.length > 0 && (
                  <>
                    <div className="border-t border-gray-100"></div>
                    <div className="p-1">
                      {availableOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleSelectOption(option)}
                          className="w-full p-2 text-left text-sm hover:bg-gray-100 rounded"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside handler */}
      {isSelectOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsSelectOpen(false)}
        />
      )}

      <div className="overflow-hidden overflow-x-auto bg-white py-4 space-y-4">
        <div className="flex items-center gap-2 py-2">
          <Button
            type="button"
            className="cursor-pointer"
            size="sm"
            onClick={addEmptyRow}
          >
            Add New Row
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={removeSelected}
          >
            Delete Selected Rows
          </Button>
        </div>

        <div className="w-full mb-2">
          <div className="min-w-max">
            <table className="w-full text-sm border">
              <thead>
                <tr className="h-12 border-b">
                  <th className="w-10 px-4 text-left">
                    <input
                      type="checkbox"
                      aria-label="Pilih semua"
                      onChange={(e) => {
                        const checked = e.target.checked;
                        onChange(
                          value.map((v) => ({ ...v, selected: checked }))
                        );
                      }}
                    />
                  </th>
                  <th className="w-8 px-2"></th>
                  <th className="w-24 px-2 text-left">Gambar</th>
                  <th className="w-64 px-2 text-left">Kode SKU</th>
                  {typeNames.map((n) => (
                    <th key={`head-${n}`} className="w-48 px-2 text-left">
                      {n}
                    </th>
                  ))}
                  <th className="w-56 px-2 text-left">Nama Variasi</th>
                  <th className="w-56 px-2 text-left">Barcode</th>
                  <th className="w-40 px-2 text-left">Stock</th>
                  {value.length > 0 && (
                    <>
                      <th className="w-40 px-2 text-left">Harga (USD)</th>
                      <th className="w-40 px-2 text-left">Harga (IDR)</th>
                      <th className="w-40 px-2 text-left">Harga (SGD)</th>
                      <th className="w-40 px-2 text-left">Harga (HKD)</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {value.map((row) => (
                  <tr key={row.id} className="h-14 border-b align-middle">
                    <td className="px-4">
                      <input
                        type="checkbox"
                        checked={!!row.selected}
                        onChange={(e) =>
                          updateRow(row.id, { selected: e.target.checked })
                        }
                        aria-label="Pilih baris"
                      />
                    </td>
                    <td className="px-2 text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                    </td>
                    <td className="px-2">
                      <div className="flex items-center gap-2">
                        {row.image ? (
                          <img
                            src={
                              row.image ||
                              "/placeholder.svg?height=32&width=32&query=variant-image"
                            }
                            alt="Gambar variasi"
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleFilePick(row.id)}
                            className="flex h-8 w-8 items-center justify-center rounded border"
                            aria-label="Tambah gambar"
                          >
                            <ImagePlus className="h-4 w-4" />
                          </button>
                        )}
                        <input
                          ref={(el) => {
                            fileInputs.current[row.id] = el;
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, row.id)}
                        />
                      </div>
                    </td>
                    <td className="px-2">
                      <Input
                        value={row.sku}
                        onChange={(e) =>
                          updateRow(row.id, { sku: e.target.value })
                        }
                        className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                        placeholder="MonaPeach:L"
                      />
                    </td>
                    {typeNames.map((tName) => (
                      <td key={`${row.id}-${tName}`} className="px-2">
                        <Input
                          value={row.attrs?.[tName] || ""}
                          onChange={(e) => {
                            const attrs = {
                              ...(row.attrs || {}),
                              [tName]: e.target.value,
                            };
                            const name = buildNameFromAttrs(attrs, typeNames);
                            updateRow(row.id, { attrs, name });
                          }}
                          placeholder={tName}
                        />
                      </td>
                    ))}
                    <td className="px-2">
                      <Input
                        value={row.name}
                        onChange={(e) =>
                          updateRow(row.id, { name: e.target.value })
                        }
                        placeholder="Peach-L"
                      />
                    </td>
                    <td className="px-2">
                      <Input
                        value={row.barcode || ""}
                        onChange={(e) =>
                          updateRow(row.id, { barcode: e.target.value })
                        }
                        placeholder="MOPH:L"
                      />
                    </td>
                    <td className="px-2">
                      <Input
                        type="number"
                        value={row.stock}
                        onChange={(e) =>
                          updateRow(row.id, { stock: e.target.value })
                        }
                        placeholder="0"
                      />
                    </td>
                    {value.length > 0 && (
                      <>
                        <td className="px-2">
                          <Input
                            type="number"
                            inputMode="decimal"
                            value={row.price?.usd ?? ""}
                            onChange={(e) =>
                              updateRow(row.id, {
                                price: {
                                  ...row.price,
                                  usd: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                },
                              })
                            }
                            placeholder="0"
                            className="h-8 text-xs"
                          />
                        </td>
                        <td className="px-2">
                          <Input
                            type="number"
                            inputMode="decimal"
                            value={row.price?.idr ?? ""}
                            onChange={(e) =>
                              updateRow(row.id, {
                                price: {
                                  ...row.price,
                                  idr: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                },
                              })
                            }
                            placeholder="0"
                            className="h-8 text-xs"
                          />
                        </td>
                        <td className="px-2">
                          <Input
                            type="number"
                            inputMode="decimal"
                            value={row.price?.sgd ?? ""}
                            onChange={(e) =>
                              updateRow(row.id, {
                                price: {
                                  ...row.price,
                                  sgd: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                },
                              })
                            }
                            placeholder="0"
                            className="h-8 text-xs"
                          />
                        </td>
                        <td className="px-2">
                          <Input
                            type="number"
                            inputMode="decimal"
                            value={row.price?.hkd ?? ""}
                            onChange={(e) =>
                              updateRow(row.id, {
                                price: {
                                  ...row.price,
                                  hkd: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                },
                              })
                            }
                            placeholder="0"
                            className="h-8 text-xs"
                          />
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {value.length === 0 && (
                  <tr>
                    <td
                      colSpan={10 + typeNames.length}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      There are no variations yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
