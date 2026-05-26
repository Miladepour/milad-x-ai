export type LocaleCode = "EN" | "FA";

export type ContactInquiryType = "private_course" | "collaboration";

export interface AdminProfile {
  id: string;
  email: string;
  created_at: string;
}

export interface BlogPostRow {
  id: string;
  slug: string;
  locale: LocaleCode;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface ContactSubmissionRow {
  id: string;
  full_name: string;
  email: string;
  mobile: string;
  country: string;
  inquiry_type: ContactInquiryType;
  message: string;
  locale: string;
  submitted_at: string;
}

export interface WaitlistSubmissionRow {
  id: string;
  course_slug: string;
  full_name: string;
  email: string;
  mobile: string;
  country: string;
  locale: string;
  submitted_at: string;
}

type TableDef<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      admin_profiles: TableDef<
        AdminProfile,
        Pick<AdminProfile, "id" | "email">,
        Partial<Pick<AdminProfile, "email">>
      >;
      blog_posts: TableDef<
        BlogPostRow,
        Omit<BlogPostRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Omit<BlogPostRow, "id">>
      >;
      contact_submissions: TableDef<
        ContactSubmissionRow,
        {
          full_name: string;
          email: string;
          mobile: string;
          country: string;
          inquiry_type: ContactInquiryType;
          message: string;
          locale: string;
          id?: string;
          submitted_at?: string;
        },
        Partial<Omit<ContactSubmissionRow, "id">>
      >;
      waitlist_submissions: TableDef<
        WaitlistSubmissionRow,
        {
          course_slug: string;
          full_name: string;
          email: string;
          mobile: string;
          country: string;
          locale: string;
          id?: string;
          submitted_at?: string;
        },
        Partial<Omit<WaitlistSubmissionRow, "id">>
      >;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
