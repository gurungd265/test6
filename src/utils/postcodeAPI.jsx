export async function fetchJapanesePostalCode(lat, lon) {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'YourAppName/1.0 (your.email@example.com)', // Nominatim 정책상 필요
                'Accept-Language': 'ja', // 일본어 응답 선호
            },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        return data.address?.postcode || null;
    } catch (error) {
        console.error("Error fetching postal code:", error);
        return null;
    }
}
