/**
 * 数据管理器 - 提供光伏助手所需的各类数据
 * 使用单例模式确保数据一致性
 */
const DataManager = (function() {
    // 私有数据存储
    const _data = {
        // 发电数据
        generation: {
            today: {
                total: 26.8,
                peakPower: 5.2,
                co2Reduction: 18.6,
                income: 16.14,
                hourly: Array(24).fill(0).map((_, hour) => {
                    if (hour >= 6 && hour <= 18) {
                        // 白天时段有发电
                        const distFromNoon = Math.abs(12 - hour);
                        const noonFactor = Math.max(0, (6 - distFromNoon) / 6);
                        return parseFloat((noonFactor * 3 * (0.8 + Math.random() * 0.4)).toFixed(1));
                    }
                    return 0;
                })
            },
            yesterday: {
                total: 25.7,
                peakPower: 4.9,
                co2Reduction: 17.8,
                income: 15.42
            },
            thisMonth: {
                total: 621.3,
                income: 372.78
            },
            lastMonth: {
                total: 583.7,
                income: 350.22
            }
        },
        
        // 实时数据
        realtime: {
            currentPower: 4.7, // 当前发电功率 (kW)
            currentConsumption: 3.2, // 当前用电功率 (kW)
            gridImport: 0, // 从电网购电 (kW)
            gridExport: 1.5, // 向电网售电 (kW)
            batteryCharging: 0, // 电池充电功率 (kW)
            batteryDischarging: 0, // 电池放电功率 (kW)
            batteryLevel: 85, // 电池电量百分比
            lastUpdated: new Date().toISOString() // 最后更新时间
        },
        
        // 电价数据
        electricity: {
            current: {
                price: 0.48,
                type: "峰时段",
                timeRange: "11:00-16:00"
            },
            plan: {
                name: "居民分时电价",
                tiers: [
                    { timeRange: "00:00-06:00", price: 0.26, type: "低谷时段" },
                    { timeRange: "06:00-09:00", price: 0.38, type: "平时段" },
                    { timeRange: "09:00-17:00", price: 0.48, type: "峰时段" },
                    { timeRange: "17:00-21:00", price: 0.56, type: "高峰时段" },
                    { timeRange: "21:00-24:00", price: 0.26, type: "低谷时段" }
                ]
            }
        },
        
        // 天气数据
        weather: {
            current: {
                condition: "sunny",
                temperature: 28,
                humidity: 65,
                windSpeed: 3.2
            },
            forecast: [
                { date: "今天", condition: "sunny", high: 30, low: 22 },
                { date: "明天", condition: "cloudy", high: 28, low: 21 },
                { date: "后天", condition: "rainy", high: 25, low: 20 }
            ]
        },
        
        // 家电数据
        appliances: [
            {
                id: "washing-machine",
                name: "洗衣机",
                power: 800,
                status: "off",
                duration: 1.5,
                flexible: true
            },
            {
                id: "ev-charging",
                name: "电动车充电",
                power: 1500,
                status: "off",
                duration: 3,
                flexible: true
            },
            {
                id: "ac",
                name: "空调",
                power: 1200,
                status: "off",
                duration: 3,
                flexible: false
            },
            {
                id: "rice-cooker",
                name: "电饭煲",
                power: 1000,
                status: "off",
                duration: 1,
                flexible: false
            },
            {
                id: "water-heater",
                name: "热水器",
                power: 2000,
                status: "off",
                duration: 1,
                flexible: true
            }
        ]
    };
    
    // 事件监听器存储
    const _eventListeners = {
        dataUpdated: []
    };
    
    // 触发事件
    function _triggerEvent(eventName, data) {
        if (_eventListeners[eventName]) {
            _eventListeners[eventName].forEach(listener => listener(data));
            
            // 同时触发自定义事件，便于跨页面通信
            const event = new CustomEvent(eventName, { detail: data });
            window.dispatchEvent(event);
        }
    }
    
    // 数据存储与同步
    function _saveData() {
        // 将数据保存到本地存储，确保在不同页面间保持一致
        localStorage.setItem('pvAssistantData', JSON.stringify({
            generation: _data.generation,
            realtime: _data.realtime,
            electricity: _data.electricity,
            lastUpdated: new Date().toISOString()
        }));
    }
    
    // 尝试从本地存储加载数据
    function _loadData() {
        const savedData = localStorage.getItem('pvAssistantData');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                // 更新数据，但保留原始数据结构中可能没有保存的部分
                _data.generation = {..._data.generation, ...parsedData.generation};
                _data.realtime = {..._data.realtime, ...parsedData.realtime};
                _data.electricity = {..._data.electricity, ...parsedData.electricity};
                console.log("从本地存储加载了数据");
            } catch (e) {
                console.error("加载本地数据失败:", e);
            }
        }
    }
    
    // 尝试加载已保存的数据
    _loadData();
    
    // 定时保存数据以确保持久性
    setInterval(_saveData, 60000); // 每分钟保存一次数据
    
