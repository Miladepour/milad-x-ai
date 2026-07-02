import { notFound } from "next/navigation";
import VipGuestPassPage from "@/components/vip-guests/VipGuestPassPage";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { pageAlternates } from "@/lib/i18n/metadata";
import { getVipGuestInviteByToken, markVipGuestInviteOpened } from "@/lib/vip-guests/store";
import type { Metadata } from "next";

interface VipPassPageProps {
  params: { locale: string; token: string };
}

export async function generateMetadata({ params }: VipPassPageProps): Promise<Metadata> {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const invite = await getVipGuestInviteByToken(params.token);

  if (!invite) {
    return {
      title: internal === "FA" ? "کارت VIP" : "VIP pass",
    };
  }

  return {
    title:
      internal === "FA"
        ? `کارت VIP — ${invite.fullName}`
        : `VIP pass · ${invite.fullName}`,
    description:
      internal === "FA"
        ? `کارت VIP اختصاصی برای ${invite.eventTitle}`
        : `Your VIP pass for ${invite.eventTitle}`,
    alternates: pageAlternates(`/vip/${params.token}`, locale),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function VipPassPage({ params }: VipPassPageProps) {
  const invite = await getVipGuestInviteByToken(params.token);
  if (!invite) notFound();

  await markVipGuestInviteOpened(params.token);

  return <VipGuestPassPage invite={invite} />;
}
