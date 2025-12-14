export interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  nisn: string;
  birth_date: string;
  jenis_kelamin: string;
  created_at?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  created_at?: string;
}