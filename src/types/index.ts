export interface User {
  name: string;
}

export interface Blog {
  id: string;
  title: string;
  image?: string ; 
  content: string; 
  createdAt: string;
  category?: string; // ✅ added
  description?: string; // ✅ added
  status?: string; // ✅ added
  images?: string[]; // ✅ added
}

export interface Booking {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  details?: string;
  date?: string;
  message?: string;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  subject?: string;
  message?: string;
  createdAt: string;
}
