// interfaces/personality-profile.interface.ts
export interface Trait {
    name: string;
    value: number;
  }
  
  export interface RoleModel {
    name: string;
    description: string;
    match: number;
  }
  
  export interface PersonalityProfile {
    title: string;
    traits: Trait[];
    strengths: string[];
    roleModels: RoleModel[];
  }
  