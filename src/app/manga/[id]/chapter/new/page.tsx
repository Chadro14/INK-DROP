"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader } from "@/components/ui/loader";

export default function ChapterNewRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const mangaId = params?.id as string;

  useEffect(() => {
    if (mangaId) {
      router.replace(`/creator/upload/chapter/${mangaId}`);
    } else {
      router.push("/profile");
    }
  }, [mangaId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <Loader label="Redirection vers la création du chapitre..." />
    </div>
  );
}
