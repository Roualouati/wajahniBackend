export class GenerateRecommendationDto {
    userId: number;
  }
  
  export class RecommendationResponseDto {
    id: number;
    userId: number;
    personalityType: string;
    strengths: Record<string, any>;
    studyPaths: string[];
    detailedAnalysis: string;
    createdAt: Date;
    personalityTestId: number | null;
    competenceTestId: number | null;
  }
  
  export class BaccalaureateDetailsDto {
    type: string;
    generalAverage: number;
    score: number;
    notes: Record<string, number>;
    comments: Record<string, string>;
  }
  