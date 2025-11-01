"use client";
import { useEffect, useState } from "react";
import { X, Plus } from "lucide-react";
import { TagData, TagForm } from "@/lib/types/tag";
import { getAll } from "@/lib/apiService";

interface TagInputProps {
  onChange: (tags: TagForm[]) => void;
  tags: TagForm[];
}

export default function TagInput({ onChange, tags }: TagInputProps) {
  const [inputTagValue, setInputTagValue] = useState("");
  const [isSelectTagOpen, setIsSelectTagOpen] = useState(false);

  const [tagData, setTagData] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addTag = (tagName: string) => {
    const trimmed = tagName.trim();
    if (!trimmed) return;

    // check if the tag is already in the available in database.
    const isExistingTag = tagData.some(
      (t) => t.tagName.toLowerCase() === trimmed.toLowerCase()
    );

    // check if it has been added before
    const isDuplicate = tags.some(
      (t) => t.tagName.toLowerCase() === trimmed.toLowerCase()
    );

    if (!isDuplicate) {
      const newTag: TagForm = {
        tagName: trimmed.toLowerCase(),
        isNew: !isExistingTag,
      };

      onChange([...tags, newTag]);
    }

    setInputTagValue("");
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t.tagName !== tag));
  };

  const filteredTags = tagData.filter(
    (option) =>
      !tags
        .map((t) => t.tagName.toLowerCase())
        .includes(option.tagName.toLowerCase()) &&
      option.tagName.toLowerCase().includes(inputTagValue.toLowerCase())
  );

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAll<TagData>("/api/admin/tags");

      if (response.data) {
        setTagData(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="space-y-1 relative">
      {/* Input container */}
      <div
        className="flex flex-wrap items-center gap-1 border border-gray-300 rounded-md px-2 py-2 min-h-[42px] "
        onClick={() => setIsSelectTagOpen(true)}
      >
        {/* Badge tags */}
        {tags.map((tag, index) => (
          <div
            key={index}
            className="flex items-center gap-1 bg-[#DC655E]/10 text-[#DC655E] text-sm px-2 py-1 rounded-full"
          >
            {tag.tagName}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag.tagName);
              }}
              className="hover:text-red-500 cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Input untuk tambah tag */}
        <input
          id="tags"
          className="flex-1 outline-none bg-transparent py-1 text-sm min-w-[100px]"
          placeholder="Enter tags..."
          value={inputTagValue}
          onClick={() => setIsSelectTagOpen(true)}
          onChange={(e) => setInputTagValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (inputTagValue.trim()) {
                addTag(inputTagValue);
              }
            }
          }}
        />
      </div>

      {/* Dropdown suggestion */}
      {isSelectTagOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
          {inputTagValue.trim() && (
            <div className="relative p-1 border-b">
              <button
                type="button"
                onClick={() => addTag(inputTagValue)}
                className="w-full my-1 p-2 text-left text-sm hover:bg-gray-100 rounded flex items-center"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah "{inputTagValue}"
              </button>
            </div>
          )}

          {loading ? (
            <p className="text-foreground p-3">Loading...</p>
          ) : error ? (
            <p className="text-foreground p-3">Error: {error}</p>
          ) : filteredTags.length > 0 ? (
            <>
              <div className="border-gray-100"></div>
              <div className="p-1">
                {filteredTags.map((option, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() => addTag(option.tagName)}
                    className="w-full p-2 text-left text-sm hover:bg-gray-100 rounded"
                  >
                    {option.tagName}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="text-foreground p-3">No tag product found</p>
          )}
        </div>
      )}

      {isSelectTagOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsSelectTagOpen(false)}
        />
      )}
    </div>
  );
}
