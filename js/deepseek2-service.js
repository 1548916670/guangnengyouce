/**
 * DeepSeek 服务实现
 * 调用 DeepSeek AI API 实现智能用电规划
 */
const deepseekService = {
    // DeepSeek API 配置
    apiKey: "sk-86b9f8811a8e409fb26aa88cfba76fba", // 请替换为您的实际API密钥
    apiEndpoint: "https://api.deepseek.com/v1/chat/completions",
    
    /**
     * 生成完整用电规划
     * @param {Object} data 输入数据
     * @returns {Promise<Object>} 用电规划数据
     */
    generatePowerSchedule: async function(data) {
        console.log("DeepSeek 服务生成用电规划被调用", data);
        
        try {
            // 准备 AI 提示词
            const prompt = this._buildPowerSchedulePrompt(data);
            
            // 调用 DeepSeek API
            const response = await this._callDeepSeekAPI(prompt);
            
            // 解析 AI 响应
            const result = this._parsePowerScheduleResponse(response, data);
            console.log("DeepSeek API 返回处理后的结果:", result);
            
            return result;
        } catch (error) {
            console.error("DeepSeek API调用失败:", error);
            console.log("使用备用数据...");
            
            // 返回备用数据
            return this._getBackupPowerSchedule(data);
        }
    },
    
    /**
     * 获取智能用电建议
     * @param {Object} data 输入数据
     * @returns {Promise<Object>} 智能建议
     */
    getSmartPowerSuggestions: async function(data) {
        console.log("获取智能用电建议被调用", data);
        
        try {
            // 准备 AI 提示词
            const prompt = this._buildSuggestionPrompt(data);
            
            // 调用 DeepSeek API
            const response = await this._callDeepSeekAPI(prompt);
            
            // 解析 AI 响应
            const result = this._parseSuggestionResponse(response);
            console.log("DeepSeek API 返回处理后的建议:", result);
            
            return result;
        } catch (error) {
            console.error("DeepSeek API调用失败:", error);
            console.log("使用备用建议...");
            
            // 返回备用建议
            return this._getBackupSuggestion(data);
        }
    },
    
    /**
     * 调用 DeepSeek API
     * @param {String} prompt AI提示词
     * @returns {Promise<Object>} API 响应
     */
    _callDeepSeekAPI: async function(prompt) {
        console.log("调用 DeepSeek API，提示词:", prompt.substring(0, 100) + "...");
        
        try {
            // 构建 API 请求
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat", // 或其他适合的模型
                    messages: [
                        { role: "system", content: "你是一个专业的光伏系统能源管理助手，根据家庭发电、用电数据和天气情况，提供精准的用电规划和建议。" },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.3,
                    max_tokens: 1500
                })
            });
            
            // 检查响应状态
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API请求失败: ${response.status} ${errorText}`);
            }
            
            // 解析响应
            const data = await response.json();
            console.log("API 原始响应:", data);
            
            return data.choices[0].message.content;
        } catch (error) {
            console.error("API 调用出错:", error);
            throw error;
        }
    },
    
    /**
     * 构建用电规划提示词
     * @param {Object} data 输入数据
     * @returns {String} AI提示词
     */
    _buildPowerSchedulePrompt: function(data) {
        const { historyData, appliances, pricePlan, weather, season, isWeekend } = data;
        
        // 构建发电和用电数据描述
        let generationData = "每小时发电量(kWh): ";
        let consumptionData = "每小时用电量(kWh): ";
        let priceData = "每小时电价(元/kWh): ";
        
        historyData.forEach(item => {
            generationData += `${item.hour}点(${item.generation}), `;
            consumptionData += `${item.hour}点(${item.consumption}), `;
            priceData += `${item.hour}点(${item.electricityPrice}), `;
        });
        
        // 构建家电信息
        let applianceInfo = "家电信息:\n";
        appliances.forEach(app => {
            applianceInfo += `- ${app.name}: 功率${app.power}W, 使用时长${app.duration}小时, ${app.flexible ? '可灵活安排' : '不可灵活安排'}\n`;
        });
        
        // 构建完整提示词
        const prompt = `
请为一个家庭光伏系统用户生成详细的24小时智能用电规划，基于以下信息:

1. 发电与用电数据:
${generationData}
${consumptionData}
${priceData}

2. ${applianceInfo}

3. 电价计划: ${pricePlan.type}
${pricePlan.plans.map(p => `- ${p.timeRange}: ${p.price}元/kWh (${p.type})`).join('\n')}

