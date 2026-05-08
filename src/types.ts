export type BirthdayStatus = 'não iniciado' | 'em andamento' | 'concluido';

export interface Birthday {
  id: string;
  name: string;
  birth_date: string; // YYYY-MM-DD
  status: BirthdayStatus;
  created_at: string;
}

export interface NewBirthday {
  name: string;
  birth_date: string;
  status: BirthdayStatus;
}
