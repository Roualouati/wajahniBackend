import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateQuestion(critiqueName: string, questionCount: number): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert MBTI test creator. Generate unique questions that assess ${critiqueName} from different perspectives.`
          },
          {
            role: 'user',
            content: `Generate question #${questionCount} about ${critiqueName} that:
            1. Is answerable with Agree, Neutral, or Disagree
            2. Approaches the trait from a different angle than previous questions
            3. Is clear and concise
            4. Returns only the question text`
          }
        ],
        max_tokens: 100,
        temperature: 0.8 // Slightly higher temperature for more variety
      });

      return response.choices[0]?.message?.content?.trim() || '';
    } catch (error) {
      console.error('Error generating question:', error);
      throw new Error('Failed to generate question');
    }
  }

 
  async determinePersonalityType(scores: Record<string, number>): Promise<{
    type: string;
    description: string;
  }> {
    try {
      // First get the type (using your existing logic)
      const typeResponse = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an MBTI expert. Analyze these scores and return ONLY the 4-letter MBTI type code. 
                      The response must be exactly 4 uppercase letters matching one of the 16 MBTI types.`
          },
          {
            role: 'user',
            content: `Calculate the MBTI type based on these scores:
            Extraversion: ${scores['Extraversion'] || 0}%
            Intuition: ${scores['Intuition'] || 0}%
            Feeling: ${scores['Feeling'] || 0}%
            Judging: ${scores['Judging'] || 0}%
            
            Rules:
            1. Score ≥50% = first letter (E, N, F, J)
            2. Score <50% = second letter (I, S, T, P)
            3. Return ONLY the 4-letter code (e.g., "INFJ")`
          }
        ],
        max_tokens: 10,
        temperature: 0.1,
        stop: ['\n']
      });
  
      const type = typeResponse.choices[0]?.message?.content?.trim() || '';
      const mbtiRegex = /^[EI][NS][FT][JP]$/;
      
      if (!mbtiRegex.test(type)) {
        throw new Error(`Invalid MBTI format: ${type}`);
      }
  
      // Now get a dynamic description based on the actual scores
      const descResponse = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an MBTI expert. Create a personalized 1-2 sentence description of this personality type based on their specific trait scores. 
                      Highlight which traits are strongest based on the percentages.`
          },
          {
            role: 'user',
            content: `Create a description for ${type} personality with these trait scores:
            - Extraversion: ${scores['Extraversion'] || 0}% (${scores['Extraversion'] >= 50 ? 'E' : 'I'})
            - Intuition: ${scores['Intuition'] || 0}% (${scores['Intuition'] >= 50 ? 'N' : 'S'})
            - Feeling: ${scores['Feeling'] || 0}% (${scores['Feeling'] >= 50 ? 'F' : 'T'})
            - Judging: ${scores['Judging'] || 0}% (${scores['Judging'] >= 50 ? 'J' : 'P'})
            
            Focus on:
            1. Their strongest traits (highest percentages)
            2. How these traits likely manifest
            3. Keep it to 1-2 sentences maximum`
          }
        ],
        max_tokens: 100,
        temperature: 0.7 // Slightly higher temp for creative descriptions
      });
  
      const description = descResponse.choices[0]?.message?.content?.trim() || 
        `${type} personality with unique trait combinations`;
  
      return {
        type,
        description
      };
  
    } catch (error) {
      console.error('Error determining personality type:', error);
      
      // Fallback calculation if API fails
      const fallbackType = this.calculateFallbackType(scores);
      return {
        type: fallbackType,
        description: `${fallbackType} personality with balanced traits`
      };
    }
  }

  private calculateFallbackType(scores: Record<string, number>): string {
    const e = (scores['Extraversion'] || 0) >= 50 ? 'E' : 'I';
    const n = (scores['Intuition'] || 0) >= 50 ? 'N' : 'S';
    const f = (scores['Feeling'] || 0) >= 50 ? 'F' : 'T';
    const j = (scores['Judging'] || 0) >= 50 ? 'J' : 'P';
    
    return `${e}${n}${f}${j}`;
  }
}
