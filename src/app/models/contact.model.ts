// models/contact.model.ts

export interface Office {
  country: string;
  address: string;
  phone: string;
}

export interface Contact {
  name: string;
  phones: string[];
  email: string;
  office: Office;
}

export interface Region {
  value: string;
  label: string;
  contact: Contact;
}

export interface ContactPageContent {
  header: {
    subtitle: string;
    title: string;
    selectHelp: string;
    regionLabel: string;
    regionPlaceholder: string;
  };
  body: {
    leftTexts: string[];
    boldText: string;
    formFields: {
      label: string;
      placeholder: string;
      type?: string;
      rows?: number;
      required?: boolean;
    }[];
    legalText: string;
    sendButtonLabel: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// NUEVO: Mensaje de contacto
// ═══════════════════════════════════════════════════════════════════════════

export interface ContactMessage {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  region: string;
  contactName: string;
  toEmail: string;
  createdAt?: Date;
  read?: boolean;
}