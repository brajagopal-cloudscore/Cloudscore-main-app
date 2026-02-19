import { Database } from "lucide-react";

export default function ControlNetDatasetsPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-2xl text-center space-y-6">
        <div className="flex justify-center mb-4">
          <div className="p-4  rounded-xl shadow-sm">
            <Database className="w-12 h-12 " strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-4xl font-bold  tracking-tight">
          Datasets Coming Soon
        </h1>

        <p className="text-muted-foreground text-lg leading-relaxed max-w-lg mx-auto">
          We're building advanced dataset management tools with version control,
          smart uploads, and seamless integration. Stay tuned for updates.
        </p>

        <div className="pt-4">
          <div className="h-px w-24 bg-muted mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
