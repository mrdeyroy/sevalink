import axios from "axios";

/**
 * Utility to send SMS via Fast2SMS API
 * @param {string} mobile - Recipient 10-digit mobile number
 * @param {string} message - Message body text
 * @returns {Promise<any>}
 */
const sendSMS = async (mobile, message) => {
    const apiKey = process.env.FAST2SMS_API_KEY;

    // Failsafe check
    if (!apiKey || apiKey === "YOUR_KEY_HERE") {
        throw new Error("FAST2SMS_API_KEY is not configured.");
    }

    try {
        const response = await axios.post(
            "https://www.fast2sms.com/dev/bulkV2",
            {
                route: "v3",
                sender_id: "TXTIND",
                message: message,
                language: "english",
                flash: 0,
                numbers: mobile,
            },
            {
                headers: {
                    authorization: apiKey,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.data || !response.data.return) {
            throw new Error(`API returned an unexpected response: ${JSON.stringify(response.data)}`);
        }

        return response.data;
    } catch (error) {
        // Axios error response
        if (error.response && error.response.data) {
            console.error("Fast2SMS API Error Response:", error.response.data);
            throw new Error(`Fast2SMS Error: ${error.response.data.message || 'Unknown error'}`);
        }

        // Generic or network error
        throw error;
    }
};

export default sendSMS;
