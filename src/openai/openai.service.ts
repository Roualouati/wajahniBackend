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

  async determinePersonalityType(scores: Record<string, number>): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Analyze these MBTI trait scores and return only the most likely 4-letter type:'
          },
          {
            role: 'user',
            content: `Scores: ${JSON.stringify(scores)}\n\nConsider these interpretations:
            - Extraversion (E) vs Introversion (I)
            - Intuition (N) vs Sensing (S)
            - Feeling (F) vs Thinking (T)
            - Judging (J) vs Perceiving (P)
            
            Return ONLY the 4-letter code (e.g., "INFJ")`
          }
        ],
        max_tokens: 10,
        temperature: 0.2 // Lower temperature for more consistent results
      });

      return response.choices[0]?.message?.content?.trim() || '';
    } catch (error) {
      console.error('Error determining personality type:', error);
      throw new Error('Failed to determine personality type');
    }
  }
}