4. 环境信息:
- 天气: ${weather.condition}, 温度: ${weather.temperature}°C, 湿度: ${weather.humidity}%
- 季节: ${season}
- ${isWeekend ? '今天是周末' : '今天是工作日'}

请生成以下格式的JSON响应:
{
  "strategy": {
    "summary": "整体用电策略概述",
    "points": ["具体策略点1", "具体策略点2", "具体策略点3", "具体策略点4", "具体策略点5"]
  },
  "timeframes": [
    {
      "timeRange": "时间段，如00:00-06:00",
      "type": "时段类型，如低谷时段、高峰时段等",
      "electricityPrice": "电价",
      "description": "该时段用电建议描述",
      "recommendedAppliances": ["推荐在该时段使用的家电ID"]
    }
    // 其他时间段...
  ],
  "applianceSchedule": [
    {
      "applianceId": "家电ID",
      "recommendedHours": [推荐使用的小时数组，如[9, 10, 11]]
    }
    // 其他家电...
  ]
}

请确保:
1. 考虑光伏发电和用电负载平衡
2. 优先在光伏发电高峰期使用大功率电器
3. 避开电网高峰期用电
4. 根据家电灵活性合理安排使用时间
5. 响应必须严格按照示例JSON格式，不要有任何额外的文本或说明
`;
        
        return prompt;
    },
    
    /**
     * 构建实时用电建议提示词
     * @param {Object} data 输入数据
     * @returns {String} AI提示词
     */
    _buildSuggestionPrompt: function(data) {
        const { generation, consumption, weather, appliances, time } = data;
        
        // 构建家电信息
        let applianceInfo = "可用家电:\n";
        appliances.forEach(app => {
            applianceInfo += `- ${app.name} (ID: ${app.id}, 功率: ${app.power}W)\n`;
        });
        
        // 构建提示词
        const prompt = `
请为家庭光伏系统用户提供实时智能用电建议，基于以下信息:

1. 当前状态:
   - 当前时间: ${time}
   - 光伏发电量: ${generation} kW
   - 家庭用电量: ${consumption} kW
   - 电力平衡: ${(generation - consumption).toFixed(2)} kW (正值表示有余电，负值表示需要从电网购电)

2. 天气情况:
   - 天气: ${weather.condition}
   - 温度: ${weather.temperature}°C
   - 湿度: ${weather.humidity}%

3. ${applianceInfo}

请生成JSON格式的用电建议:
{
  "mainSuggestion": "主要建议",
  "recommended": ["建议立即使用的家电ID"],
  "delayed": ["建议延后使用的家电ID"],
  "reasoning": "给出这些建议的理由"
}

