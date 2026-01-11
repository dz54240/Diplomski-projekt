import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UploadedImage } from "@/types/grading";

interface ImagePreviewListProps {
    images: UploadedImage[];
    onRemove: (id: string) => void;
}

export function ImagePreviewList({ images, onRemove }: ImagePreviewListProps) {
    if (images.length === 0) return null;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <AnimatePresence>
                {images.map((img) => (
                    <motion.div 
                        key={img.id} 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        layout
                        className="group relative aspect-square rounded-xl border bg-muted overflow-hidden shadow-sm"
                    >
                        <img 
                            src={img.preview} 
                            alt="Preview" 
                            className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-500" 
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <Button 
                                variant="destructive" 
                                size="icon" 
                                className="h-9 w-9 shadow-lg" 
                                onClick={() => onRemove(img.id)}
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
