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
            content: `You are an expert MBTI test creator with a knack for crafting unique and thought-provoking questions. Generate creative and diverse questions that assess ${critiqueName} from multiple perspectives. Aim to be inventive while maintaining clarity and conciseness.`
          },
          {
            role: 'user',
            content: `Generate question #${questionCount} about ${critiqueName} that:
            1. Is answerable only with Agree, Neutral, or Disagree.
            2. Approaches the trait from a different angle than previous questions and explores new ways of framing the question.
            3. Is clear, concise, and slightly more creative or insightful in its phrasing.
            4. Returns only the question text without any thing else.`
          }
        ],
        max_tokens: 100,
        temperature: 1.2,  
        
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
      const typeResponse = await this.openai.chat.completions.create({
       
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `You are an MBTI expert. Analyze the following scores and return ONLY the corresponding 4-letter MBTI type code, following the rules below: 
                          The result must be one of the 16 MBTI types, in uppercase letters.`
              },
              {
                role: 'user',
                content: `Calculate the MBTI type based on these scores:
                Extraversion: ${scores['Extraversion'] || 0}%
                Intuition: ${scores['Intuition'] || 0}%
                Feeling: ${scores['Feeling'] || 0}%
                Judging: ${scores['Judging'] || 0}%
            
                Rules:
                1. If the score is ≥50%, assign the first letter (E, N, F, J).
                2. If the score is <50%, assign the second letter (I, S, T, P).
                3. Return ONLY the 4-letter type code (e.g., "INFJ").`
              }
            ],
            max_tokens: 10,
            temperature: 0.8,
            
        stop: ['\n']
      });
  
      const type = typeResponse.choices[0]?.message?.content?.trim() || '';
      const mbtiRegex = /^[EI][NS][FT][JP]$/;
      
      if (!mbtiRegex.test(type)) {
        throw new Error(`Invalid MBTI format: ${type}`);
      }
  
      const descResponse = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an MBTI expert. Craft a personalized 1-2 sentence description for the given personality type based on their specific trait scores. 
                      Start with the MBTI type (e.g., "INTP: The Thinker") and then highlight the strongest traits, explaining how they manifest in behavior and mindset. Ensure the description is engaging, focusing on the highest percentages and how they shape the individual’s approach to life.`
          },
          {
            role: 'user',
            content: `Create a description for ${type} personality with these trait scores:
            - Extraversion: ${scores['Extraversion'] || 0}% (${scores['Extraversion'] >= 50 ? 'E' : 'I'})
            - Intuition: ${scores['Intuition'] || 0}% (${scores['Intuition'] >= 50 ? 'N' : 'S'})
            - Feeling: ${scores['Feeling'] || 0}% (${scores['Feeling'] >= 50 ? 'F' : 'T'})
            - Judging: ${scores['Judging'] || 0}% (${scores['Judging'] >= 50 ? 'J' : 'P'})
            
            Focus on:
            1. Starting with the MBTI type and label (e.g., "INTP: The Thinker").
            2. Identifying the strongest traits based on the highest percentages.
            3. Briefly explaining how these traits shape their behavior or approach to life.
            4. Keep it to 1-2 sentences maximum.`
          }
        ],
        max_tokens: 100,
        temperature: 1.2
        
      });
  
      const description = descResponse.choices[0]?.message?.content?.trim() || 
        `${type} personality with unique trait combinations`;
  
      return {
        type,
        description
      };
  
    } catch (error) {
      console.error('Error determining personality type:', error);
      
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

  async generatePersonalityProfile(type: string, description: string) {
    try {
        const response = await this.openai.responses.create({
            model: "gpt-4o",
            input: `
You are an expert in MBTI personality analysis. Generate a detailed profile in JSON format.

Generate a personality profile for an ${type} (${description}) with:
- A creative title (with emoji)
- 5 key traits (name + percentage)
- 5 strengths
- 3 role models (name, description, match %,similar traits)

Return the response as a valid JSON object with no additional text or explanations. 
Format the output strictly like this example:
{
    "title": "Example Title 🎭",
    "keyTraits": [...],
    "strengths": [...],
    "roleModels": [...]
}
            `,
        });

        const output = response.output_text;
        if (!output) throw new Error("No content returned from OpenAI");

        // Try parsing directly first
        try {
            return JSON.parse(output);
        } catch (e) {
            // Fallback to regex if parsing fails
            const match = output.match(/\{[\s\S]*\}/);
            if (!match) throw new Error("No JSON found in output");
            return JSON.parse(match[0]);
        }
    } catch (error) {
        console.error("OpenAI error:", error);
        throw new Error("Failed to generate profile");
    }
}}