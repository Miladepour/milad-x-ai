export type ContactInquiryType = "private_course" | "collaboration";

export interface ContactSubmission {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  country: string;
  inquiryType: ContactInquiryType;
  message: string;
  locale: string;
  submittedAt: string;
  openedAt: string | null;
}
