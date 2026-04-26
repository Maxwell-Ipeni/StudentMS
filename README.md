# Student Management System

A production-ready Student Management System built with PHP, MySQL, and React.

## Features

- **Authentication**: Secure JWT-based authentication with admin login
- **Student Management**: Create, read, update, delete students with full CRUD operations
- **Class Management**: Manage classes, sections, and capacity
- **Dashboard**: Analytics with charts, statistics, and recent admissions
- **Responsive Design**: Mobile-friendly interface with Bootstrap 5

## Tech Stack

- **Backend**: PHP 7.4+ with PDO for MySQL
- **Frontend**: React 18 with Bootstrap 5
- **Database**: MySQL 5.7+
- **Authentication**: JWT (JSON Web Tokens)
- **Charts**: Recharts
- **HTTP Client**: Axios

## Directory Structure

```
StudentMS/
├── backend/
│   ├── api/
│   │   └── index.php          # API Router
│   ├── config/
│   │   └── database.php       # Database configuration
│   ├── controllers/
│   │   ├── Auth.php          # Authentication controller
│   │   ├── Student.php       # Student CRUD controller
│   │   ├── Class.php         # Class CRUD controller
│   │   └── Dashboard.php     # Dashboard analytics controller
│   ├── utils/
│   │   ├── Response.php      # API response handler
│   │   └── JWT.php           # JWT token handler
│   └── .htaccess             # Apache rewrite rules
├── database/
│   └── schema.sql            # Database schema with sample data
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── contexts/         # React contexts
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service files
│   │   └── styles/           # Custom CSS
│   └── package.json
└── README.md
```

## Prerequisites

- XAMPP/WAMP/MAMP installed (Apache + MySQL + PHP)
- Node.js 16+ and npm
- PHP 7.4 or higher
- MySQL 5.7 or higher

## Setup Instructions

### Step 1: Clone or Copy Project

Copy the project folder to your XAMPP htdocs directory:
```bash
# On Linux/Mac
sudo cp -r StudentMS /opt/lampp/htdocs/

# On Windows
# Copy to C:\xampp\htdocs\
```

### Step 2: Set Up Database

1. Start XAMPP (Apache and MySQL services)

2. Open phpMyAdmin: http://localhost/phpmyadmin

3. Create a new database:
   - Database name: `student_management_system`
   - Collation: `utf8mb4_unicode_ci`

4. Import the schema:
   - Click on the database
   - Go to "Import" tab
   - Select `/opt/lampp/htdocs/StudentMS/database/schema.sql`
   - Click "Go"

### Step 3: Configure Backend

1. Update database credentials (if needed):
   - File: `/opt/lampp/htdocs/StudentMS/backend/config/database.php`
   - Default: username: `root`, password: `` (empty), database: `student_management_system`

2. Enable Apache mod_rewrite:
   - Open `/opt/lampp/etc/httpd.conf`
   - Find and uncomment: `LoadModule rewrite_module modules/mod_rewrite.so`
   - Restart Apache

3. Update Apache configuration to allow .htaccess:
   - In httpd.conf, find `<Directory "/opt/lampp/htdocs">`
   - Change `AllowOverride None` to `AllowOverride All`
   - Restart Apache

### Step 4: Set Up Frontend

1. Navigate to frontend directory:
```bash
cd /opt/lampp/htdocs/StudentMS/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in `/opt/lampp/htdocs/StudentMS/frontend/src/services/api.js`:
```javascript
const API_URL = 'http://localhost/StudentMS/backend/api';
```

### Step 5: Run the Application

1. Start the frontend development server:
```bash
cd /opt/lampp/htdocs/StudentMS/frontend
npm start
```

The React app will run on `http://localhost:3000`

2. Access the API:
- API Base URL: `http://localhost/StudentMS/backend/api`
- Test: `http://localhost/StudentMS/backend/api/`

### Step 6: Login

- **URL**: `http://localhost:3000`
- **Username**: `admin`
- **Password**: `admin123`

## API Endpoints

### Authentication
- `POST /api/login` - Login user
- `GET /api/verify` - Verify token
- `GET /api/profile` - Get user profile

### Students
- `GET /api/students` - List all students (with pagination, search, filters)
- `POST /api/students` - Create student
- `GET /api/students/{id}` - Get student details
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student

### Classes
- `GET /api/classes` - List all classes
- `POST /api/classes` - Create class
- `GET /api/classes/{id}` - Get class details
- `PUT /api/classes/{id}` - Update class
- `DELETE /api/classes/{id}` - Delete class

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics
- `GET /api/dashboard/quick-stats` - Get quick stats

## Security Features

- JWT-based authentication
- Prepared SQL statements (PDO)
- Input sanitization
- CORS configuration
- Password hashing with bcrypt
- Token expiration handling

## Development

### Adding New API Endpoint

1. Create controller method in `/backend/controllers/`
2. Add route in `/backend/api/index.php`
3. Test with Postman or curl

### Adding New Frontend Page

1. Create component in `/frontend/src/pages/`
2. Add route in `/frontend/src/App.js`
3. Add navigation link in Sidebar

## Troubleshooting

### "Access-Control-Allow-Origin" Error
- Check `.htaccess` CORS headers
- Verify API URL in frontend
- Ensure Apache mod_headers is enabled

### "Database connection failed"
- Check database credentials
- Verify MySQL service is running
- Confirm database exists

### "404 Not Found" on API calls
- Check Apache mod_rewrite is enabled
- Verify .htaccess file exists
- Confirm AllowOverride is set to All

### Login fails
- Check database imported correctly
- Verify users table has admin user
- Clear browser localStorage

### Frontend build errors
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

## Production Deployment

### Backend
1. Set strong database passwords
2. Change JWT secret key in `utils/JWT.php`
3. Enable HTTPS
4. Set up proper error logging
5. Configure database connection pooling

### Frontend
1. Build for production:
```bash
cd frontend
npm run build
```

2. Deploy contents of `build/` folder to web server

3. Configure API URL environment variable

## Default Credentials

- **Admin User**: username: `admin`, password: `admin123`
- **Database**: root / (empty password)

## License

MIT License - feel free to use for personal or commercial projects.

## Support

For issues or questions:
1. Check troubleshooting section
2. Review Apache and PHP error logs
3. Verify XAMPP configuration

---

Built with ❤️ using PHP, MySQL, and React
