"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Unlink,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Quote,
  Undo,
  Redo,
  Underline as UnderlineIcon,
  Strikethrough,
  Check,
  X,
  Unlink2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter description...",
}: RichTextEditorProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkButtonRef, setLinkButtonRef] = useState<HTMLButtonElement | null>(
    null
  );
  const [isLinkActive, setIsLinkActive] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline",
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg max-w-none min-h-[200px] p-4 focus:outline-none border-0",
      },
    },
    onSelectionUpdate: ({ editor }) => {
      setIsLinkActive(editor.isActive("link"));
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrl(previousUrl);
    setShowLinkInput(true);
  };

  const applyLink = () => {
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
  };

  const cancelLink = () => {
    setShowLinkInput(false);
    setLinkUrl("");
  };

  const removeLink = () => {
    if (isLinkActive) {
      editor.chain().focus().unsetLink().run();
      setIsLinkActive(false);
    }
  };

  const ToolbarButton = ({
    onClick,
    isActive,
    disabled,
    icon: Icon,
    label,
    tooltip,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    icon: any;
    label: string;
    tooltip: string;
  }) => (
    <div className="relative group">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setHoveredButton(label)}
        onMouseLeave={() => setHoveredButton(null)}
        className={`p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed ${
          isActive ? "bg-gray-300" : ""
        }`}
      >
        <Icon className="w-4 h-4" />
      </button>
      {hoveredButton === label && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50 pointer-events-none">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1 items-center relative">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          icon={Bold}
          label="bold"
          tooltip="Bold (Ctrl+B)"
        />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          icon={Italic}
          label="italic"
          tooltip="Italic (Ctrl+I)"
        />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          icon={UnderlineIcon}
          label="underline"
          tooltip="Underline (Ctrl+U)"
        />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          icon={Strikethrough}
          label="strikethrough"
          tooltip="Strikethrough (Ctrl+Shift+X)"
        />

        <div className="w-px bg-gray-300 mx-1" />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
          icon={Heading1}
          label="h1"
          tooltip="Heading 1 (Ctrl+Alt+1)"
        />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          icon={Heading2}
          label="h2"
          tooltip="Heading 2 (Ctrl+Alt+2)"
        />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          icon={Heading3}
          label="h3"
          tooltip="Heading 3 (Ctrl+Alt+3)"
        />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          isActive={editor.isActive("heading", { level: 4 })}
          icon={Heading4}
          label="h4"
          tooltip="Heading 4 (Ctrl+Alt+4)"
        />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 5 }).run()
          }
          isActive={editor.isActive("heading", { level: 5 })}
          icon={Heading5}
          label="h5"
          tooltip="Heading 5 (Ctrl+Alt+5)"
        />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 6 }).run()
          }
          isActive={editor.isActive("heading", { level: 6 })}
          icon={Heading6}
          label="h6"
          tooltip="Heading 6 (Ctrl+Alt+6)"
        />

        <div className="w-px bg-gray-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          icon={List}
          label="bulletList"
          tooltip="Bullet List (Ctrl+Shift+8)"
        />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          icon={ListOrdered}
          label="orderedList"
          tooltip="Numbered List (Ctrl+Shift+7)"
        />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          icon={Quote}
          label="blockquote"
          tooltip="Blockquote (Ctrl+Shift+B)"
        />

        <div className="w-px bg-gray-300 mx-1" />

        <div className="relative group">
          <button
            ref={setLinkButtonRef}
            type="button"
            onClick={addLink}
            onMouseEnter={() => setHoveredButton("link")}
            onMouseLeave={() => setHoveredButton(null)}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive("link") ? "bg-gray-300" : ""
            }`}
          >
            <Link2 className="w-4 h-4" />
          </button>
          {hoveredButton === "link" && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50 pointer-events-none">
              Insert Link (Ctrl+K)
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>

        <div className="relative group">
          <button
            type="button"
            onClick={removeLink}
            disabled={!isLinkActive}
            onMouseEnter={() => setHoveredButton("unlink")}
            onMouseLeave={() => setHoveredButton(null)}
            className={`p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              isLinkActive ? "bg-red-100" : ""
            }`}
          >
            <Unlink2 className="w-4 h-4" />
          </button>
          {hoveredButton === "unlink" && !isLinkActive && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50 pointer-events-none">
              Remove Link (Ctrl+Shift+K)
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
          {hoveredButton === "unlink" && isLinkActive && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50 pointer-events-none">
              Remove Link (Ctrl+Shift+K)
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>

        {/* Floating Link Input */}
        {showLinkInput && linkButtonRef && (
          <div
            className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3"
            style={{
              top: linkButtonRef.offsetTop + linkButtonRef.offsetHeight + 8,
              left: linkButtonRef.offsetLeft,
            }}
          >
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="text-sm outline-none border border-gray-300 rounded px-2 py-1 w-32 sm:w-48 md:w-64"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyLink();
                  } else if (e.key === "Escape") {
                    cancelLink();
                  }
                }}
              />
              <button
                type="button"
                onClick={applyLink}
                className="p-1.5 rounded bg-green-500 hover:bg-green-600 text-white"
                title="Apply Link"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={cancelLink}
                className="p-1.5 rounded bg-red-500 hover:bg-red-600 text-white"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="w-px bg-gray-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          icon={Undo}
          label="undo"
          tooltip="Undo (Ctrl+Z)"
        />

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          icon={Redo}
          label="redo"
          tooltip="Redo (Ctrl+Y / Ctrl+Shift+Z)"
        />
      </div>

      {/* Editor Content */}
      <div className="border border-gray-300 rounded-b-md">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
