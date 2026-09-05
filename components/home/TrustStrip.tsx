'use client';

import { useLanguage } from '@/lib/i18n/context';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function TrustStrip() {
  const { lang } = useLanguage();
  const t = useTranslation();
  const textDirection = lang === 'FA' ? 'rtl' : 'ltr';

  return (
    <div className="relative w-full overflow-hidden border-y border-white/[0.12] bg-[#101010]">
      <div className="trust-rail-window overflow-hidden" dir="ltr">
        <div
          className={`trust-rail-track flex w-max items-center ${
            lang === 'FA' ? 'trust-rail-track-rtl' : ''
          }`}
          dir="ltr"
        >
          {[false, true].map((isDuplicate) => (
            <dl
              key={String(isDuplicate)}
              aria-hidden={isDuplicate || undefined}
              className="flex shrink-0 items-center"
              dir="ltr"
            >
              {t.trustStrip.items.map((item, index) => (
                <div key={item.label} className="flex shrink-0 items-center">
                  <div
                    className="flex h-16 items-center gap-3 px-6 sm:px-8 md:h-[68px] md:gap-4 md:px-10"
                    dir={textDirection}
                  >
                    <dt
                      className={`whitespace-nowrap font-dm text-[15px] font-semibold leading-none md:text-base ${
                        index < 2 ? 'text-orange' : 'text-cream'
                      }`}
                    >
                      <bdi dir="auto">{item.value}</bdi>
                    </dt>
                    <dd className="whitespace-nowrap font-dm text-xs leading-none text-cream/55 md:text-[13px]">
                      {item.label}
                    </dd>
                  </div>
                  <span
                    aria-hidden="true"
                    className="h-4 w-px shrink-0 bg-orange/35"
                  />
                </div>
              ))}
            </dl>
          ))}
        </div>
      </div>
    </div>
  );
}
