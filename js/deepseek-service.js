/**
 * DeepSeek 服务 - 模拟实现
 * 提供更多样化的用电规划结果
 */
const deepseekService = {
    /**
     * 生成用电规划
     * @param {Object} data 输入数据
     * @returns {Promise<Object>} 用电规划数据
     */
    generatePowerSchedule: async function(data) {
        console.log("DeepSeek服务接收到数据:", data);
        
        // 模拟API延迟，随机1-3秒
        const delay = 1000 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // 天气英文转中文
        const weatherMap = {
            'sunny': '晴朗',
            'cloudy': '多云',
            'overcast': '阴天',
            'rainy': '雨天',
            'foggy': '雾天'
        };
        
        // 根据天气条件调整策略语言
        const weatherCondition = data.weather.condition;
        const weatherChinese = weatherMap[weatherCondition] || weatherCondition;
        const temperature = data.weather.temperature;
        const season = data.season;
        const isWeekend = data.isWeekend;
        
        // 季节转换为中文
        const seasonMap = {
            'spring': '春季',
            'summer': '夏季',
            'autumn': '秋季',
            'winter': '冬季'
        };
        const seasonChinese = seasonMap[season] || season;
        
        // 生成概要语言变体
        let summaryVariants = [
            `今日天气${weatherChinese}，温度${temperature}°C，适宜错峰用电。建议在上午9-11点和下午2-4点使用大功率电器，充分利用光伏发电。`,
            `今天${weatherChinese}天气，气温${temperature}°C，光伏发电效率良好。推荐在光照充足时段(10-15点)集中使用耗电设备，最大化自发自用。`,
            `今日${seasonChinese}${weatherChinese}天气，${temperature}°C，光伏系统预计产能${weatherCondition === 'sunny' ? '优异' : weatherCondition === 'cloudy' ? '良好' : '一般'}。建议错峰用电，合理安排家电使用时间。`
        ];
        
        // 如果是周末，添加周末特定的变体
        if (isWeekend) {
            summaryVariants.push(
                `周末${weatherChinese}天气，温度${temperature}°C。家庭用电需求较大，建议充分利用${season === 'summer' || season === 'spring' ? '中午和下午' : '上午和中午'}的光伏发电高峰期使用家电。`,
                `今天是周末，天气${weatherChinese}，${temperature}°C。可以集中安排洗衣、清洁等家务在光伏发电高峰期进行，提高自发自用率。`
            );
        }
        
        // 根据季节添加特定建议
        if (season === 'summer') {
            summaryVariants.push(
                `夏季${weatherChinese}天气，温度${temperature}°C。空调用电量大，建议在光伏发电高峰13-15点预冷房间，错峰避开电网高峰期。`,
                `炎热${weatherChinese}天气，${temperature}°C。光伏发电量预计丰富，建议白天多使用电器，晚间减少用电，最大化利用太阳能。`
            );
        } else if (season === 'winter') {
            summaryVariants.push(
                `冬季${weatherChinese}天气，温度${temperature}°C。采暖设备耗电较大，建议在11-14点阳光较好时段使用，夜间降低使用频率。`,
                `寒冷${weatherChinese}天气，${temperature}°C。光伏发电时间较短，建议集中在中午时分使用大功率电器，充分利用有限阳光。`
            );
        }
        
        // 随机选择一个概要
        const summaryIndex = Math.floor(Math.random() * summaryVariants.length);
        const summary = summaryVariants[summaryIndex];
        
        // 生成策略点变体集
        const strategyPointsVariants = [
            [
                "上午9-11点预计阳光充足，发电量高，建议运行洗衣机等家电",
                "中午11-13点适合使用厨房电器，发电量与用电量较为匹配",
                "下午2-4点可运行中小功率电器，利用余电",
                "晚间用电高峰期(18-21点)建议减少用电或使用储能电池供电",
                "深夜电价低谷期(23-次日6点)适合电动车充电等灵活性用电"
            ],
            [
                "光照强度在10-14点达到峰值，此时段最适合使用洗衣机、洗碗机等大功率家电",
                "早上7-9点光伏刚启动，建议只使用低功率必要电器",
                "傍晚17-19点光伏发电逐渐减少，同时用电高峰将至，建议减少用电",
                "22点后进入电价低谷期，适合启动电动车充电",
                `${season === 'summer' ? '空调建议在13-16点预制冷，减少晚间高峰期使用' : '热水器建议在阳光充足时段加热，储热供晚间使用'}`
            ],
            [
                `${weatherCondition === 'sunny' ? '阳光充足，光伏效率最佳' : weatherCondition === 'cloudy' ? '多云天气，光伏发电仍较稳定' : '天气不佳，光伏发电效率受限'}，合理安排用电计划`,
                "电价低谷时段(23:00-次日6:00)可安排电动车充电、洗衣等灵活任务",
                "正午前后(11:00-14:00)光伏发电高峰，建议安排大功率电器使用",
                `${isWeekend ? '周末家庭活动较多，建议在光照充足时段集中使用电器' : '工作日白天用电少，适合将多余电量馈入电网获取补贴'}`,
                "电价高峰期(17:00-21:00)建议减少用电，特别是大功率电器的使用"
            ]
        ];
        
        // 修改第三组策略中的天气描述为中文
        strategyPointsVariants[2][0] = `${weatherCondition === 'sunny' ? '天气晴朗，阳光充足，光伏效率最佳' : 
                                        weatherCondition === 'cloudy' ? '天气多云，光伏发电仍较稳定' : 
                                        weatherCondition === 'overcast' ? '天气阴沉，光伏发电效率降低' :
                                        weatherCondition === 'rainy' ? '天气下雨，光伏发电受限明显' :
                                        weatherCondition === 'foggy' ? '天气有雾，光照减弱，发电效率下降' :
                                        '当前天气条件下，光伏发电效率受影响'}，合理安排用电计划`;
        
        // 额外的季节性建议
        const seasonalPoints = {
            'summer': [
                "夏季空调耗电大，建议在光伏高峰期预制冷房间，夜间调高温度设置",
                "遮阳窗帘可在阳光直射时拉上，减少室内温度，降低空调能耗",
                "冰箱温度适当调高1-2°C，可显著降低用电量"
            ],
            'winter': [
                "冬季采暖设备耗电大，建议在光照充足时段提前加热",
                "充分利用阳光直射窗户增加室内温度，减少采暖需求",
                "热水器建议在光伏发电高峰期使用，储存热水供晚间使用"
            ],
            'spring': [
                "春季天气多变，建议根据天气预报灵活调整用电计划",
                "自然通风可减少空调使用，在合适温度时打开窗户",
                "春季洗衣需求增加，建议集中在光照充足的中午时段"
            ],
            'autumn': [
                "秋季温度适宜，减少空调使用，降低用电需求",
                "日照时间缩短，建议提前安排需要自然光的活动",
                "早晚温差大，可能需要短时间加热，建议在光伏发电期间进行"
            ]
        };
        
        // 随机选择策略点集合
        let pointsIndex = Math.floor(Math.random() * strategyPointsVariants.length);
        let points = [...strategyPointsVariants[pointsIndex]];
        
        // 添加1-2个季节性建议
        if (seasonalPoints[season]) {
            const seasonalPointsArray = seasonalPoints[season];
            const shuffled = [...seasonalPointsArray].sort(() => 0.5 - Math.random());
            const count = 1 + Math.floor(Math.random() * 2); // 1-2个
            points = [...points, ...shuffled.slice(0, count)];
        }
        
        // 时段规划变体 - 基础结构保持不变，但细节有所不同
        const timeframeBaseData = [
            {
                timeRange: "00:00-06:00",
                type: "低谷时段",
                electricityPrice: "0.26",
                recommendedAppliances: ["ev-charging"]
            },
            {
                timeRange: "06:00-09:00",
                type: "平时段",
                electricityPrice: "0.38",
                recommendedAppliances: []
            },
            {
                timeRange: "09:00-11:00",
                type: "发电高峰",
                electricityPrice: "0.48",
                recommendedAppliances: ["washing-machine"]
            },
            {
                timeRange: "11:00-13:00",
                type: "发电高峰",
                electricityPrice: "0.48",
                recommendedAppliances: ["rice-cooker"]
            },
            {
                timeRange: "13:00-17:00",
                type: "发电高峰",
                electricityPrice: "0.48",
                recommendedAppliances: ["ac"]
            },
            {
                timeRange: "17:00-21:00",
                type: "用电高峰",
                electricityPrice: "0.56",
                recommendedAppliances: ["water-heater"]
            },
            {
                timeRange: "21:00-24:00",
                type: "低谷时段",
                electricityPrice: "0.26",
                recommendedAppliances: ["ev-charging"]
            }
        ];
        
        // 不同天气下的描述变体
        const weatherDescriptions = {
            'sunny': [
                "天气晴朗，阳光充足，光伏发电效率最佳。",
                "晴朗天气，太阳能板发电量充沛。",
                "日照强烈，光伏发电性能优异。"
            ],
            'cloudy': [
                "天气多云，光伏发电仍较稳定。",
                "云层有遮挡，光伏效率略有下降但仍可靠。",
                "阳光断续，发电量有所波动但依然可观。"
            ],
            'overcast': [
                "天气阴沉，光伏发电效率降低。",
                "光照弱，发电量有限，建议合理规划用电。",
                "阴天状况，太阳能转化率受限。"
            ],
            'rainy': [
                "雨天光照弱，光伏发电效率低下。",
                "降雨天气，光伏发电严重受限。",
                "雨水影响，发电量较少，建议节约用电。"
            ],
            'foggy': [
                "雾天减弱光照，光伏效率较低。",
                "雾气遮挡阳光，发电量明显下降。",
                "能见度低，太阳能转化受阻。"
            ]
        };
        
        // 各时段描述的变体
        const timeframeDescriptions = {
            "低谷时段": [
                "电网低谷时段，电价最低，适合电动车充电等大功率、灵活性用电。",
                "电价处于全天最低水平，适合安排非紧急的耗电设备运行。",
                "用电低谷，电网负荷小，电价优惠，是大功率电器的理想使用时间。"
            ],
            "平时段": [
                "光伏开始发电，但发电量仍较低，建议控制用电。",
                "早晨时段，光照逐渐增强，光伏系统开始发电，可使用少量电器。",
                "电价适中，光伏刚启动，适合必要的早晨用电需求。"
            ],
            "发电高峰": [
                "光伏发电量达到高峰，适合使用大功率电器。",
                "太阳能转化效率最高，建议集中安排耗电设备。",
                "光照强烈，发电量充沛，最适合安排各类家电使用。"
            ],
            "用电高峰": [
                "电网高峰期，电价最高，建议减少用电或使用储能电池。",
                "用电需求高峰，电网负荷大，建议避免使用大功率电器。",
                "电价较高，尽量避免非必要用电，使用前期储存的电能。"
            ]
        };
        
        // 为每个时段生成描述
        const timeframes = timeframeBaseData.map(tf => {
            // 基于天气选择描述
            let weatherDesc = "";
            if (weatherDescriptions[weatherCondition]) {
                const descList = weatherDescriptions[weatherCondition];
                weatherDesc = descList[Math.floor(Math.random() * descList.length)];
            }
            
            // 基于时段类型选择描述
            let timeDesc = "";
            if (timeframeDescriptions[tf.type]) {
                const descList = timeframeDescriptions[tf.type];
                timeDesc = descList[Math.floor(Math.random() * descList.length)];
            }
            
            // 组合描述 - 有时使用天气描述，有时不使用
            let finalDesc = "";
            if (Math.random() > 0.3 && weatherDesc && (tf.type === "发电高峰" || tf.type === "平时段")) {
                finalDesc = `${weatherDesc} ${timeDesc}`;
            } else {
                finalDesc = timeDesc;
            }
            
            // 电价微调
            let price = parseFloat(tf.electricityPrice);
            price += (Math.random() - 0.5) * 0.04; // 在±0.02范围内浮动
            
            return {
                ...tf,
                description: finalDesc,
                electricityPrice: price.toFixed(2)
            };
        });
        
        // 家电使用建议变体
        const applianceScheduleBase = [
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
        ];
        
        // 变化家电使用建议 - 添加或移除1-2个小时
        const applianceSchedule = applianceScheduleBase.map(schedule => {
            const hours = [...schedule.recommendedHours];
            
            // 随机决定是添加还是移除小时
            if (Math.random() > 0.5 && hours.length > 3) {
                // 移除1-2个小时
                const removeCount = Math.min(1 + Math.floor(Math.random() * 2), hours.length - 3);
                for (let i = 0; i < removeCount; i++) {
                    const indexToRemove = Math.floor(Math.random() * hours.length);
                    hours.splice(indexToRemove, 1);
                }
            } else {
                // 添加1-2个小时
                const possibleHours = Array.from({length: 24}, (_, i) => i)
                    .filter(h => !hours.includes(h));
                
                if (possibleHours.length > 0) {
                    const addCount = Math.min(1 + Math.floor(Math.random() * 2), possibleHours.length);
                    for (let i = 0; i < addCount; i++) {
                        const indexToAdd = Math.floor(Math.random() * possibleHours.length);
                        const hourToAdd = possibleHours[indexToAdd];
                        hours.push(hourToAdd);
                        possibleHours.splice(indexToAdd, 1);
                    }
                }
            }
            
            // 排序小时确保顺序一致
            hours.sort((a, b) => a - b);
            
            return {
                applianceId: schedule.applianceId,
                recommendedHours: hours
            };
        });
        
        // 返回组装好的数据
        return {
            strategy: {
                summary: summary,
                points: points
            },
            timeframes: timeframes,
            applianceSchedule: applianceSchedule
        };
    },
    
    /**
     * 获取智能用电建议
     * @param {Object} data 包含当前发电、用电、时间、天气等信息
     * @returns {Promise<Object>} 包含主要建议、推荐和延后使用的电器列表
     */
    getSmartPowerSuggestions: async function(data) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        try {
            // 天气英文转中文
            const weatherMap = {
                'sunny': '晴朗',
                'cloudy': '多云',
                'overcast': '阴天',
                'rainy': '雨天',
                'foggy': '雾天'
            };
            
            // 获取中文天气描述
            const weatherChinese = weatherMap[data.weather.condition] || data.weather.condition;
            
            // 根据当前数据生成智能建议
            const powerBalance = data.generation - data.consumption;
            const balanceRatio = data.generation / Math.max(0.1, data.consumption);
            
            let mainSuggestion = "";
            let reasoning = "";
            let recommended = [];
            let delayed = [];
            
            // 分析发电与用电平衡状态
            if (powerBalance > 1.5) {
                // 大量盈余电力情况
                mainSuggestion = "当前光伏发电充足，建议使用大功率电器，充分利用自产清洁能源！";
                reasoning = `分析：当前发电量(${data.generation}kW)远高于用电量(${data.consumption}kW)，剩余电力${powerBalance.toFixed(1)}kW。\n峰值电价时段：${data.priceLevel}，每度电${data.electricityPrice}元。\n天气状况：${weatherChinese}，气温${data.weather.temperature}℃，湿度${data.weather.humidity}%。\n建议立即使用高耗电家电，最大化自发自用收益。`;
                
                // 推荐使用的电器
                recommended = ['washing-machine', 'ev-charging', 'ac'];
                
                // 天气情况下可能不需要空调
                if (data.weather.condition !== 'sunny' && 
                    !(data.season === 'summer' && data.weather.temperature > 26) &&
                    !(data.season === 'winter' && data.weather.temperature < 10)) {
                    recommended = recommended.filter(item => item !== 'ac');
                }
            } 
            else if (balanceRatio > 0.8) {
                // 基本平衡的情况
                mainSuggestion = "光伏发电与家庭用电基本平衡，可以使用中小功率电器。";
                reasoning = `分析：当前发电量(${data.generation}kW)与用电量(${data.consumption}kW)基本平衡，发电满足了${(balanceRatio*100).toFixed(0)}%的用电需求。\n电价等级：${data.priceLevel}，每度电${data.electricityPrice}元。\n天气状况：${weatherChinese}，气温${data.weather.temperature}℃。\n适合使用中小功率电器，大功率电器建议错峰使用。`;
                
                // 根据季节和天气推荐合适的电器
                if (data.season === 'summer' && data.weather.temperature > 28) {
                    recommended = ['ac']; // 夏季高温优先推荐空调
                    delayed = ['washing-machine', 'ev-charging']; // 延后大功率设备
                } 
                else if (data.season === 'winter' && data.weather.temperature < 5) {
                    recommended = ['ac']; // 冬季低温优先推荐空调取暖
                    delayed = ['washing-machine', 'ev-charging'];
                }
                else {
                    recommended = ['washing-machine']; // 其他情况推荐洗衣机等中功率设备
                    delayed = ['ev-charging']; 
                    
                    // 是否需要空调
                    if ((data.season === 'summer' && data.weather.temperature > 26) ||
                        (data.season === 'winter' && data.weather.temperature < 10)) {
                        recommended.push('ac');
                    } else {
                        delayed.push('ac');
                    }
                }
            } 
            else {
                // 用电大于发电的情况
                mainSuggestion = "当前用电较多，光伏发电不足，建议推迟使用大功率电器或减少用电量。";
                reasoning = `分析：当前发电量(${data.generation}kW)低于用电量(${data.consumption}kW)，光伏仅能满足${(balanceRatio*100).toFixed(0)}%的用电需求。\n${data.electricityPrice > 0.45 ? "当前处于电价高峰期" : "当前电价适中"}，建议错峰用电。\n天气状况：${weatherChinese}，气温${data.weather.temperature}℃。\n建议减少不必要用电，等待光照更好时再使用大功率家电。`;
                
                // 根据情况推荐轻度用电
                recommended = [];
                
                // 必要时允许某些电器使用
                const currentHour = new Date().getHours();
                if (currentHour >= 18 && currentHour < 20) {
                    // 晚餐时间可能需要做饭
                    recommended.push('rice-cooker');
                }
                
                // 极端温度下允许使用空调
                if ((data.season === 'summer' && data.weather.temperature > 32) ||
                    (data.season === 'winter' && data.weather.temperature < 0)) {
                    recommended.push('ac');
                }
                
                // 建议延后使用的电器
                delayed = ['washing-machine', 'ev-charging', 'water-heater'];
                if (!recommended.includes('ac')) {
                    delayed.push('ac');
                }
                if (!recommended.includes('rice-cooker')) {
                    delayed.push('rice-cooker');
                }
            }
            
            return {
                mainSuggestion,
                reasoning,
                recommended,
                delayed
            };
        } catch (error) {
            console.error("AI分析出错:", error);
            // 返回一个基础建议作为回退方案
            return {
                mainSuggestion: "建议根据当前发电情况合理安排用电，提高自发自用比例。",
                reasoning: "由于分析服务暂时不可用，提供通用建议。",
                recommended: ['washing-machine'],
                delayed: ['ev-charging', 'water-heater']
            };
        }
    }
};