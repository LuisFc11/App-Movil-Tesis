import { ChatMessage } from '@/types';

export class ChatBotService {
  private responses: { [key: string]: string[] } = {
    greeting: [
      '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
      '¡Buen día! ¿Cómo puedo asistirte?',
      '¡Hola! Estoy aquí para ayudarte con cualquier consulta.'
    ],
    products: [
      'Tenemos una gran variedad de productos electrónicos, audio, computadoras y más.',
      'Puedes usar el escáner para obtener información detallada de cualquier producto.',
      'Nuestro catálogo incluye smartphones, laptops, auriculares y tablets de última generación.'
    ],
    prices: [
      'Los precios varían según el producto. Usa el escáner para ver el precio exacto.',
      'Ofrecemos precios competitivos en todos nuestros productos.',
      'Puedes encontrar productos desde $199 hasta $1599.'
    ],
    help: [
      'Puedo ayudarte con información sobre productos, precios y disponibilidad.',
      'Usa el escáner para obtener detalles de productos específicos.',
      'También puedo guiarte sobre cómo usar la aplicación.'
    ],
    default: [
      'Interesante pregunta. ¿Podrías ser más específico?',
      'No estoy seguro de entender. ¿Puedes reformular tu pregunta?',
      'Hmm, no tengo información específica sobre eso. ¿Te puedo ayudar con algo más?'
    ]
  };

  public generateResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    if (this.containsWords(message, ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'hi', 'hello'])) {
      return this.getRandomResponse('greeting');
    }
    
    if (this.containsWords(message, ['producto', 'productos', 'catálogo', 'tienda'])) {
      return this.getRandomResponse('products');
    }
    
    if (this.containsWords(message, ['precio', 'precios', 'costo', 'cuánto', 'cuanto'])) {
      return this.getRandomResponse('prices');
    }
    
    if (this.containsWords(message, ['ayuda', 'help', 'como', 'cómo', 'que puedes hacer'])) {
      return this.getRandomResponse('help');
    }
    
    return this.getRandomResponse('default');
  }

  private containsWords(message: string, words: string[]): boolean {
    return words.some(word => message.includes(word));
  }

  private getRandomResponse(category: string): string {
    const responses = this.responses[category];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}