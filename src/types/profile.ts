export interface HealthProfile {
  name: string;
  age: number | null;
  gender: string;
  medications: string[];
  conditions: string[];
  allergies: string[];
  goals: string;
  personalNotes: string;
  updatedAt: string;
}

export const EMPTY_PROFILE: HealthProfile = {
  name: "",
  age: null,
  gender: "",
  medications: [],
  conditions: [],
  allergies: [],
  goals: "",
  personalNotes: "",
  updatedAt: "",
};
