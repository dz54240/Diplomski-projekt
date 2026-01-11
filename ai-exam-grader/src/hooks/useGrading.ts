import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { GradingResult, UploadedImage, GradingCriterion } from "@/types/grading";
import { rubricSchema } from "@/schemas/gradingSchemas";
import { MOCK_GRADING_RESULT } from "@/data/mockGradingResult";

async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export const DEFAULT_CRITERIA: GradingCriterion[] = [
    {
        id: "default-1",
        criterion: "Točnost rješenja",
        maxPoints: 5,
        guidance: "Gleda se konačni rezultat i točnost izračuna.",
    },
    {
        id: "default-2",
        criterion: "Postupak i logika",
        maxPoints: 5,
        guidance: "Analizira se slijed koraka i primjena ispravnih formula.",
    }
];

export function useGrading() {
    const [referenceImages, setReferenceImages] = useState<UploadedImage[]>([]);
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const methods = useForm({
        resolver: zodResolver(rubricSchema),
        defaultValues: {
            name: "Kriteriji ocjenjivanja",
            globalMaxPoints: 10,
            criteria: DEFAULT_CRITERIA,
            useLLMAssist: true,
            useDemoMode: false,
        },
    });

    const resetGrading = () => {
        setGradingResult(null);
        setError(null);
    };

    const submitGrading = async (values: any) => {
        if (uploadedImages.length === 0) {
            setError("Morate uploadati barem jednu sliku ispita");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            if (values.useDemoMode) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                setGradingResult(MOCK_GRADING_RESULT);
                setIsLoading(false);
                return;
            }

            const encodedReferenceImages = await Promise.all(
                referenceImages.map(async (img) => ({
                    id: img.id,
                    filename: img.file.name,
                    base64: await fileToBase64(img.file),
                    mimeType: img.file.type
                }))
            );

            const encodedExamImages = await Promise.all(
                uploadedImages.map(async (img) => ({
                    id: img.id,
                    filename: img.file.name,
                    base64: await fileToBase64(img.file),
                    mimeType: img.file.type
                }))
            );

            const payload = {
                referenceImages: encodedReferenceImages.length > 0 ? encodedReferenceImages : undefined,
                rubric: {
                    name: values.name,
                    globalMaxPoints: values.globalMaxPoints,
                    criteria: values.criteria
                },
                examImages: encodedExamImages
            };

            const response = await fetch('/api/grade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success && result.data) {
                setGradingResult(result.data);
            } else {
                setError(result.error?.message || 'Došlo je do greške pri ocjenjivanju');
            }
        } catch (err: any) {
            setError(err.message || 'Došlo je do greške pri slanju zahtjeva');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        referenceImages,
        setReferenceImages,
        uploadedImages,
        setUploadedImages,
        gradingResult,
        isLoading,
        error,
        methods,
        submitGrading,
        resetGrading,
    };
}
