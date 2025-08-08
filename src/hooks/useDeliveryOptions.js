import { useState, useEffect } from 'react';

const useDeliveryOptions = () => {
    const DELIVERY_TIME_SLOTS = [
        { value: 'morning', label: '午前中 (8-12時)' },
        { value: 'afternoon', label: '14-16時' },
        { value: 'evening', label: '16-18時)' },
        { value: 'night', label: '18-21時)' }
    ];

    // 配送可能日リストのステート
    const [deliveryDates, setDeliveryDates] = useState([]);

    // コンポーネントマウント時に配送可能日を自動生成
    useEffect(() => {
        const dates = [];
        const today = new Date();

        // 今日から2日後から7日後までの日付を生成
        for (let i = 2; i <= 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            // 日曜日を除く (0は日曜日)
            if (date.getDay() !== 0) {
                dates.push({
                    value: date.toISOString().split('T')[0], // YYYY-MM-DD形式
                    label: `${date.getMonth() + 1}月${date.getDate()}日 (${['月', '火', '水', '木', '金', '土'][date.getDay() - 1]})` // 例: 8月1日 (木)
                });
            }
        }
        setDeliveryDates(dates);
    }, []); // 空の依存配列で、マウント時に一度だけ実行

    return { deliveryDates, DELIVERY_TIME_SLOTS };
};

export default useDeliveryOptions;
