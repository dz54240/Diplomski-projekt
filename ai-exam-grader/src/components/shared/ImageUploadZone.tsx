import { useState } from "react";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ImageUploadZoneProps {
    id: string;
    onImagesSelected: (files: FileList) => void;
    multiple?: boolean;
    title?: string;
    description?: string;
}

export function ImageUploadZone({ 
    id, 
    onImagesSelected, 
    multiple = true, 
    title = "Kliknite za odabir slika", 
    description = "PNG, JPG ili JPEG" 
}: ImageUploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onImagesSelected(e.target.files);
            e.target.value = '';
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onImagesSelected(e.dataTransfer.files);
        }
    };

    return (
        <label 
            htmlFor={id} 
            className={cn(
                "flex items-center justify-center rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-all group/zone",
                isDragging 
                    ? "border-primary bg-primary/10 scale-[0.99] shadow-inner" 
                    : "border-muted-foreground/20 bg-card/40 hover:bg-card/60 hover:border-primary/50 shadow-sm"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="flex flex-col items-center gap-4 text-center pointer-events-none">
                <div className={cn(
                    "rounded-2xl p-4 transition-all duration-300 shadow-sm group-hover/zone:shadow-md group-hover/zone:scale-110",
                    isDragging ? "bg-primary text-white scale-110" : "bg-primary/5 text-primary group-hover/zone:bg-primary/10"
                )}>
                    <Upload className="h-7 w-7" />
                </div>
                <div>
                    <div className="font-bold text-lg">{isDragging ? "Ispustite slike ovdje" : title}</div>
                    <div className="text-base text-muted-foreground mt-1">{description}</div>
                </div>
            </div>
            <Input 
                id={id} 
                type="file" 
                className="hidden" 
                multiple={multiple} 
                accept="image/*"
                onChange={handleChange}
            />
        </label>
    );
}
