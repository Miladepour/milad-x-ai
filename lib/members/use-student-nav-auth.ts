"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function useStudentNavAuth(): boolean | null {
  const [isStudent, setIsStudent] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsStudent(false);
      return;
    }

    const supabase = createClient();

    async function check() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsStudent(false);
        return;
      }

      const { data: profile } = await supabase
        .from("student_profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      setIsStudent(Boolean(profile));
    }

    void check();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void check();
    });

    return () => subscription.unsubscribe();
  }, []);

  return isStudent;
}
