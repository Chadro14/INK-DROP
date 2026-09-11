"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/**
 * Cette page redirige vers /participate.
 * Conservée pour compatibilité (anciens liens).
 */
export default function SubmitRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  useEffect(() => {
    if (eventId) {
      router.replace(`/events/${eventId}/participate`);
    }
  }, [eventId, router]);

  return null;
}
