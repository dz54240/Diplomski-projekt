import { FileText, Upload, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { UploadedImage } from "@/types/grading";
import { ImageUploadZone } from "../shared/ImageUploadZone";
import { ImagePreviewList } from "../shared/ImagePreviewList";

interface ReferenceMaterialSectionProps {
    images: UploadedImage[];
    onImagesChange: (images: UploadedImage[]) => void;
}

export function ReferenceMaterialSection({ images, onImagesChange }: ReferenceMaterialSectionProps) {
    const handleImagesSelected = (files: FileList) => {
        const newImages: UploadedImage[] = [];
        let count = 0;
        Array.from(files).forEach((file) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    newImages.push({ id: crypto.randomUUID(), file, preview: reader.result as string });
                    count++;
                    if (count === Array.from(files).filter(f => f.type.startsWith('image/')).length) {
                        onImagesChange([...images, ...newImages]);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const removeImage = (id: string) => {
        onImagesChange(images.filter((img) => img.id !== id));
    };

    const clearAll = () => {
        onImagesChange([]);
    };

    return (
        <div className="space-y-6">
            <Card className="border-none bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent py-0 shadow-md overflow-hidden relative group">
                <div className="absolute -right-12 -top-12 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-110 duration-700">
                    <FileText className="h-48 w-48" />
                </div>
                <CardContent className="py-10 relative z-10 text-center">
                    <div className="flex flex-col items-center gap-6 max-w-3xl mx-auto">
                        <div className="rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-4 shadow-xl shadow-amber-200/50 transform transition-transform hover:rotate-6">
                            <FileText className="h-8 w-8 text-white" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="font-black text-2xl text-amber-900 tracking-tight">Referentni materijali <span className="text-amber-600/70 font-medium text-lg">(opcionalno)</span></h3>
                            <p className="text-lg text-amber-800/80 leading-relaxed font-medium">
                                Pridjelite prijašnje ispravljene ispite iz istog predmeta kako bi AI model bolje razumio 
                                vaše specifične zahtjeve i stil ocjenjivanja.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="rounded-2xl border border-border/50 p-8 space-y-6 bg-card/40 shadow-sm backdrop-blur-md relative overflow-hidden">
                <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-10" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-amber-50/10 text-amber-600 border border-amber-100/50 shadow-sm">
                             <Upload className="h-7 w-7" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-foreground tracking-tight">Upload referentnih materijala</h3>
                            <p className="text-lg text-muted-foreground font-medium">
                                Dodajte slike ispravljenih ispita za referencu
                            </p>
                        </div>
                    </div>
                    {images.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground hover:text-destructive h-10 px-4 transition-colors font-bold uppercase tracking-wider text-xs">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Ukloni sve
                        </Button>
                    )}
                </div>

                <ImageUploadZone 
                    id="reference-images" 
                    onImagesSelected={handleImagesSelected} 
                    description="PNG, JPG ili JPEG"
                />

                <ImagePreviewList images={images} onRemove={removeImage} />
            </div>
        </div>
    );
}
