const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store in memory temporarily
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG, JPG, and JPEG files are allowed'));
    }
  }
});
// Helper function to ensure directory exists
const ensureDirectoryExists = async (dirPath) => {
    try {
      await fs.access(dirPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.mkdir(dirPath, { recursive: true });
      } else {
        throw error;
      }
    }
  };

// Validate environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT', 'SERVER_PORT'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create connection pool instead of single connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false, // For Aiven, you might need this
    // or better yet, download and use the CA certificate
  },
  connectTimeout: 60000, // 60 seconds
  acquireTimeout: 60000,
  timeout: 60000,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
// Convert pool to use promises
const promisePool = pool.promise();

// Test connection with async/await
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('Successfully connected to MySQL database');
    connection.release();
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }
};

// Call the connection test
testConnection();

// Helper function to format user data
const formatUser = (user) => ({
  id: user.id,
  fullName: user.fullName,
  picture: user.picture ,
  email: user.email,
  studentId: user.studentId,
  program: user.program,
  level: user.level,
  gpa: user.gpa,
  status: user.status,
  session: user.session,
  department: user.department,
  faculty: user.faculty,
  advisor: user.advisor,
  timeIn:user.timeIn
});

const formatLogWithUser = (logData) => ({
  logId: logData.log_id,
  userId: logData.user_id,
  timeIn: logData.timeIn,
  id: logData.user_id, 
  fullName: logData.fullName,
  picture: logData.picture,
  email: logData.email,
  studentId: logData.studentId,
  program: logData.program,
  level: logData.level,
  gpa: logData.gpa,
  status: logData.status,
  session: logData.session,
  department: logData.department,
  faculty: logData.faculty,
  advisor: logData.advisor
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    console.log('API /api/users route hit');
    const [rows] = await promisePool.query(`
      SELECT 
        id, fullName, picture, email, studentId, program, level, gpa,
        status, session, department, faculty, advisor, timeIn
      FROM users
    `);

    // Filter out users whose fullName is Admin, Teacher, or Principal (case-insensitive)
    // const filteredRows = rows.filter(
    //   user =>
    //     !["00", "11", "22"].includes(
    //       (user.studentId || "").toLowerCase()
    //     )
    // );

    console.log('users retreived:', rows);
    const formattedUsers = rows.map(formatUser);
    console.log('return after formating:', formattedUsers);
    res.json(formattedUsers);
    // const formattedUsers = filteredRows.map(formatUser);
    // res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all users
app.get('/api/logs', async (req, res) => {
  try {
    const [rawLogsData] = await promisePool.query(`
      SELECT 
          l.id as log_id,
          l.user_id,
          l.timeIn,
          u.fullName,
          u.picture,
          u.email,
          u.studentId,
          u.program,
          u.level,
          u.gpa,
          u.status,
          u.session,
          u.department,
          u.faculty,
          u.advisor
      FROM logs l
      INNER JOIN users u ON l.user_id = u.id
      ORDER BY l.timeIn DESC;
    `);

    // const formattedUsers = rows.map(formatUser);
    const formattedLogs = rawLogsData.map(formatLogWithUser);
    res.json(formattedLogs);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT 
        id, fullName, picture, email, studentId, program, level, gpa,
        status, session, department, faculty, advisor
      FROM users 
      WHERE id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const formattedUser = formatUser(rows[0]);
    res.json(formattedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

//#region Add User with Git Operations
/*
// Add a new user
app.post('/api/addusers', upload.single('file'), async (req, res) => {
  try {
    console.log("Starting to add a user with file upload");
    
    // Parse user data from form data
    let userData;
    try {
      userData = JSON.parse(req.body.userData);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid user data format' });
    }
    
    const {
      id,
      fullName,
      picture,
      email,
      studentId,
      program,
      level,
      gpa,
      status = 'active',
      session,
      department,
      faculty,
      advisor,
      type = 'CUSTOM'
    } = userData;

    console.log('Request data:', userData);
    console.log('File info:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file uploaded');


    // Validate required fields
    if (!fullName) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    // Handle file upload if file is provided
    let picturePath = null;
    if (req.file) {
      try {
        // Create user directory path
        const userDir = path.join(__dirname, '..', 'public', 'temp-accounts', id);
        await ensureDirectoryExists(userDir);
        
        // Get file extension
        const fileExtension = path.extname(req.file.originalname);
        const fileBaseName = path.basename(req.file.originalname, fileExtension);
        //const fileName = `1${fileExtension}`; // Always save as 1.jpg, 1.png, etc.
        const fileName = req.file.originalname;
        const filePath = path.join(userDir, fileName);
        
        // Save file to disk
        await fs.writeFile(filePath, req.file.buffer);
        
        // Set picture path for database (relative path)
        picturePath = `/temp-accounts/${id}/${fileName}`;
        
        console.log(`File saved to: ${filePath}`);
        console.log(`Database picture path: ${picturePath}`);


        
        // Run git pull, then add, commit, and push
        const { exec } = require('child_process');
        const repoRoot = path.join(__dirname, '..');
        
        // Sequential git operations with proper error handling
        const gitOperations = async () => {
          return new Promise((resolve, reject) => {
            // First pull to sync with remote
            exec(`cd "${repoRoot}" && git pull origin main`, (pullErr, pullStdout, pullStderr) => {
              if (pullErr) {
                console.error('Git pull failed:', pullErr);
                // Continue anyway - might be first push
              }
              
              // Then add, commit and push
              exec(
                `cd "${repoRoot}" && git add public/temp-accounts && git commit -m "added another image" && git push origin main`,
                (pushErr, pushStdout, pushStderr) => {
                  if (pushErr) {
                    console.error('Git push failed:', pushErr);
                    exec(
                      `cd "${repoRoot}" && git push origin main --force`,
                      (forceErr, forceStdout, forceStderr) => {
                        if (forceErr) {
                          console.error('Force push also failed:', forceErr);
                          reject(forceErr);
                        } else {
                          console.log('Force push successful:', forceStdout);
                          resolve(forceStdout);
                        }
                      }
                    );
                  } else {
                    console.log('Git operations successful:', pushStdout);
                    resolve(pushStdout);
                  }
                }
              );
            });
          });
        };
  
        // Run git operations asynchronously (don't block the API response)
        gitOperations().catch(err => {
          console.error('All git operations failed:', err);
        });
        
        
      } catch (fileError) {
        console.error('Error saving file:', fileError);
        return res.status(500).json({ error: 'Failed to save uploaded file' });
      } 
    }
    console.log(`Confirming Database picture path: ${picturePath}`);
    const finalStudentId = studentId || id;
    
    console.log('Inserting user with data:', {
      id, fullName, picture:picturePath, email, studentId: finalStudentId,
      program, level, gpa, status, session, department, faculty, advisor
    });
    
    // Insert the new user
    const [result] = await promisePool.query(`
      INSERT INTO users (
        id, fullName, picture, email, studentId, program, level, gpa,
        status, session, department, faculty, advisor, timeIn
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          id,
          fullName,
      picturePath,
      email || null,
      finalStudentId,
      program || null,
      level || null,
      gpa || null,
      status,
      session || null,
      department || null,
      faculty || null,
      advisor || null,
      new Date()
    ]);

    console.log('User inserted successfully, insertId:', result.insertId);

    // Fetch the newly created user
    const [rows] = await promisePool.query(`
      SELECT id, fullName, picture, email, studentId, program, level, 
      gpa, status, session, department, faculty, advisor, timeIn
      FROM users WHERE id = ?
      `, [id]); // Use the provided id, not insertId since you're using custom IDs
      
      if (rows.length === 0) {
        return res.status(500).json({ error: 'Failed to retrieve created user' });
      }
      
      // Format and return the created user
      const createdUser = {
        ...formatUser(rows[0]),
        type,
        timeIn: rows[0].timeIn
    };

    console.log('User created successfully:', createdUser);
    res.status(201).json(createdUser);
    
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle specific database errors
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        error: 'User with this information already exists',
        details: error.sqlMessage 
      });
    }
    // Clean up uploaded file if database operation failed
    if (req.file && req.body.userData) {
      try {
        const userData = JSON.parse(req.body.userData);
        const userDir = path.join(__dirname, '..', 'temp-accounts', userData.id);
        await fs.rmdir(userDir, { recursive: true });
      } catch (cleanupError) {
        console.error('Error cleaning up failed upload:', cleanupError);
      }
    }
    
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size too large (max 5MB)' });
      }
      return res.status(400).json({ error: `File upload error: ${error.message}` });
    }
    
    
    if (error.code === 'ER_BAD_NULL_ERROR') {
      return res.status(400).json({ 
        error: 'Missing required field',
        details: error.sqlMessage 
      });
    }
    
    res.status(500).json({ error: 'Failed to create user' });
  }
});
*/
//#endregion

app.post('/api/addusers', upload.single('file'), async (req, res) => {
  try {
    console.log("Starting to add a user with file upload");

    // Parse user data from form data
    let userData;
    try {
      userData = JSON.parse(req.body.userData);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid user data format' });
    }

    const {
      id,
      fullName,
      picture,
      email,
      studentId,
      program,
      level,
      gpa,
      status = 'active',
      session,
      department,
      faculty,
      advisor,
      type = 'CUSTOM'
    } = userData;

    console.log('Request data:', userData);
    console.log('File info:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file uploaded');

    // Validate required fields
    if (!fullName) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    // Handle file upload if file is provided
    let picturePath = null;
    if (req.file) {
      try {
        // Create user directory path in public/uploads instead of temp-accounts
        const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'users', id);
        await ensureDirectoryExists(uploadsDir);

        // Get file extension and create unique filename
        const fileExtension = path.extname(req.file.originalname);
        const timestamp = Date.now();
        const fileName = `profile_${timestamp}${fileExtension}`;
        const filePath = path.join(uploadsDir, fileName);

        // Save file to disk
        await fs.writeFile(filePath, req.file.buffer);

        // Set picture path for database (relative path that web server can serve)
        picturePath = `/uploads/users/${id}/${fileName}`;

        console.log(`File saved to: ${filePath}`);
        console.log(`Database picture path: ${picturePath}`);

        // Optional: Clean up old profile pictures for this user
        // This prevents accumulation of old profile images
        try {
          const files = await fs.readdir(uploadsDir);
          const oldFiles = files.filter(file => 
            file.startsWith('profile_') && file !== fileName
          );
          
          for (const oldFile of oldFiles) {
            const oldFilePath = path.join(uploadsDir, oldFile);
            await fs.unlink(oldFilePath);
            console.log(`Cleaned up old file: ${oldFilePath}`);
          }
        } catch (cleanupError) {
          console.warn('Warning: Could not clean up old files:', cleanupError);
          // Don't fail the request if cleanup fails
        }

      } catch (fileError) {
        console.error('Error saving file:', fileError);
        return res.status(500).json({ error: 'Failed to save uploaded file' });
      } 
    }

    console.log(`Confirming Database picture path: ${picturePath}`);
    const finalStudentId = studentId || id;

    console.log('Inserting user with data:', {
      id, fullName, picture: picturePath, email, studentId: finalStudentId,
      program, level, gpa, status, session, department, faculty, advisor
    });

    // Insert the new user
    const [result] = await promisePool.query(`
      INSERT INTO users (
        id, fullName, picture, email, studentId, program, level, gpa,
        status, session, department, faculty, advisor, timeIn
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      fullName,
      picturePath,
      email || null,
      finalStudentId,
      program || null,
      level || null,
      gpa || null,
      status,
      session || null,
      department || null,
      faculty || null,
      advisor || null,
      new Date()
    ]);

    console.log('User inserted successfully, insertId:', result.insertId);

    // Fetch the newly created user
    const [rows] = await promisePool.query(`
      SELECT id, fullName, picture, email, studentId, program, level, 
             gpa, status, session, department, faculty, advisor, timeIn
      FROM users WHERE id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(500).json({ error: 'Failed to retrieve created user' });
    }

    // Format and return the created user
    const createdUser = {
      ...formatUser(rows[0]),
      type,
      timeIn: rows[0].timeIn
    };

    console.log('User created successfully:', createdUser);
    res.status(201).json(createdUser);

  } catch (error) {
    console.error('Error creating user:', error);

    // Handle specific database errors
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        error: 'User with this information already exists',
        details: error.sqlMessage 
      });
    }

    // Clean up uploaded file if database operation failed
    if (req.file && req.body.userData) {
      try {
        const userData = JSON.parse(req.body.userData);
        const userDir = path.join(__dirname, '..', 'public', 'uploads', 'users', userData.id);
        await fs.rmdir(userDir, { recursive: true });
        console.log('Cleaned up failed upload directory:', userDir);
      } catch (cleanupError) {
        console.error('Error cleaning up failed upload:', cleanupError);
      }
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size too large (max 5MB)' });
      }
      return res.status(400).json({ error: `File upload error: ${error.message}` });
    }

    if (error.code === 'ER_BAD_NULL_ERROR') {
      return res.status(400).json({ 
        error: 'Missing required field',
        details: error.sqlMessage 
      });
    }

    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Add a new log
app.post('/api/addlog', async (req, res) => {
  try {
    console.log("Starting to add log entry");
    
    // Parse request data
    const { user_id } = req.body;
    
    console.log('Request data:', { user_id });
    
    // Validate required fields
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Check if user exists
    const [userCheck] = await promisePool.query(
      'SELECT id FROM users WHERE id = ?',
      [user_id]
    );
    
    if (userCheck.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User exists, proceeding with log insertion');
    
    // Insert the new log entry (timeIn will be auto-generated)
    const [result] = await promisePool.query(`
      INSERT INTO logs (user_id, timeIn) 
      VALUES (?, CURRENT_TIMESTAMP)
    `, [user_id]);
    
    console.log('Log inserted successfully, insertId:', result.insertId);
    
    // Fetch the newly created log with user data
    const [rows] = await promisePool.query(`
      SELECT 
        l.id as log_id,
        l.user_id,
        l.timeIn,
        u.fullName,
        u.picture,
        u.email,
        u.studentId,
        u.program,
        u.level,
        u.gpa,
        u.status,
        u.session,
        u.department,
        u.faculty,
        u.advisor
      FROM logs l
      INNER JOIN users u ON l.user_id = u.id
      WHERE l.id = ?
    `, [result.insertId]);
    
    if (rows.length === 0) {
      return res.status(500).json({ error: 'Failed to retrieve created log entry' });
    }
    
    // Format and return the created log with user data
    const createdLog = formatLogWithUser(rows[0]);
    
    console.log('Log created successfully:', createdLog);
    res.status(201).json(createdLog);
    
  } catch (error) {
    console.error('Error creating log:', error);
    
    // Handle specific database errors
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        error: 'Invalid user ID - user does not exist',
        details: error.sqlMessage
      });
    }
    
    if (error.code === 'ER_BAD_NULL_ERROR') {
      return res.status(400).json({
        error: 'Missing required field',
        details: error.sqlMessage
      });
    }
    
    res.status(500).json({ error: 'Failed to create log entry' });
  }
});

// Optional: Add update user endpoint
app.put('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const updateFields = req.body;
    
    // Remove fields that shouldn't be updated
    delete updateFields.id;
    delete updateFields.timeIn;
    
    // Build dynamic update query
    const fields = Object.keys(updateFields);
    const values = Object.values(updateFields);
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    const [result] = await promisePool.query(`
      UPDATE users SET ${setClause} WHERE id = ?
    `, [...values, userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Fetch and return updated user
    const [rows] = await promisePool.query(`
      SELECT id, fullName, picture, email, studentId, program, level, 
             gpa, status, session, department, faculty, advisor
      FROM users WHERE id = ?
    `, [userId]);
    
    const updatedUser = formatUser(rows[0]);
    res.json(updatedUser);
    
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Optional: Add delete user endpoint
app.delete('/api/users/:id', async (req, res) => {
  try {
    const [result] = await promisePool.query(
      'DELETE FROM users WHERE id = ?', 
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.SERVER_PORT || 9999;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));