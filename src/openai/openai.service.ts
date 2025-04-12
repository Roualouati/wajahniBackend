// src/openai/openai.service.ts
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
      
    });
    console.log('🔑 Loaded OpenAI Key:', process.env.OPENAI_API_KEY);

  }

  async generateQuestion(critiqueName: string): Promise<string> {
    const prompt = `Generate a personality test question to assess ${critiqueName} in MBTI style.
    The question should be answerable with: Agree, Neutral, or Disagree.
    Return only the question text, nothing else.`;

    const response = await this.openai.completions.create({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 100,
      temperature: 0.7
    });

    return response.choices[0]?.text?.trim() || '';
  }

  async determinePersonalityType(scores: Record<string, number>): Promise<string> {
    const prompt = `Based on these MBTI trait scores, determine the 4-letter personality type:
    ${JSON.stringify(scores)}
    
    Return only the 4-letter type (e.g., "INFJ"), nothing else.`;

    const response = await this.openai.completions.create({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 10,
      temperature: 0.3
    });

    return response.choices[0]?.text?.trim() || '';
  }}