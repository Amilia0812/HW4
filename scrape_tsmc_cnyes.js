// 套件需求：npm install selenium-webdriver axios
const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const axios = require('axios');

(async function scrapeTSMC() {
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options()).build();
    try {
        await driver.get('https://www.cnyes.com/twstock/ps_historyprice.aspx?code=2330');

        // 等待表格載入（可根據網速調整）
        await driver.sleep(5000);

        const rows = await driver.findElements(By.css('table tr'));
        const results = [];

        for (let i = 1; i < rows.length; i++) {
            const cols = await rows[i].findElements(By.css('td'));
            if (cols.length >= 5) {
                const date = await cols[0].getText();       // 格式：2024/05/21
                const close = await cols[4].getText();      // 收盤價
                const data = {
                    date: formatDate(date),                   // 轉為 YYYY-MM-DD
                    item_name: '台積電',
                    price: parseFloat(close.replace(',', ''))
                };
                results.push(data);

                // 每筆 POST 到後端 API
                try {
                    await axios.post('http://localhost:5000/add_price', data);
                    console.log(`✔ 已寫入：${data.date} - ${data.price} 元`);
                } catch (err) {
                    console.error(`❌ 寫入失敗：${data.date}`, err.response?.data || err.message);
                }
            }
        }

        console.log('✅ 全部完成');

    } catch (err) {
        console.error('❌ 錯誤發生:', err);
    } finally {
        await driver.quit();
    }

    // 日期格式轉換：2024/05/21 → 2024-05-21
    function formatDate(raw) {
        return raw.replace(/\//g, '-');
    }
})();
