"use client";

import type * as React from "react";
import { useMemo, useRef, useState } from "react";
import { GripVertical, ImagePlus, X, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { showConfirmAlert, showErrorAlert } from "@/lib/helpers/sweetalert2";
import { VariantRowForm, VariantType } from "@/lib/types/product";

type VariantEditorProps = {
  value: VariantRowForm[];
  onChange: (rows: VariantRowForm[]) => void;
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

  const defaultOptions = ["Color", "Size"];
  const existingTypeNames = new Set(
    variantTypes.map((t) => t.name.toLowerCase())
  );

  const [defaultStockPrice, setDefaultStockPrice] = useState({
    stockDefault: 0,
    priceDefault: "",
  });

  const currencyList = [
    {
      currency: "IDR",
      rate: 1,
    },
    {
      currency: "USD",
      rate: 16000,
    },
    {
      currency: "SGD",
      rate: 11000,
    },
    {
      currency: "HKD",
      rate: 2000,
    },
  ];

  const handleApply = () => {
    const hasSelectedRows = value.some((row) => row.selected);

    if (!defaultStockPrice.stockDefault) {
      showErrorAlert(undefined, "Please input a stock");
      return;
    }

    if (!defaultStockPrice.priceDefault) {
      showErrorAlert(undefined, "Please input a price IDR");
      return;
    }

    if (!hasSelectedRows) {
      showErrorAlert(undefined, "Please select row");
      return; // exit early if no rows are selected
    }

    const updatedRows = value.map((item) => {
      // only update selected rows
      if (!item.selected) {
        return item;
      }

      // change price
      let tempPrice: Record<string, number> = {};

      currencyList.forEach((el) => {
        if (el.currency === "IDR") {
          tempPrice[el.currency] =
            Number(defaultStockPrice.priceDefault) || item.price?.IDR;
        } else {
          let price =
            Number(defaultStockPrice.priceDefault) / el.rate ||
            item.price[el.currency];

          tempPrice[el.currency] = Number(price.toFixed(1));
        }
      });

      return {
        ...item,
        stock: defaultStockPrice.stockDefault || item.stock,
        price: tempPrice,
        selected: false,
      };
    });

    onChange(updatedRows);

    setDefaultStockPrice({
      stockDefault: 0,
      priceDefault: "",
    });
  };

  const availableOptions = defaultOptions.filter(
    (option) => !existingTypeNames.has(option.toLowerCase())
  );

  function updateRow(id: string, patch: Partial<VariantRowForm>) {
    onChange(value.map((r) => (r.codeRow === id ? { ...r, ...patch } : r)));
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
        codeRow: id,
        position: value.length + 1,
        attrs,
        sku: "",
        name: buildNameFromAttrs(attrs, order),
        image: undefined,
      },
    ]);
  }

  async function removeSelected() {
    const itemsToDelete = value.filter((v) => v.selected);

    const deletionPromises = itemsToDelete.map(async (item) => {
      // only delete if the item has a public id
      if (item.image?.imagePublicId) {
        try {
          // call the API to delete files from Cloudinary
          const response = await fetch("/api/delete-file", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ publicId: item.image.imagePublicId }),
          });

          if (!response.ok) {
            // if the API responds with an error, log it and proceed to the next item.
            // don't throw an error here so that other items can still be processed.
            const errorBody = await response.json();
            console.error(
              `Failed to delete Cloudinary image for ID ${item.codeRow}:`,
              errorBody.message || "Unknown error"
            );
            return { success: false, codeRow: item.codeRow };
          }

          console.log(
            `Cloudinary image successfully deleted for ID: ${item.codeRow}`
          );
          return { success: true, codeRow: item.codeRow };
        } catch (error) {
          // handle network errors or other errors
          console.error(
            `Network error while deleting image for ID ${item.codeRow}:`,
            error
          );
          return { success: false, codeRow: item.codeRow };
        }
      }

      // if there is no publicId, assume it is successful (nothing to delete)
      return { success: true, codeRow: item.codeRow };
    });

    // wait for all Promise deletion to complete
    await Promise.all(deletionPromises);

    // update state: Delete rows that have 'selected: true'
    const remainingItems = value.filter((v) => !v.selected);
    onChange(remainingItems);
  }

  function handleFilePick(id: string) {
    const el = fileInputs.current[id];
    if (!el) return;
    el.click();
  }

  async function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    // find row
    let findRow = value.find((el) => el.codeRow === id);

    // confirm update image, when image already exists
    let isConfirmed = false; // default set false (do not change image)

    if (findRow?.image) {
      let result = await showConfirmAlert(
        "This variant image already exists. Are you sure you want to replace it with a new image?",
        "I'm sure"
      );

      if (!result.isConfirmed) {
        return;
      }

      isConfirmed = true;
    }

    try {
      // append formData input image & folder
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folder", "products");

      // call API upload-file
      let response = await fetch("/api/upload-file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.message || "Internal server error");
      }

      const { data } = await response.json();

      // if the image already exists and confim update image, delete the previous image.
      if (findRow?.image && isConfirmed) {
        let responseDeletedFile = await fetch("/api/delete-file", {
          method: "DELETE",
          body: JSON.stringify({ publicId: findRow.image.imagePublicId }),
        });

        if (!responseDeletedFile.ok) {
          const errorBody = await response.json();
          throw new Error(errorBody.message || "Internal server error");
        }
      }

      updateRow(id, {
        image: {
          imageUrl: data.secureUrl,
          imagePublicId: data.publicId,
        },
      });
    } catch (error) {
      console.log(
        error,
        "function handleFileChange /components/admin/products/variant-editor.tsx"
      );
    }
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
                    placeholder="Enter variation type..."
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

        <div className="flex items-center gap-2">
          <div className="space-y-2">
            <Input
              placeholder="Enter stock"
              className="border-gray-300 w-30"
              value={defaultStockPrice.stockDefault}
              onChange={(e) =>
                setDefaultStockPrice({
                  ...defaultStockPrice,
                  stockDefault: Number(e.target.value),
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Input
              placeholder="Enter IDR price"
              className="border-gray-300 w-40"
              value={defaultStockPrice.priceDefault}
              onChange={(e) =>
                setDefaultStockPrice({
                  ...defaultStockPrice,
                  priceDefault: e.target.value,
                })
              }
            />
          </div>
          <Button
            type="button"
            className="cursor-pointer"
            disabled={value.length === 0}
            size="sm"
            onClick={handleApply}
          >
            Apply
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
                      aria-label="select all"
                      onChange={(e) => {
                        const checked = e.target.checked;
                        onChange(
                          value.map((v) => ({ ...v, selected: checked }))
                        );
                      }}
                    />
                  </th>
                  <th className="w-8 px-2"></th>
                  <th className="w-24 px-2 text-left">Image</th>
                  <th className="w-64 px-2 text-left">SKU Code</th>
                  {typeNames.map((n) => (
                    <th key={`head-${n}`} className="w-48 px-2 text-left">
                      {n}
                    </th>
                  ))}
                  <th className="w-56 px-2 text-left">Variation Name</th>
                  <th className="w-40 px-2 text-left">Stock</th>
                  {value.length && currencyList.length
                    ? currencyList.map((el, idx) => (
                        <th key={idx} className="w-40 px-2 text-left">
                          Price ({el.currency})
                        </th>
                      ))
                    : ""}
                </tr>
              </thead>
              <tbody>
                {value.map((row) => (
                  <tr key={row.codeRow} className="h-14 border-b align-middle">
                    <td className="px-4">
                      <input
                        type="checkbox"
                        checked={!!row.selected}
                        onChange={(e) =>
                          updateRow(row.codeRow, { selected: e.target.checked })
                        }
                        aria-label="Pilih baris"
                      />
                    </td>
                    <td className="px-2 text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                    </td>
                    <td className="px-2">
                      <div className="flex items-center gap-2">
                        {row.image?.imageUrl ? (
                          <img
                            src={
                              row.image.imageUrl ||
                              "/placeholder.svg?height=32&width=32&query=variant-image"
                            }
                            alt="Gambar variasi"
                            className="h-8 w-8 rounded object-cover"
                            onClick={() => handleFilePick(row.codeRow)}
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleFilePick(row.codeRow)}
                            className="flex h-8 w-8 items-center justify-center rounded border cursor-pointer"
                            aria-label="Tambah gambar"
                          >
                            <ImagePlus className="h-4 w-4" />
                          </button>
                        )}
                        <input
                          ref={(el) => {
                            fileInputs.current[row.codeRow] = el;
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, row.codeRow)}
                        />
                      </div>
                    </td>
                    <td className="px-2">
                      <Input
                        value={row.sku}
                        onChange={(e) =>
                          updateRow(row.codeRow, { sku: e.target.value })
                        }
                        className="border-gray-300"
                        placeholder="MonaPeach:L"
                      />
                    </td>
                    {typeNames.map((tName) => (
                      <td key={`${row.codeRow}-${tName}`} className="px-2">
                        <Input
                          className="border-gray-300"
                          value={row.attrs?.[tName] || ""}
                          onChange={(e) => {
                            const attrs = {
                              ...(row.attrs || {}),
                              [tName]: e.target.value,
                            };
                            const name = buildNameFromAttrs(attrs, typeNames);
                            updateRow(row.codeRow, { attrs, name });
                          }}
                          placeholder={tName}
                        />
                      </td>
                    ))}
                    <td className="px-2">
                      <Input
                        className="border-gray-300"
                        value={row.name}
                        onChange={(e) =>
                          updateRow(row.codeRow, { name: e.target.value })
                        }
                        placeholder="Peach-L"
                      />
                    </td>
                    <td className="px-2">
                      <Input
                        className="border-gray-300"
                        type="number"
                        value={row.stock || 0}
                        onChange={(e) =>
                          updateRow(row.codeRow, {
                            stock: Number(e.target.value),
                          })
                        }
                        placeholder="0"
                      />
                    </td>
                    {value.length > 0 &&
                      currencyList.length &&
                      currencyList.map((item, idx) => (
                        <td key={idx} className="px-2">
                          <Input
                            type="number"
                            inputMode="decimal"
                            value={row.price?.[item.currency] ?? ""}
                            onChange={(e) =>
                              updateRow(row.codeRow, {
                                price: {
                                  ...row.price,
                                  [item.currency]: e.target.value
                                    ? Number(e.target.value)
                                    : "",
                                },
                              })
                            }
                            placeholder="0"
                            className="h-8 text-xs border-gray-300"
                          />
                        </td>
                      ))}
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
