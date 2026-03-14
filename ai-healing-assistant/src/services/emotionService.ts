import { analyzeEmotion, analyzeEmotionIntensity } from './glmApi';

// 情绪签到流程管理
export class EmotionCheckinService {
  private currentStep = 0;
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  private emotionData = {
    type: '',
    score: 0,
    intensity: 0,
    keywords: [] as string[],
    trigger: '',
  };

  // 获取下一个问题
  getNextQuestion(userInput?: string): string {
    switch (this.currentStep) {
      case 0:
        return '轻轻告诉我，今天感觉怎么样？用1-2个词形容一下';
      case 1:
        // 分析用户的情绪类型
        const emotionType = analyzeEmotion(userInput || '');
        this.emotionData.type = emotionType || 'unknown';
        this.emotionData.keywords = this.extractKeywords(userInput || '');

        if (emotionType === 'anxiety') {
          return `刚才说你是焦虑，是因为发生了什么吗？`;
        } else if (emotionType === 'low' || emotionType === 'empty') {
          return `这种感觉是从什么时候开始的？今天还是之前就有了？`;
        } else {
          return `这个情绪对你今天的影响大吗？（影响很大/一般/基本不影响）`;
        }
      case 2:
        // 询问持续时间
        return `这种感觉是从什么时候开始的？今天还是之前就有了？`;
      case 3:
        // 询问影响程度
        return `这个情绪对你今天的影响大吗？（影响很大/一般/基本不影响）`;
      case 4:
        // 深度挖掘
        return `面对这种感觉，你今天最需要什么？（倾听/建议/具体的行动）`;
      case 5:
        // 继续深度挖掘
        return `有没有什么特别让你困扰或者纠结的事情？`;
      case 6:
        // 结束与建议
        this.emotionData.intensity = analyzeEmotionIntensity(this.conversationHistory.join(' '));
        return `谢谢你愿意分享。根据你今天的情况，我有一个小建议...`;
      default:
        return '';
    }
  }

  // 提取关键词
  private extractKeywords(text: string): string[] {
    const keywords = text.split(/，|。|！|？|！|\?/g)
      .filter(word => word.trim().length > 0)
      .slice(0, 3);
    return keywords;
  }

  // 处理用户输入
  processUserInput(userInput: string): {
    isComplete: boolean;
    aiResponse: string | null;
    emotionData: typeof this.emotionData;
  } {
    this.conversationHistory.push({
      role: 'user',
      content: userInput,
    });

    this.currentStep++;

    const question = this.getNextQuestion(userInput);
    const isComplete = this.currentStep > 6;

    if (isComplete) {
      // 计算情绪分数（1-7分制）
      this.emotionData.score = this.calculateEmotionScore();

      // 生成微行动建议
      const aiResponse = this.generateMicroAction();
      return {
        isComplete: true,
        aiResponse,
        emotionData: { ...this.emotionData },
      };
    }

    return {
      isComplete: false,
      aiResponse: null,
      emotionData: { ...this.emotionData },
    };
  }

  // 计算情绪分数（简化版）
  private calculateEmotionScore(): number {
    const typeScores: Record<string, number> = {
      anxiety: 2,
      calm: 6,
      low: 2,
      tired: 3,
      happy: 7,
      empty: 2,
    };

    // 基础分数
    let score = typeScores[this.emotionData.type] || 4;

    // 根据强度调整
    if (this.emotionData.intensity >= 4) {
      score -= 1;
    } else if (this.emotionData.intensity <= 2) {
      score += 1;
    }

    // 确保在1-7范围内
    return Math.max(1, Math.min(7, score));
  }

  // 生成微行动建议
  private generateMicroAction(): string {
    const actions = {
      anxiety: [
        '试试3分钟呼吸练习：4-7-8呼吸法，专注于呼吸节奏，这样可以快速缓解焦虑感。',
        '喝一杯温水：慢下来，感受温度和味道，让身心都放松一下。',
      ],
      low: [
        '写下三件值得感恩的事：把注意力转移到积极的方面，有助于改善心情。',
        '到阳台散步5分钟：换个环境，呼吸新鲜空气，转换一下心情。',
      ],
      empty: [
        '主动问候一个朋友：建立真实的连接，缓解孤独感。',
        '读5页轻松的书：转移注意力，减少空虚感的循环。',
      ],
      calm: [
        '听一首疗愈音乐：继续保持这种平静的状态。',
        '拍一张窗外的照片：记录生活中的小美好。',
      ],
      tired: [
        '做10个简单的拉伸动作：放松身体，让心理也跟着放松。',
        '休息15分钟：给自己充充电的时间。',
      ],
      happy: [
        '分享这份快乐：把好消息告诉朋友或家人，让快乐传递出去。',
        '记录这份心情：写下来今天为什么开心，为未来的自己创造美好回忆。',
      ],
    };

    const emotionActions = actions[this.emotionData.type] || actions.calm;
    return emotionActions[Math.floor(Math.random() * emotionActions.length)];
  }

  // 重置签到流程
  reset() {
    this.currentStep = 0;
    this.conversationHistory = [];
    this.emotionData = {
      type: '',
      score: 0,
      intensity: 0,
      keywords: [] as string[],
      trigger: '',
    };
  }
}

// 创建全局实例
export const emotionCheckinService = new EmotionCheckinService();