import {
  formatDeviceLabel,
  getStudentDeviceCapMax,
  hashDeviceToken,
  isStudentDeviceCapEnforced,
} from "@/lib/members/device";
import type { StudentDevice } from "@/lib/members/types";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/** Skip last_seen_at writes when a device was touched recently (layout SSR only). */
const DEVICE_TOUCH_THROTTLE_MS = 10 * 60 * 1000;

function shouldThrottleDeviceTouch(lastSeenAt: string): boolean {
  const elapsed = Date.now() - new Date(lastSeenAt).getTime();
  return elapsed >= 0 && elapsed < DEVICE_TOUCH_THROTTLE_MS;
}

export interface StudentDeviceRow {
  id: string;
  student_id: string;
  token_hash: string;
  label: string;
  user_agent: string | null;
  last_seen_at: string;
  created_at: string;
}

function rowToDevice(
  row: StudentDeviceRow,
  currentTokenHash: string | null
): StudentDevice {
  return {
    id: row.id,
    label: row.label,
    lastSeenAt: row.last_seen_at,
    createdAt: row.created_at,
    isCurrent: currentTokenHash !== null && row.token_hash === currentTokenHash,
  };
}

export async function listStudentDevices(
  studentId: string,
  currentTokenHash: string | null = null
): Promise<StudentDevice[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("student_devices")
    .select("*")
    .eq("student_id", studentId)
    .order("last_seen_at", { ascending: false });

  if (error) throw new Error(error.message);

  return ((data ?? []) as StudentDeviceRow[]).map((row) =>
    rowToDevice(row, currentTokenHash)
  );
}

export async function touchStudentDevice(
  studentId: string,
  token: string,
  userAgent: string | null
): Promise<{ device: StudentDevice; blocked: boolean; cap: number }> {
  const supabase = createClient();
  const tokenHash = hashDeviceToken(token);
  const label = formatDeviceLabel(userAgent);
  const now = new Date().toISOString();
  const cap = getStudentDeviceCapMax();

  const { data: existing, error: existingError } = await supabase
    .from("student_devices")
    .select("*")
    .eq("student_id", studentId)
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (existingError) throw new Error(existingError.message);

  if (existing) {
    if (shouldThrottleDeviceTouch(existing.last_seen_at)) {
      return {
        device: rowToDevice(existing as StudentDeviceRow, tokenHash),
        blocked: false,
        cap,
      };
    }

    const { data: updated, error: updateError } = await supabase
      .from("student_devices")
      .update({
        label,
        user_agent: userAgent,
        last_seen_at: now,
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (updateError) throw new Error(updateError.message);

    return {
      device: rowToDevice(updated as StudentDeviceRow, tokenHash),
      blocked: false,
      cap,
    };
  }

  if (isStudentDeviceCapEnforced()) {
    const { count, error: countError } = await supabase
      .from("student_devices")
      .select("id", { count: "exact", head: true })
      .eq("student_id", studentId);

    if (countError) throw new Error(countError.message);
    if ((count ?? 0) >= cap) {
      return {
        device: {
          id: "",
          label,
          lastSeenAt: now,
          createdAt: now,
          isCurrent: true,
        },
        blocked: true,
        cap,
      };
    }
  }

  const { data: inserted, error: insertError } = await supabase
    .from("student_devices")
    .insert({
      student_id: studentId,
      token_hash: tokenHash,
      label,
      user_agent: userAgent,
      last_seen_at: now,
    })
    .select("*")
    .single();

  if (insertError) throw new Error(insertError.message);

  return {
    device: rowToDevice(inserted as StudentDeviceRow, tokenHash),
    blocked: false,
    cap,
  };
}

export async function removeStudentDevice(
  studentId: string,
  deviceId: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("student_devices")
    .delete()
    .eq("id", deviceId)
    .eq("student_id", studentId);

  if (error) throw new Error(error.message);
}

export async function clearStudentDevicesAdmin(studentId: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("student_devices")
    .delete()
    .eq("student_id", studentId);

  if (error) throw new Error(error.message);
}
