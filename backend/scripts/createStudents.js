const mongoose = require('mongoose');
require('dotenv').config();
const Student = require('../models/Student');

const students = [
    {
        rollNumber: "22cs078",
        name: "John Doe",
        class: "CSE-2",
        barcodeId: "22cs078"
    },
    {
        rollNumber: "22cs079",
        name: "Jane Smith",
        class: "CSE-2",
        barcodeId: "22cs079"
    },
    {
        rollNumber: "22cs080",
        name: "Mike Johnson",
        class: "CSE-2",
        barcodeId: "22cs080"
    },
    {
        rollNumber: "22cs081",
        name: "Sarah Williams",
        class: "CSE-2",
        barcodeId: "22cs081"
    },
    {
        rollNumber: "22cs082",
        name: "David Brown",
        class: "CSE-2",
        barcodeId: "22cs082"
    },
    {
        rollNumber: "22cs083",
        name: "Emily Davis",
        class: "CSE-2",
        barcodeId: "22cs083"
    },
    {
        rollNumber: "22cs084",
        name: "James Wilson",
        class: "CSE-2",
        barcodeId: "22cs084"
    },
    {
        rollNumber: "22cs085",
        name: "Lisa Anderson",
        class: "CSE-2",
        barcodeId: "22cs085"
    },
    // Adding more students
    {
        rollNumber: "22cs086",
        name: "Alex Turner",
        class: "CSE-2",
        barcodeId: "22cs086"
    },
    {
        rollNumber: "22cs087",
        name: "Emma Wilson",
        class: "CSE-2",
        barcodeId: "22cs087"
    },
    {
        rollNumber: "22cs088",
        name: "Ryan Cooper",
        class: "CSE-2",
        barcodeId: "22cs088"
    },
    {
        rollNumber: "22cs089",
        name: "Sophia Lee",
        class: "CSE-2",
        barcodeId: "22cs089"
    },
    {
        rollNumber: "22cs090",
        name: "Daniel Kim",
        class: "CSE-2",
        barcodeId: "22cs090"
    }
];

async function createStudents() {
    try {
        // Connect to MongoDB using 'attender' database
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attend';
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB attender database');

        // Drop the collection to start fresh
        await mongoose.connection.collection('students').drop().catch(err => {
            if (err.code !== 26) { // Ignore error if collection doesn't exist
                throw err;
            }
        });
        console.log('Dropped existing students collection');

        // Insert students one by one
        for (const student of students) {
            const newStudent = new Student(student);
            await newStudent.save();
            console.log(`Added: ${student.name} (${student.rollNumber})`);
        }

        console.log('\n✅ DONE: Successfully added all students to test database!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

createStudents(); 