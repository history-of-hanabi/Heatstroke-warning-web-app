document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'YOUR_API_KEY'; // ここにOpenWeatherMapのAPIキーを入力してください
    const temperatureElement = document.getElementById('temperature');
    const humidityElement = document.getElementById('humidity');
    const warningMessageElement = document.getElementById('warning-message');
    const adviceMessageElement = document.getElementById('advice-message');

    // 位置情報を取得し、気象情報を表示する関数
    function getWeather() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`;

                fetch(weatherApiUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        const temp = data.main.temp;
                        const humidity = data.main.humidity;

                        temperatureElement.textContent = temp.toFixed(1);
                        humidityElement.textContent = humidity;

                        updateHeatstrokeWarning(temp, humidity);
                    })
                    .catch(error => {
                        console.error('天気情報の取得に失敗しました:', error);
                        warningMessageElement.textContent = '天気情報の取得に失敗しました。';
                        warningMessageElement.className = 'message level-safe'; // エラー時も色をリセット
                    });
            }, error => {
                console.error('位置情報の取得に失敗しました:', error);
                warningMessageElement.textContent = '位置情報の取得を許可してください。';
                warningMessageElement.className = 'message level-safe'; // エラー時も色をリセット
            });
        } else {
            warningMessageElement.textContent = 'お使いのブラウザは位置情報に対応していません。';
            warningMessageElement.className = 'message level-safe'; // エラー時も色をリセット
        }
    }

    // 気温と湿度に基づいて警告メッセージを更新する関数
    function updateHeatstrokeWarning(temp, humidity) {
        let message = '';
        let levelClass = '';
        let advice = 'こまめな水分補給と休憩を心がけましょう。'; // 基本のアドバイス

        // 熱中症危険度の簡易判定ロジック
        // これはあくまで簡易的なもので、WBGT（暑さ指数）とは異なります。
        // WBGTに基づいたより正確な判断が必要な場合は、別途計算ロジックを組み込む必要があります。
        if (temp >= 35) {
            message = '危険！外出は控え、厳重に警戒してください！';
            levelClass = 'level-danger';
            advice = '絶対に無理せず、涼しい場所で安静にしてください。緊急の場合は医療機関へ。';
            vibratePhone();
        } else if (temp >= 31 && humidity >= 70) {
            message = '厳重警戒！熱中症の危険性が非常に高いです！';
            levelClass = 'level-danger';
            advice = '屋外での活動は避け、室内でもエアコンを使用しましょう。水分・塩分補給を忘れずに。';
            vibratePhone();
        } else if (temp >= 28 && humidity >= 60) {
            message = '警戒！熱中症に注意が必要です。';
            levelClass = 'level-warning';
            advice = '無理のない範囲で活動し、積極的に水分・塩分を補給しましょう。';
        } else if (temp >= 25) {
            message = '注意！熱中症に気をつけてください。';
            levelClass = 'level-caution';
            advice = '適度な休憩と水分補給を心がけましょう。';
        } else {
            message = '熱中症の危険性は低めです。';
            levelClass = 'level-safe';
            advice = '引き続き水分補給は行いましょう。';
        }

        warningMessageElement.textContent = message;
        warningMessageElement.className = `message ${levelClass}`; // クラスを更新
        adviceMessageElement.textContent = advice;
    }

    // スマートフォンでのバイブレーション（Web標準API）
    function vibratePhone() {
        if ("vibrate" in navigator) {
            // 短いバイブレーションを2回
            navigator.vibrate([200, 100, 200]);
            // 視覚的なフィードバックとして、一時的にクラスを追加してアニメーション
            warningMessageElement.classList.add('vibrate-effect');
            setTimeout(() => {
                warningMessageElement.classList.remove('vibrate-effect');
            }, 1000); // 1秒後にアニメーションを停止
        }
    }

    // アプリ起動時に一度だけ気象情報を取得
    getWeather();
});
