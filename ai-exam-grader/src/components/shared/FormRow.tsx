import React from "react";
import { Label } from "@/components/ui/label";

interface FormRowProps {
    label: string;
    hint?: string;
    htmlFor?: string;
    children: React.ReactNode;
    required?: boolean;
}

export function FormRow({ label, hint, htmlFor, children, required = false }: FormRowProps) {
    return (
        <div className="grid gap-2">
            <div className="flex items-center gap-2">
                <Label htmlFor={htmlFor} className="text-sm font-medium">
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>
                {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
            </div>
            {children}
        </div>
    );
}
