import { redirect } from "next/navigation";
import StudentProfilePage from "@/components/members/StudentProfilePage";
import { accountLoginPath } from "@/lib/members/paths";
import { isStudentDeviceCapEnforced } from "@/lib/members/device";
import { getStudentDeviceTokenHash } from "@/lib/members/device-session";
import { listStudentDevices } from "@/lib/members/device-store";
import { getStudentProfileAccount } from "@/lib/members/store";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { getStudentUser } from "@/lib/supabase/require-student";
import { translations } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export default async function LearnProfilePage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const t = translations[internal];
  const dateLocale = internal === "FA" ? "fa-IR" : "en-GB";

  const student = await getStudentUser();
  if (!student) redirect(accountLoginPath(locale));

  const account = await getStudentProfileAccount(student.user.id);
  if (!account) redirect(accountLoginPath(locale));

  const currentHash = getStudentDeviceTokenHash();
  let devices = await listStudentDevices(student.user.id, currentHash).catch(
    (error) => {
      console.error("[learn/profile] list devices failed:", error);
      return [];
    }
  );
  const softMode = !isStudentDeviceCapEnforced();

  const deviceLabels = {
    sectionTitle: t.memberPortal.profileDevicesSection,
    sectionSubtitle: t.memberPortal.profileDevicesSubtitle,
    softModeNote: t.memberPortal.profileDevicesSoftModeNote,
    lastSeen: t.memberPortal.profileDevicesLastSeen,
    currentDevice: t.memberPortal.profileDevicesCurrent,
    remove: t.memberPortal.profileDevicesRemove,
    removing: t.memberPortal.profileDevicesRemoving,
    removeFailed: t.memberPortal.profileDevicesRemoveFailed,
    noDevices: t.memberPortal.profileDevicesEmpty,
    loading: t.memberPortal.profileDevicesLoading,
  };

  return (
    <StudentProfilePage
      initialProfile={account.profile}
      initialEnrollments={account.enrollments}
      initialDevices={devices}
      softMode={softMode}
      deviceLabels={deviceLabels}
      dateLocale={dateLocale}
      urlLocale={locale}
      labels={{
        pageTitle: t.memberPortal.profilePageTitle,
        pageSubtitle: t.memberPortal.profilePageSubtitle,
        accountSection: t.memberPortal.profileAccountSection,
        enrollmentsSection: t.memberPortal.profileEnrollmentsSection,
        passwordSection: t.memberPortal.profilePasswordSection,
        memberSince: t.memberPortal.profileMemberSince,
        studentId: t.memberPortal.studentIdLabel,
        emailLocked: t.memberPortal.profileEmailLocked,
        fullName: t.memberPortal.profileFullName,
        email: t.memberPortal.email,
        phone: t.memberPortal.profilePhone,
        phoneOptional: t.memberPortal.profilePhoneOptional,
        languagePreference: t.memberPortal.profileLanguagePreference,
        saveChanges: t.memberPortal.profileSaveChanges,
        saving: t.memberPortal.profileSaving,
        saved: t.memberPortal.profileSaved,
        currentPassword: t.memberPortal.profileCurrentPassword,
        newPassword: t.memberPortal.profileNewPassword,
        confirmPassword: t.memberPortal.profileConfirmPassword,
        updatePassword: t.memberPortal.profileUpdatePassword,
        updatingPassword: t.memberPortal.profileUpdatingPassword,
        passwordUpdated: t.memberPortal.profilePasswordUpdated,
        wrongPassword: t.memberPortal.profileWrongPassword,
        saveFailed: t.memberPortal.profileSaveFailed,
        noEnrollments: t.memberPortal.profileNoEnrollments,
        course: t.memberPortal.profileCourse,
        status: t.memberPortal.profileStatus,
        amountPaid: t.memberPortal.profileAmountPaid,
        enrolledOn: t.memberPortal.profileEnrolledOn,
        accessUntil: t.memberPortal.profileAccessUntil,
        noExpiry: t.memberPortal.noExpiry,
        statusActive: t.memberPortal.profileStatusActive,
        statusExpired: t.memberPortal.profileStatusExpired,
        statusSuspended: t.memberPortal.profileStatusSuspended,
        statusInvited: t.memberPortal.profileStatusInvited,
      }}
    />
  );
}
