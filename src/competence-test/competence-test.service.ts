// baccalaureate.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BaccalaureateType } from '@prisma/client';
import { SaveBacDataDto } from './dto/competence-test.dto';

@Injectable()
export class BaccalaureateService {
  constructor(private prisma: PrismaService) {}

  async saveBacData(dto: SaveBacDataDto) {
    const {
      userId,
      bacType,
      notes,
      comments,
      globalComment,
      option,
      generalAverage,
    } = dto;

    // Calculate the score based on bacType
    let score = 0;

    switch (bacType) {
      case BaccalaureateType.LITERATURE:
        score =
          4 * generalAverage +
          1.5 * (notes.noteArabic ?? 0) +
          1.5 * (notes.notePhilosophy ?? 0) +
          1 * (notes.historyNote ?? 0) +
          1 * (notes.noteFrench ?? 0) +
          1 * (notes.noteEnglish ?? 0);
        break;

      case BaccalaureateType.MATHEMATICS:
        score =
          4 * generalAverage +
          2 * (notes.noteMathematics ?? 0) +
          1.5 * (notes.notePhysics ?? 0) +
          1.5 * (notes.scienceNote ?? 0) +
          1 * (notes.noteFrench ?? 0) +
          1 * (notes.noteEnglish ?? 0);
        break;

      case BaccalaureateType.EXPERIMENTAL_SCIENCES:
        score =
          4 * generalAverage +
          1 * (notes.noteMathematics ?? 0) +
          1.5 * (notes.notePhysics ?? 0) +
          1.5 * (notes.scienceNote ?? 0) +
          1 * (notes.noteFrench ?? 0) +
          1 * (notes.noteEnglish ?? 0);
        break;

      case BaccalaureateType.TECHNICAL:
        score =
          4 * generalAverage +
          1.5 * (notes.technicalNote ?? 0) +
          1.5 * (notes.noteMathematics ?? 0) +
          1 * (notes.notePhysics ?? 0) +
          1 * (notes.noteFrench ?? 0) +
          1 * (notes.noteEnglish ?? 0);
        break;

      case BaccalaureateType.ECONOMICS_AND_MANAGEMENT:
        score =
          4 * generalAverage +
          1.5 * (notes.economicsNote ?? 0) +
          1.5 * (notes.managementNote ?? 0) +
          0.5 * (notes.noteMathematics ?? 0) +
          0.5 * (notes.historyAndGeographyNote ?? 0) +
          1 * (notes.noteFrench ?? 0) +
          1 * (notes.noteEnglish ?? 0);
        break;

      case BaccalaureateType.SPORTS:
        score =
          4 * generalAverage +
          1.5 * (notes.biologicalSciencesNote ?? 0) +
          1 * (notes.sportsSpecializationNote ?? 0) +
          0.5 * (notes.physicalEducationNote ?? 0) +
          0.5 * (notes.notePhysics ?? 0) +
          1 * (notes.noteFrench ?? 0) +
          1 * (notes.noteEnglish ?? 0) +
          0.5 * (notes.notePhilosophy ?? 0);
        break;

      case BaccalaureateType.COMPUTER_SCIENCE:
        score =
          4 * generalAverage +
          1.5 * (notes.noteMathematics ?? 0) +
          1.5 * (notes.algorithmsNote ?? 0) +
          0.5 * (notes.notePhysics ?? 0) +
          0.5 * (notes.stiNote ?? 0) +
          1 * (notes.noteFrench ?? 0) +
          1 * (notes.noteEnglish ?? 0);
        break;

      default:
        score = 0;
        break;
    }

    // Common fields
    const commonData = {
      notePhilosophy: notes.notePhilosophy ?? null,
      noteArabic: notes.noteArabic ?? null,
      noteEnglish: notes.noteEnglish ?? null,
      noteFrench: notes.noteFrench ?? null,
      noteSport: notes.noteSport ?? null,
      noteMathematics: notes.noteMathematics ?? null,
      noteOptions: notes.noteOptions ?? null,
      generalAverage: generalAverage ?? null,

      philosophyComment: comments.philosophyComment ?? null,
      arabicComment: comments.arabicComment ?? null,
      englishComment: comments.englishComment ?? null,
      frenshComment: comments.frenshComment ?? null,
      sportComment: comments.sportComment ?? null,
      mathematicsComment: comments.mathematicsComment ?? null,
      optionComment: comments.optionComment ?? null,
      options: option ?? null,
      globalComment,
      type: bacType,
      Score: score,
    };

    // Update or create the base Baccalaureate
    const baccalaureate = await this.prisma.baccalaureate.upsert({
      where: { userId },
      create: {
        userId,
        ...commonData,
      },
      update: {
        ...commonData,
      },
    });

    // Handle specific subjects
    const bacId = baccalaureate.id;

    switch (bacType) {
      case BaccalaureateType.EXPERIMENTAL_SCIENCES:
        await this.prisma.experimentalSciencesBac.upsert({
          where: { baccalaureateId: bacId },
          create: {
            baccalaureateId: bacId,
            scienceNote: notes.scienceNote ?? null,
            informaticsNote: notes.informaticsNote ?? null,
            scienceComment: comments.scienceComment ?? null,
            informaticsComment: comments.informaticsComment ?? null,
            physicsComment: comments.physicsComment ?? null,
            notePhysics: notes.notePhysics ?? null,

          },
          update: {
            scienceNote: notes.scienceNote ?? null,
            informaticsNote: notes.informaticsNote ?? null,
            scienceComment: comments.scienceComment ?? null,
            informaticsComment: comments.informaticsComment ?? null,
            physicsComment: comments.physicsComment ?? null,
            notePhysics: notes.notePhysics ?? null,
          },
        });
        break;

      case BaccalaureateType.COMPUTER_SCIENCE:
        await this.prisma.computerScienceBac.upsert({
          where: { baccalaureateId: bacId },
          create: {
            baccalaureateId: bacId,
            algorithmsNote: notes.algorithmsNote ?? null,
            stiNote: notes.stiNote ?? null,
            algorithmsComment: comments.algorithmsComment ?? null,
            stiComment: comments.stiComment ?? null,
            physicsComment: comments.physicsComment ?? null,
            notePhysics: notes.notePhysics ?? null,
          },
          update: {
            algorithmsNote: notes.algorithmsNote ?? null,
            stiNote: notes.stiNote ?? null,
            algorithmsComment: comments.algorithmsComment ?? null,
            stiComment: comments.stiComment ?? null,
            physicsComment: comments.physicsComment ?? null,
            notePhysics: notes.notePhysics ?? null,
          },
        });
        break;

      case BaccalaureateType.LITERATURE:
        await this.prisma.literatureBac.upsert({
          where: { baccalaureateId: bacId },
          create: {
            baccalaureateId: bacId,
            historyAndGeographyNote: notes.historyNote ?? null,
            islamicNote: notes.islamicNote ?? null,
            informaticsNote: notes.informaticsNote ?? null,
            historyAndGeographyComment: comments.historyComment ?? null,
            islamicComment: comments.islamicComment ?? null,
            informaticsComment: comments.informaticsComment ?? null,
          },
          update: {
            historyAndGeographyNote: notes.historyNote ?? null,
            islamicNote: notes.islamicNote ?? null,
            informaticsNote: notes.informaticsNote ?? null,
            historyAndGeographyComment: comments.historyComment ?? null,
            islamicComment: comments.islamicComment ?? null,
            informaticsComment: comments.informaticsComment ?? null,
          },
        });
        break;

      case BaccalaureateType.SPORTS:
        await this.prisma.sportsBac.upsert({
          where: { baccalaureateId: bacId },
          create: {
            baccalaureateId: bacId,
            biologicalSciencesNote: notes.biologicalSciencesNote ?? null,
            physicalEducationNote: notes.physicalEducationNote ?? null,
            informaticsNote: notes.informaticsNote ?? null,
            sportsSpecializationNote: notes.sportsSpecializationNote ?? null,
            scienceNote: notes.scienceNote ?? null,
            biologicalSciencesComment: comments.biologicalSciencesComment ?? null,
            physicalEducationComment: comments.physicalEducationComment ?? null,
            informaticsComment: comments.informaticsComment ?? null,
            sportsSpecializationComment: comments.sportsSpecializationComment ?? null,
            scienceComment: comments.scienceComment ?? null,
            physicsComment: comments.physicsComment ?? null,
            notePhysics: notes.notePhysics ?? null,
          },
          update: {
            biologicalSciencesNote: notes.biologicalSciencesNote ?? null,
            physicalEducationNote: notes.physicalEducationNote ?? null,
            informaticsNote: notes.informaticsNote ?? null,
            sportsSpecializationNote: notes.sportsSpecializationNote ?? null,
            scienceNote: notes.scienceNote ?? null,
            biologicalSciencesComment: comments.biologicalSciencesComment ?? null,
            physicalEducationComment: comments.physicalEducationComment ?? null,
            informaticsComment: comments.informaticsComment ?? null,
            sportsSpecializationComment: comments.sportsSpecializationComment ?? null,
            scienceComment: comments.scienceComment ?? null,
            physicsComment: comments.physicsComment ?? null,
            notePhysics: notes.notePhysics ?? null,
          },
        });
        break;

      case BaccalaureateType.ECONOMICS_AND_MANAGEMENT:
        await this.prisma.economicsAndManagementBac.upsert({
          where: { baccalaureateId: bacId },
          create: {
            baccalaureateId: bacId,
            economicsNote: notes.economicsNote ?? null,
            managementNote: notes.managementNote ?? null,
            informaticsNote: notes.informaticsNote ?? null,
            historyAndGeographyNote: notes.historyAndGeographyNote ?? null,
            economicsComment: comments.economicsComment ?? null,
            managementComment: comments.managementComment ?? null,
            informaticsComment: comments.informaticsComment ?? null,
            historyAndGeographyComment: comments.historyAndGeographyComment ?? null,
          },
          update: {
            economicsNote: notes.economicsNote ?? null,
            managementNote: notes.managementNote ?? null,
            informaticsNote: notes.informaticsNote ?? null,
            historyAndGeographyNote: notes.historyAndGeographyNote ?? null,
            economicsComment: comments.economicsComment ?? null,
            managementComment: comments.managementComment ?? null,
            informaticsComment: comments.informaticsComment ?? null,
            historyAndGeographyComment: comments.historyAndGeographyComment ?? null,
          },
        });
        break;

      case BaccalaureateType.TECHNICAL:
        await this.prisma.technicalBac.upsert({
          where: { baccalaureateId: bacId },
          create: {
            baccalaureateId: bacId,
            technicalNote: notes.technicalNote ?? null,
            informaticsNote: notes.informaticsNote ?? null,
            technicalComment: comments.technicalComment ?? null,
            informaticsComment: comments.informaticsComment ?? null,
            physicsComment: comments.physicsComment ?? null,
            notePhysics: notes.notePhysics ?? null,
          },
          update: {
            technicalNote: notes.technicalNote ?? null,
            informaticsNote: notes.informaticsNote ?? null,
            technicalComment: comments.technicalComment ?? null,
            informaticsComment: comments.informaticsComment ?? null,
            physicsComment: comments.physicsComment ?? null,
            notePhysics: notes.notePhysics ?? null,
          },
        });
        break;

      case BaccalaureateType.MATHEMATICS:
        await this.prisma.mathematicsBac.upsert({
          where: { baccalaureateId: bacId },
          create: {
            baccalaureateId: bacId,
            informaticsNote: notes.informaticsNote ?? null,
            scienceNote: notes.scienceNote ?? null,
            informaticsComment: comments.informaticsComment ?? null,
            scienceComment: comments.scienceComment ?? null,
            physicsComment: comments.physicsComment ?? null,
            notePhysics: notes.notePhysics ?? null,
          },
          update: {
            informaticsNote: notes.informaticsNote ?? null,
            scienceNote: notes.scienceNote ?? null,
            informaticsComment: comments.informaticsComment ?? null,
            scienceComment: comments.scienceComment ?? null,
            physicsComment: comments.physicsComment ?? null,
            notePhysics: notes.notePhysics ?? null,
          },
        });
        break;
    }

    return { message: 'Baccalaureate data saved successfully' };
  }



  async  getScore(userId: number): Promise<number | null> {
    const baccalaureate = this.prisma.baccalaureate.findUnique({
      where: { userId },
      select: { Score: true }
    });
  
    return (await baccalaureate)?.Score ?? null;
  }
}
