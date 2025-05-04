// recommendation.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import * as guideBac from './guideBac.json'; // Adjust the path as necessary

@Injectable()
export class RecommendationService {
  private openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  async generateRecommendations(userId: number) {
    // Get user data from database
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: {
        baccalaureate: {
          include: {
            experimentalSciences: true,
            computerScience: true,
            literature: true,
            sports: true,
            economicsAndManagement: true,
            technical: true,
            mathematics: true,
          },
        },
        personalityTests: {
          where: { isCompleted: true },
          orderBy: { completedAt: 'desc' },
          take: 1,
        },
        
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Prepare the prompt
    const prompt = this.buildPrompt(user);

    // Call OpenAI Responses API
    const response = await this.openai.responses.create({
      model: 'gpt-4-turbo', // or another suitable model
      input: prompt,
    });
    console.log('Raw response from GPT:', response);

    const recommendations = response.output_text;

    // Parse the recommendations and save to database
    return this.saveRecommendations(userId, recommendations);
  }

  private buildPrompt(user: any): string {
    const bac = user.baccalaureate;
    const personality = user.personalityTests[0];
  
    // Extract baccalaureate details based on type
    let bacDetails = this.getBacDetails(bac);
  
    // Prepare the guideBac data for the prompt
    const guideBacString = JSON.stringify(guideBac, null, 2);
  
    return `
      Based on the following student information, recommend suitable study paths from the provided guideBac data.
      Consider their baccalaureate scores, personality type, and competences.
  
      IMPORTANT: Please provide your response in ENGLISH only, using the exact field names specified below.
  
      Student Information:
      - Baccalaureate Type: ${bac.type}
      - General Average: ${bac.generalAverage}
      - Score: ${bac.Score}
      - Baccalaureate Details: ${bacDetails}
      - Personality Type: ${personality.personalityType}
      - Personality Description: ${personality.personalityTypeDescription}
  
      Available Study Paths (guideBac data):
      ${guideBacString}
  
      Recommendations should:
      1. Match the student's baccalaureate type with the baccalaureate type in guideBac
      2. Consider their scores and the points requirements
      3. Align with their personality traits
      4. Fit their competences
      5. Prioritize paths where their scores meet or exceed the cutoff
      6. consider the student's comments on the subjects
  
      Format your response as a JSON object with these exact field names in ENGLISH:
      - "studyPaths": array of recommended paths (include all relevant fields from guideBac but translate them to English)
      - "detailedAnalysis": explanation in English of why these paths were chosen
      - "personalityFit": how each path fits the student's personality (in English)
      - "competenceFit": how each path aligns with the student's competences (in English)
      - "scoreComparison": how the student's scores compare to the cutoffs (in English)
      - "personalityType": the student's personality type (e.g., "INFP")
  
      Important notes about the response:
      - Use only simple ASCII characters (no Arabic or special Unicode)
      - The response must be valid JSON only (no markdown formatting or code blocks)
      - All field names and values should be in English
      - The personalityType must be included as a direct field in the response
    `;
  }
  private getBacDetails(bac: any): string {
    let details = [];
    
    // Common fields
    if (bac.notePhilosophy) details.push(`Philosophy: ${bac.notePhilosophy}`);
    if (bac.noteArabic) details.push(`Arabic: ${bac.noteArabic}`);
    if (bac.noteEnglish) details.push(`English: ${bac.noteEnglish}`);
    if (bac.noteFrench) details.push(`French: ${bac.noteFrench}`);
    if (bac.noteSport) details.push(`Sport: ${bac.noteSport}`);
    if (bac.noteMathematics) details.push(`Mathematics: ${bac.noteMathematics}`);
    if (bac.options) details.push(`Options: ${bac.options}`);

    // Type-specific fields
    switch (bac.type) {
      case 'EXPERIMENTAL_SCIENCES':
        if (bac.experimentalSciences) {
          details.push(`Physics: ${bac.experimentalSciences.notePhysics}`);
          details.push(`Science: ${bac.experimentalSciences.scienceNote}`);
          details.push(`Informatics: ${bac.experimentalSciences.informaticsNote}`);
        }
        break;
        
      case 'COMPUTER_SCIENCE':
        if (bac.computerScience) {
          details.push(`Physics: ${bac.computerScience.notePhysics}`);
          details.push(`Algorithms: ${bac.computerScience.algorithmsNote}`);
          details.push(`STI: ${bac.computerScience.stiNote}`);
        }
        break;
        
      case 'LITERATURE':
        if (bac.literature) {
          details.push(`History/Geography: ${bac.literature.historyAndGeographyNote}`);
          details.push(`Islamic: ${bac.literature.islamicNote}`);
          details.push(`Informatics: ${bac.literature.informaticsNote}`);
        }
        break;
        
      case 'SPORTS':
        if (bac.sports) {
          details.push(`Biological Sciences: ${bac.sports.biologicalSciencesNote}`);
          details.push(`Physical Education: ${bac.sports.physicalEducationNote}`);
          details.push(`Sports Specialization: ${bac.sports.sportsSpecializationNote}`);
          details.push(`Physics: ${bac.sports.notePhysics}`);
        }
        break;
        
      case 'ECONOMICS_AND_MANAGEMENT':
        if (bac.economicsAndManagement) {
          details.push(`Economics: ${bac.economicsAndManagement.economicsNote}`);
          details.push(`Management: ${bac.economicsAndManagement.managementNote}`);
          details.push(`Informatics: ${bac.economicsAndManagement.informaticsNote}`);
          details.push(`History/Geography: ${bac.economicsAndManagement.historyAndGeographyNote}`);
        }
        break;
        
      case 'TECHNICAL':
        if (bac.technical) {
          details.push(`Physics: ${bac.technical.notePhysics}`);
          details.push(`Technical: ${bac.technical.technicalNote}`);
          details.push(`Informatics: ${bac.technical.informaticsNote}`);
        }
        break;
        
      case 'MATHEMATICS':
        if (bac.mathematics) {
          details.push(`Physics: ${bac.mathematics.notePhysics}`);
          details.push(`Informatics: ${bac.mathematics.informaticsNote}`);
          details.push(`Science: ${bac.mathematics.scienceNote}`);
        }
        break;
    }

    return details.join(', ');
  }

  private async saveRecommendations(userId: number, recommendations: string) {
    try {
      // Parse the JSON response (no need for extraction as it's now clean JSON)
      const parsed = JSON.parse(recommendations);
      
      // Transform studyPaths objects into simple strings (using Degree/Branch field)
      const studyPaths = parsed.studyPaths.map((path: any) => 
        path["Degree/Branch"] || JSON.stringify(path)
      );
  
      // Validate required fields
      if (!Array.isArray(studyPaths)) {
        throw new Error('Invalid recommendations format: studyPaths must be an array');
      }
      if (typeof parsed.detailedAnalysis !== 'string') {
        throw new Error('Invalid recommendations format: detailedAnalysis must be a string');
      }
      if (typeof parsed.personalityType !== 'string') {
        throw new Error('Invalid recommendations format: personalityType must be a string');
      }
  
      // Save to database
      return this.prisma.recommendation.create({
        data: {
          userId,
          personalityType: parsed.personalityType,
          studyPaths, // Now an array of strings
          detailedAnalysis: parsed.detailedAnalysis,
          personalityTestId: await this.getLatestPersonalityTestId(userId),
        },
      });
    } catch (error) {
      console.error('Error parsing recommendations:', error);
      console.error('Original response:', recommendations);
      throw new Error(`Failed to save recommendations: ${error.message}`);
    }
  }
  private async getLatestPersonalityTestId(userId: number): Promise<number | null> {
    const test = await this.prisma.personalityTest.findFirst({
      where: { userId, isCompleted: true },
      orderBy: { completedAt: 'desc' },
      select: { id: true },
    });
    return test?.id || null;
  }

  
}