import { getCertificateDimensions } from "@/lib/members/certificate-layout";

interface CertificatePreviewFrameProps {
  children: React.ReactNode;
}

const { width: CERTIFICATE_WIDTH, height: CERTIFICATE_HEIGHT } =
  getCertificateDimensions("document");

export default function CertificatePreviewFrame({
  children,
}: CertificatePreviewFrameProps) {
  return (
    <div
      className="certificate-preview-host mx-auto w-full max-w-[960px] overflow-hidden"
      style={{
        aspectRatio: `${CERTIFICATE_WIDTH} / ${CERTIFICATE_HEIGHT}`,
        containerType: "inline-size",
      }}
    >
      <div
        className="certificate-preview-scaler"
        style={{
          width: CERTIFICATE_WIDTH,
          height: CERTIFICATE_HEIGHT,
          transform: `scale(calc(100cqw / ${CERTIFICATE_WIDTH}px))`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
