export type ContactInquiryType = "private_course" | "collaboration";

export interface ContactSubmission {
  fullName: string;
  email: string;
  mobile: string;
  country: string;
  inquiryType: ContactInquiryType;
  message: string;
  locale: string;
  submittedAt: string;
}
