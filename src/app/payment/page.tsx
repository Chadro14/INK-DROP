import { Suspense } from "react";
import PaymentContent from "./PaymentContent";

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-zinc-400 text-sm">Chargement...</p>
        </div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
