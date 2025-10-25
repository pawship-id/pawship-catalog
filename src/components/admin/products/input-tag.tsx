import { useState } from "react";
import { X, Plus } from "lucide-react";

interface TagInputProps {
  onChange: (tag: string[]) => void;
  tags: string[];
}

export default function TagInput({ onChange, tags }: TagInputProps) {
  const [inputTagValue, setInputTagValue] = useState("");
  const [isSelectTagOpen, setIsSelectTagOpen] = useState(false);
  const tagsData = ["Bip", "Harness"];

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputTagValue("");
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const filteredTags = tagsData.filter(
    (option) =>
      !tags.map((t) => t.toLowerCase()).includes(option.toLowerCase()) &&
      option.toLowerCase().includes(inputTagValue.toLowerCase())
  );

  return (
    <div className="space-y-1 relative">
      {/* Input container */}
      <div
        className="flex flex-wrap items-center gap-1 border border-gray-300 rounded-md px-2 py-2 min-h-[42px] "
        onClick={() => setIsSelectTagOpen(true)}
      >
        {/* Badge tags */}
        {tags.map((tag) => (
          <div
            key={tag}
            className="flex items-center gap-1 bg-[#DC655E]/10 text-[#DC655E] text-sm px-2 py-1 rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
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

          {filteredTags.length > 0 ? (
            <>
              <div className="border-gray-100"></div>
              <div className="p-1">
                {filteredTags.map((option) => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => addTag(option)}
                    className="w-full p-2 text-left text-sm hover:bg-gray-100 rounded"
                  >
                    {option}
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
