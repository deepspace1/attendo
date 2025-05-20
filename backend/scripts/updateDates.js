const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/attender', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function updateDates() {
  try {
    // Get all attendance records
    const records = await Attendance.find({});
    console.log(`Found ${records.length} records to update`);

    // Update each record
    for (const record of records) {
      // Set hours, minutes, seconds, and milliseconds to 0
      const date = new Date(record.date);
      date.setHours(0, 0, 0, 0);
      
      // Update the record
      await Attendance.findByIdAndUpdate(record._id, { date });
      console.log(`Updated record ${record._id} with date ${date.toISOString()}`);
    }

    console.log('✅ All records updated successfully!');

  } catch (error) {
    console.error('Error updating records:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
updateDates(); 