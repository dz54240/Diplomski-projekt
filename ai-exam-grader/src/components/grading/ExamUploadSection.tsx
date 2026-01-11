import { Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UploadedImage } from "@/types/grading";
import { ImageUploadZone } from "../shared/ImageUploadZone";
import { ImagePreviewList } from "../shared/ImagePreviewList";

interface ExamUploadSectionProps {
    images: UploadedImage[];
    onImagesChange: (images: UploadedImage[]) => void;
}

export function ExamUploadSection({ images, onImagesChange }: ExamUploadSectionProps) {
    const handleImagesSelected = (files: FileList) => {
        const newImages: UploadedImage[] = [];
        let count = 0;
        const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
        
        if (imageFiles.length === 0) return;

        imageFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newImages.push({ id: crypto.randomUUID(), file, preview: reader.result as string });
                count++;
                if (count === imageFiles.length) {
                    onImagesChange([...images, ...newImages]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (id: string) => {
        onImagesChange(images.filter((img) => img.id !== id));
    };

    const clearAll = () => {
        onImagesChange([]);
    };

    return (
        <div className="rounded-2xl border border-border/50 p-8 space-y-6 bg-card/40 shadow-sm backdrop-blur-md relative overflow-hidden">
            <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-emerald-50/10 text-emerald-600 border border-emerald-100/50 shadow-sm">
                         <Upload className="h-7 w-7" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-foreground tracking-tight">Upload ispita</h3>
                        <p className="text-lg text-muted-foreground font-medium">
                            Dodajte slike riješenog ispita za automatsku analizu
                        </p>
                    </div>
                </div>
                {images.length > 0 && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearAll} 
                        className="text-muted-foreground hover:text-destructive h-10 px-4 transition-colors font-bold uppercase tracking-wider text-xs"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Ukloni sve
                    </Button>
                )}
            </div>

            <ImageUploadZone 
                id="exam-images" 
                onImagesSelected={handleImagesSelected} 
                description="PNG, JPG ili JPEG"
            />

            <ImagePreviewList images={images} onRemove={removeImage} />
        </div>
    );
}
