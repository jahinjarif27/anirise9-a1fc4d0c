import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface Props {
  value: string;
  onChange: (dataUrl: string) => void;
  label?: string;
  aspect?: string;
  altValue?: string;
  onAltChange?: (alt: string) => void;
}

export const ImageUpload = ({ value, onChange, label = "Image", aspect = "aspect-video", altValue, onAltChange }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image must be under 4MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
      toast.success(`${label} uploaded`);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">{label}</label>
      <div className={`relative w-full max-w-md ${aspect} rounded-xl border-2 border-dashed border-border bg-secondary/30 overflow-hidden`}>
        {value ? (
          <img src={value} alt={label} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-muted-foreground text-xs">
            No image
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <div className="mt-2 flex gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
          <Upload className="h-4 w-4" /> Upload
        </Button>
        {value && (
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange("")}>
            <X className="h-4 w-4" /> Remove
          </Button>
        )}
      </div>
      {onAltChange && (
        <div className="mt-3">
          <label className="text-xs font-medium mb-1 block text-muted-foreground">
            Alt text <span className="opacity-60">(SEO & accessibility)</span>
          </label>
          <Input
            value={altValue || ""}
            onChange={(e) => onAltChange(e.target.value)}
            placeholder="Describe this image for screen readers and search engines"
          />
        </div>
      )}
    </div>
  );
};