// 返回公共接口
return {
    // 获取今日发电数据
    getTodayGeneration: function() {
        return {..._data.generation.today};
    },
    
    // 获取昨日发电数据
    getYesterdayGeneration: function() {
        return {..._data.generation.yesterday};
    },
    
    // 获取本月发电数据
    getMonthGeneration: function() {
        return {..._data.generation.thisMonth};
    },
    
    // 获取上月发电数据
    getLastMonthGeneration: function() {
        return {..._data.generation.lastMonth};
    },
    
    // 获取小时发电数据
    getHourlyGeneration: function() {
        return [..._data.generation.today.hourly];
    },
    
    // 更新小时发电数据
    updateHourlyGeneration: function(hour, value) {
        if (hour >= 0 && hour < 24) {
            _data.generation.today.hourly[hour] = parseFloat(value);
            
            // 触发更新事件
            _triggerEvent('dataUpdated', { 
                type: 'hourlyGeneration',
                hour: hour,
                value: value
            });
        }
    },
    
    // 获取当前发电功率
    getCurrentPower: function() {
        return _data.realtime.currentPower;
    },
          
        // 设置当前用电功率
        setCurrentConsumption: function(value) {
            _data.realtime.currentConsumption = parseFloat(value);
            _data.realtime.lastUpdated = new Date().toISOString();
            
            // 更新发电与用电的平衡
            this.updatePowerBalance();
            
            // 触发更新事件
            _triggerEvent('dataUpdated', {type: 'consumption', value: value});
            
            // 保存数据
            _saveData();
        },
        
        // 更新电力平衡
        updatePowerBalance: function() {
            const balance = _data.realtime.currentPower - _data.realtime.currentConsumption;
            
            if (balance > 0) {
                // 有剩余电力
                _data.realtime.gridImport = 0;
                _data.realtime.gridExport = balance;
                
                // 如果电池未满且有剩余电力，可能会充电
                if (_data.realtime.batteryLevel < 100) {
                    // 根据实际情况决定充电量
                    const chargingPower = Math.min(balance, 3.0); // 假设最大充电功率3kW
                    _data.realtime.batteryCharging = chargingPower;
                    _data.realtime.gridExport = Math.max(0, balance - chargingPower);
                } else {
                    _data.realtime.batteryCharging = 0;
                }
                
                _data.realtime.batteryDischarging = 0;
            } else {
                // 电力不足
                _data.realtime.gridExport = 0;
                
                // 如果电池有电，可能会放电
                if (_data.realtime.batteryLevel > 10) {
                    // 根据实际情况决定放电量
                    const dischargingPower = Math.min(Math.abs(balance), 3.0); // 假设最大放电功率3kW
                    _data.realtime.batteryDischarging = dischargingPower;
                    _data.realtime.gridImport = Math.max(0, Math.abs(balance) - dischargingPower);
                } else {
                    _data.realtime.batteryDischarging = 0;
                    _data.realtime.gridImport = Math.abs(balance);
                }
                
                _data.realtime.batteryCharging = 0;
            }
            
            // 更新电池电量 (简化模拟)
            if (_data.realtime.batteryCharging > 0) {
                // 充电时电量增加
                _data.realtime.batteryLevel = Math.min(100, _data.realtime.batteryLevel + 0.05);
            } else if (_data.realtime.batteryDischarging > 0) {
                // 放电时电量减少
                _data.realtime.batteryLevel = Math.max(10, _data.realtime.batteryLevel - 0.08);
            }
        },
        
        // 获取当前电价信息
        getCurrentElectricityPrice: function() {
            return {..._data.electricity.current};
        },
        
        // 设置当前电价信息
        setCurrentElectricityPrice: function(price, type, timeRange) {
            _data.electricity.current = {
                price: price,
                type: type,
                timeRange: timeRange
            };
            
            // 触发更新事件
            _triggerEvent('dataUpdated', {type: 'electricityPrice'});
            
            // 保存数据
            _saveData();
        },
        
        // 获取电价计划
        getElectricityPricePlan: function() {
            return {..._data.electricity.plan};
        },
        
        // 获取当前天气
        getCurrentWeather: function() {
            return {..._data.weather.current};
        },
        
        // 设置当前天气
        setCurrentWeather: function(weather) {
            _data.weather.current = {...weather};
            
            // 触发更新事件
            _triggerEvent('dataUpdated', {type: 'weather'});
            
            // 保存数据
            _saveData();
        },
        
        // 获取天气预报
        getWeatherForecast: function() {
            return [..._data.weather.forecast];
        },
        
        // 获取所有家电列表
        getAllAppliances: function() {
            return [..._data.appliances];
        },
        
        // 获取特定家电信息
        getAppliance: function(id) {
            return {..._data.appliances.find(a => a.id === id)};
        },
        
        // 更新家电状态
        updateApplianceStatus: function(id, status) {
            const appliance = _data.appliances.find(a => a.id === id);
            if (appliance) {
                appliance.status = status;
                
                // 同步到localStorage以便其他页面可以读取
                localStorage.setItem(`appliance_${id}`, status);
                
                // 触发更新事件
                _triggerEvent('dataUpdated', {type: 'appliance', id: id, status: status});
                
                // 保存数据
                _saveData();
                
                return true;
            }
            return false;
        },
        
        // 添加事件监听器
        addEventListener: function(eventName, callback) {
            if (!_eventListeners[eventName]) {
                _eventListeners[eventName] = [];
            }
            _eventListeners[eventName].push(callback);
        },
        
        // 移除事件监听器
        removeEventListener: function(eventName, callback) {
            if (_eventListeners[eventName]) {
                _eventListeners[eventName] = _eventListeners[eventName].filter(
                    listener => listener !== callback
                );
            }
        },
        
   // 在 simulateDataUpdate 方法中添加

simulateDataUpdate: function() {
    // 模拟发电量变化
    const currentHour = new Date().getHours();
    
    // 白天时段有发电变化
    if (currentHour >= 6 && currentHour <= 18) {
        const distFromNoon = Math.abs(12 - currentHour);
        const noonFactor = Math.max(0, (6 - distFromNoon) / 6);
        const basePower = noonFactor * 5;
        const randomFactor = 0.9 + Math.random() * 0.2;
        
        // 计算当前发电功率
        const currentPower = parseFloat((basePower * randomFactor).toFixed(1));
        
        // 更新当前发电功率
        this.setCurrentPower(currentPower);
        
        // 更新小时发电数据 - 累加当前小时的发电量
        // 假设每分钟调用一次，将功率转换为1分钟的能量并累加
        const hourlyIncrement = currentPower * (1/60); // kW 转换为 kWh (按1分钟计)
        const currentHourlyValue = _data.generation.today.hourly[currentHour] || 0;
        this.updateHourlyGeneration(currentHour, parseFloat((currentHourlyValue + hourlyIncrement).toFixed(2)));
        
        // 更新今日总发电量
        _data.generation.today.total += hourlyIncrement;
        _data.generation.today.total = parseFloat(_data.generation.today.total.toFixed(1));
        
        // 根据发电量更新收益和减排量
        _data.generation.today.income = parseFloat((_data.generation.today.total * 0.6).toFixed(2));
        _data.generation.today.co2Reduction = parseFloat((_data.generation.today.total * 0.7).toFixed(1));
        
        // 更新峰值功率
        if (_data.realtime.currentPower > _data.generation.today.peakPower) {
            _data.generation.today.peakPower = parseFloat(_data.realtime.currentPower.toFixed(1));
        }
    } else {
        // 夜间几乎无发电
        this.setCurrentPower((Math.random() * 0.1).toFixed(1));
    }
            
            // 模拟用电量变化
            let basePower = 0.8; // 基础用电
            
            // 根据时间段调整用电量
            if (currentHour >= 6 && currentHour < 9) {
                basePower += 1.5; // 早晨高峰
            } else if (currentHour >= 11 && currentHour < 14) {
                basePower += 1.2; // 中午高峰
            } else if (currentHour >= 17 && currentHour < 22) {
                basePower += 2.0; // 晚间高峰
            } else if (currentHour >= 23 || currentHour < 5) {
                basePower += 0.3; // 深夜低谷
            }
            
            // 添加随机波动
            const randomConsumption = basePower * (0.9 + Math.random() * 0.2);
            this.setCurrentConsumption(randomConsumption.toFixed(1));
            
            // 更新电价信息
            this.updateElectricityPrice(currentHour);
            
            // 保存数据
            _saveData();
            
            // 触发全面更新事件
            _triggerEvent('dataUpdated', {type: 'simulation'});
        },
        
        // 更新电价信息
        updateElectricityPrice: function(hour) {
            const isWeekend = [0, 6].includes(new Date().getDay());
            
            let price, type, timeRange;
            
            if (isWeekend) {
                // 周末统一电价
                price = 0.38;
                type = "平时段";
                timeRange = "全天";
            } else {
                // 工作日分时电价
                if (hour >= 9 && hour < 17) {
                    price = 0.48;
                    type = "峰时段";
                    timeRange = `${hour}:00-${hour+1}:00`;
                } else if (hour >= 17 && hour < 21) {
                    price = 0.56;
                    type = "高峰时段";
                    timeRange = `${hour}:00-${hour+1}:00`;
                } else if (hour >= 21 || hour < 6) {
                    price = 0.26;
                    type = "低谷时段";
                    timeRange = hour >= 21 ? `${hour}:00-次日6:00` : `00:00-6:00`;
                } else {
                    price = 0.38;
                    type = "平时段";
                    timeRange = `${hour}:00-${hour+1}:00`;
                }
            }
            
            this.setCurrentElectricityPrice(price, type, timeRange);
        }
    };
})();

// 设置定时器以模拟数据更新
setInterval(function() {
    DataManager.simulateDataUpdate();
}, 60000); // 每分钟更新一次数据

// 初始调用一次以确保数据合理
DataManager.simulateDataUpdate();

// 如果页面刚加载，检查并加载家电状态
window.addEventListener('DOMContentLoaded', function() {
    // 同步家电状态
    const appliances = DataManager.getAllAppliances();
    appliances.forEach(appliance => {
        const storedStatus = localStorage.getItem(`appliance_${appliance.id}`);
        if (storedStatus) {
            // 更新DataManager内部状态
            DataManager.updateApplianceStatus(appliance.id, storedStatus);
        } else {
            // 如果没有存储状态，初始化
            localStorage.setItem(`appliance_${appliance.id}`, appliance.status);
        }
    });
});