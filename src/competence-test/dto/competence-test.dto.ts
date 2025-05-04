import { BaccalaureateType, Options } from '@prisma/client';

export class SaveBacDataDto {
  userId: number;
  bacType: BaccalaureateType;
  globalComment?: string;
  notes: Record<string, number | null>;
  comments: Record<string, string | null>;
  option?: Options; 
  generalAverage?: number;
}
