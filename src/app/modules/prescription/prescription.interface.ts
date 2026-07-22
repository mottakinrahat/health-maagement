export type IPrescriptionCreate = {
  appointmentId: string;
  instructions?: string;
  followUpDate?: Date;
  items: IPrescriptionItem[];
};

export type IPrescriptionItem = {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
};
