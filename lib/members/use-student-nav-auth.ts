"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type StudentNavAuthListener = (isStudent: boolean | null) => void;

let sharedResult: boolean | null = null;
let inflightCheck: Promise<boolean> | null = null;
let authSubscription: { unsubscribe: () => void } | null = null;
const listeners = new Set<StudentNavAuthListener>();

function notifyListeners() {
  listeners.forEach((listener) => {
    listener(sharedResult);
  });
}

async function resolveStudentNavAuth(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  return Boolean(profile);
}

async function refreshStudentNavAuth(): Promise<boolean> {
  if (inflightCheck) return inflightCheck;

  inflightCheck = resolveStudentNavAuth()
    .then((result) => {
      sharedResult = result;
      notifyListeners();
      return result;
    })
    .finally(() => {
      inflightCheck = null;
    });

  return inflightCheck;
}

function ensureAuthSubscription() {
  if (authSubscription || !isSupabaseConfigured()) return;

  const supabase = createClient();
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(() => {
    sharedResult = null;
    void refreshStudentNavAuth();
  });

  authSubscription = subscription;
}

export function useStudentNavAuth(): boolean | null {
  const [isStudent, setIsStudent] = useState<boolean | null>(sharedResult);

  useEffect(() => {
    const listener: StudentNavAuthListener = setIsStudent;
    listeners.add(listener);
    ensureAuthSubscription();

    if (sharedResult !== null) {
      setIsStudent(sharedResult);
    } else {
      void refreshStudentNavAuth();
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return isStudent;
}