请确保:
1. 如果当前光伏发电量大于用电量，建议使用更多电器以消纳自发电
2. 如果当前用电量大于光伏发电量，建议减少不必要用电
3. 响应必须严格按照示例JSON格式，不要有任何额外的文本或说明
`;
        
        return prompt;
    },
    
    /**
     * 解析用电规划响应
     * @param {String} response API响应文本
     * @param {Object} originalData 原始输入数据
     * @returns {Object} 解析后的用电规划
     */
    _parsePowerScheduleResponse: function(response, originalData) {
        try {
            // 尝试解析JSON响应
            // 需要找出JSON部分，因为有时候API可能会返回一些非JSON的内容
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const jsonStr = jsonMatch[0];
                return JSON.parse(jsonStr);
            }
            
            throw new Error("无法从API响应中提取有效JSON");
        } catch (error) {
            console.error("解析API响应失败:", error);
            console.error("原始响应:", response);
            return this._getBackupPowerSchedule(originalData);
        }
    },
    
    /**
     * 解析实时用电建议响应
     * @param {String} response API响应文本
     * @returns {Object} 解析后的用电建议
     */
    _parseSuggestionResponse: function(response) {
        try {
            // 尝试解析JSON响应
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const jsonStr = jsonMatch[0];
                return JSON.parse(jsonStr);
            }
            
            throw new Error("无法从API响应中提取有效JSON");
        } catch (error) {
            console.error("解析API响应失败:", error);
            return {
                mainSuggestion: "当前光伏发电情况良好，可以适量使用电器",
                recommended: ["washing-machine"],
                delayed: ["ev-charging"],
                reasoning: "基于当前发电与用电状况的系统分析"
            };
        }
    },
    
    /**
     * 获取备用用电规划数据
     * @param {Object} data 原始输入数据
     * @returns {Object} 备用用电规划
     */
    _getBackupPowerSchedule: function(data) {
        // 返回一个静态的备用数据
        return {
            strategy: {
                summary: "今日天气" + (data.weather ? data.weather.condition : "晴朗") + 
                         "，建议利用09:00-15:00光伏发电高峰期使用大功率电器，避开17:00-21:00电网高峰期。",
                points: [
                    "上午9-11点预计阳光充足，发电量高，建议运行洗衣机等家电",
                    "中午11-13点适合使用厨房电器，发电量与用电量较为匹配",
                    "下午2-4点可运行中小功率电器，利用余电",
                    "晚间用电高峰期(18-21点)建议减少用电或使用储能电池供电",
                    "深夜电价低谷期(23-次日6点)适合电动车充电等灵活性用电"
                ]
            },
            timeframes: [
                {
                    timeRange: "00:00-06:00",
                    type: "低谷时段",
                    electricityPrice: "0.26",
                    description: "电网低谷时段，电价最低，适合电动车充电等大功率、灵活性用电。",
                    recommendedAppliances: ["ev-charging"]
                },
                {
                    timeRange: "06:00-09:00",
                    type: "平时段",
                    electricityPrice: "0.38",
                    description: "光伏开始发电，但发电量仍较低，建议控制用电。",
                    recommendedAppliances: []
                },
                {
                    timeRange: "09:00-11:00",
                    type: "发电高峰",
                    electricityPrice: "0.48",
                    description: "光伏发电量开始上升，可进行日常家务活动。",
                    recommendedAppliances: ["washing-machine"]
                },
                {
                    timeRange: "11:00-13:00",
                    type: "发电高峰",
                    electricityPrice: "0.48",
                    description: "光伏发电接近峰值，适合使用厨房电器。",
                    recommendedAppliances: ["rice-cooker"]
                },
                {
                    timeRange: "13:00-17:00",
                    type: "发电高峰",
                    electricityPrice: "0.48",
                    description: "下午光照充足，发电量良好，适合使用中小功率电器。",
                    recommendedAppliances: ["ac"]
                },
                {
                    timeRange: "17:00-21:00",
                    type: "用电高峰",
                    electricityPrice: "0.56",
                    description: "电网高峰期，光伏发电下降，建议减少用电，必要时使用储能电池。",
                    recommendedAppliances: ["water-heater"]
                },
                {
                    timeRange: "21:00-24:00",
                    type: "低谷时段",
                    electricityPrice: "0.26",
                    description: "夜间低谷时段，电价较低，可选择性用电。",
                    recommendedAppliances: ["ev-charging"]
                }
            ],
            applianceSchedule: [
                {
                    applianceId: "washing-machine",
                    recommendedHours: [9, 10, 11, 14, 15]
                },
                {
                    applianceId: "ev-charging",
                    recommendedHours: [0, 1, 2, 3, 4, 5, 22, 23]
                },
                {
                    applianceId: "ac",
                    recommendedHours: [12, 13, 14, 15, 16]
                },
                {
                    applianceId: "rice-cooker",
                    recommendedHours: [11, 12, 18, 19]
                },
                {
                    applianceId: "water-heater",
                    recommendedHours: [16, 19, 20]
                }
            ]
        };
    },
    
    /**
     * 获取备用实时用电建议
     * @param {Object} data 原始输入数据
     * @returns {Object} 备用用电建议
     */
    _getBackupSuggestion: function(data) {
        const powerBalance = data.generation - data.consumption;
        
        if (powerBalance > 1.0) {
            return {
                mainSuggestion: "当前光伏发电充足，建议使用洗衣机等大功率电器",
                recommended: ["washing-machine", "ac"],
                delayed: ["water-heater", "ev-charging"],
                reasoning: "当前光照条件良好，光伏发电大于家庭用电需求"
            };
        } else if (powerBalance > 0) {
            return {
                mainSuggestion: "当前光伏发电基本满足用电需求，可以适度用电",
                recommended: ["washing-machine"],
                delayed: ["ev-charging", "ac"],
                reasoning: "当前发电量略大于用电量，建议适度使用家电"
            };
        } else {
            return {
                mainSuggestion: "当前用电量大于光伏发电量，建议减少使用大功率电器",
                recommended: [],
                delayed: ["washing-machine", "ev-charging", "ac"],
                reasoning: "当前发电不足以满足用电需求，建议控制用电"
            };
        }
    }
};