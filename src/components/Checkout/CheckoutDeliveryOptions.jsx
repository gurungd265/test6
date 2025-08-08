import React from 'react';

export default function CheckoutDeliveryOptions({ formData, handleChange, deliveryDates, DELIVERY_TIME_SLOTS }) {
    return (
        <section className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">配送オプション</h2>

            <div className="mb-4">
                <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-1">お届け日</label>
                <select
                    id="deliveryDate"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">指定なし</option>
                    {deliveryDates.map(date => (
                        <option key={date.value} value={date.value}>{date.label}</option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700 mb-1">お届け時間帯</label>
                <select
                    id="deliveryTime"
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">指定なし</option>
                    {DELIVERY_TIME_SLOTS.map(slot => (
                        <option key={slot.value} value={slot.value}>{slot.label}</option>
                    ))}
                </select>
            </div>
        </section>
    );
}
