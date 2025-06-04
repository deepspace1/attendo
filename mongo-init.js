
db = db.getSiblingDB('attender');

// Create collections with validation
db.createCollection('students', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'rollNumber', 'class'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Student name is required and must be a string'
        },
        rollNumber: {
          bsonType: 'string',
          description: 'Roll number is required and must be a string'
        },
        class: {
          bsonType: 'string',
          description: 'Class is required and must be a string'
        },
        barcodeId: {
          bsonType: 'string',
          description: 'Barcode ID must be a string'
        }
      }
    }
  }
});

db.createCollection('attendances', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['date', 'class', 'subject', 'teacher', 'records'],
      properties: {
        date: {
          bsonType: 'date',
          description: 'Date is required and must be a date'
        },
        class: {
          bsonType: 'string',
          description: 'Class is required and must be a string'
        },
        subject: {
          bsonType: 'string',
          description: 'Subject is required and must be a string'
        },
        teacher: {
          bsonType: 'string',
          description: 'Teacher is required and must be a string'
        },
        records: {
          bsonType: 'array',
          description: 'Records must be an array'
        }
      }
    }
  }
});

// Create indexes for better performance
db.students.createIndex({ rollNumber: 1 }, { unique: true });
db.students.createIndex({ class: 1 });
db.students.createIndex({ barcodeId: 1 }, { unique: true, sparse: true });

db.attendances.createIndex({ date: 1, class: 1, subject: 1 });
db.attendances.createIndex({ class: 1 });
db.attendances.createIndex({ date: 1 });

print('Database initialization completed successfully!');
