import { useState, useRef, useEffect } from "react";
import {
  Share2,
  Link as LinkIcon,
  Twitter,
  Facebook,
  MessageCircle,
} from "lucide-react";

interface ShareButtonProps {
  url?: string; // default ke window.location.href
}

export default function ShareButton({ url }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const shareUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");

  // Tutup menu kalau klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link berhasil disalin!");
      setOpen(false);
    } catch (err) {
      console.error("Gagal copy link:", err);
    }
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        className="p-2 bg-white/80 text-gray-600 rounded-full hover:bg-white transition-colors"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Share2 className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg border p-2 z-50">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 w-full text-left p-2 rounded hover:bg-gray-100 text-sm"
          >
            <LinkIcon className="w-4 h-4" /> Copy Link
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-full text-left p-2 rounded hover:bg-gray-100 text-sm"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
              shareUrl
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-full text-left p-2 rounded hover:bg-gray-100 text-sm"
          >
            <Twitter className="w-4 h-4" /> Twitter
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              shareUrl
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-full text-left p-2 rounded hover:bg-gray-100 text-sm"
          >
            <Facebook className="w-4 h-4" /> Facebook
          </a>
        </div>
      )}
    </div>
  );
}
