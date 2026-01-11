import { useFormContext } from "react-hook-form";

export function FieldError({ name }: { name: string }) {
    const ctx = useFormContext();
    const errors = ctx?.formState?.errors ?? {};

    const err = (name || "")
        .split(".")
        .reduce<any>((acc, key) => (acc ? acc[key] : undefined), errors);

    if (!err) return null;
    return (
        <p className="text-xs text-red-600 mt-1">
            {String(err.message ?? "Neispravan unos")}
        </p>
    );
}
