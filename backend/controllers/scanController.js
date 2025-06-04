exports.receiveScanCode = async (req, res) => {
    try {
        const { scanCode } = req.body;
        if (!scanCode) {
            return res.status(400).json({ message: 'scanCode is required' });
        }

        // For now, just log the scan code. You can extend this to save to DB or other processing.
        console.log('Received scan code:', scanCode);

        res.status(200).json({ message: 'Scan code received successfully', scanCode });
    } catch (error) {
        console.error('Error in receiveScanCode:', error);
        res.status(500).json({ message: error.message });
    }
};
