"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ArrowLeft, BookOpen, Clock, Calendar, User, ChevronRight } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

// ... (tout le code du lecteur de manga)

export default function ReadContent() {
  // ... tout le code du composant
  // avec useSearchParams() pour gérer le retour
}