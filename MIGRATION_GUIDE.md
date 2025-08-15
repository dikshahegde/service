# Migration Guide: Node.js/MongoDB → Java/PostgreSQL

This guide will help you migrate from the Node.js backend with MongoDB to the new Java Spring Boot backend with PostgreSQL.

## 🎯 Overview

### What's Changing
- **Backend**: Node.js/Express → Java Spring Boot
- **Database**: MongoDB → PostgreSQL
- **Authentication**: Same JWT approach but different implementation
- **API**: Same endpoints and response format (compatible with React frontend)

### What's Staying the Same
- **Frontend**: React app remains unchanged (except API base URL)
- **API Endpoints**: All endpoints maintain the same structure
- **Response Format**: JSON responses have identical structure
- **Authentication Flow**: JWT tokens work the same way

## 📋 Prerequisites

### Software Requirements
- **Java 17 or higher**
- **Maven 3.6+**
- **PostgreSQL 12+**
- Existing Node.js/React app

## 🗄️ Database Migration

### Step 1: Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# Download and install from https://www.postgresql.org/download/windows/
```

### Step 2: Create PostgreSQL Database
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database and user
CREATE DATABASE cafehub;
CREATE USER cafehub_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE cafehub TO cafehub_user;

-- Exit psql
\q
```

### Step 3: Data Migration Script
Create a Node.js script to export MongoDB data and convert to PostgreSQL format:

```javascript
// migration-script.js
const mongoose = require('mongoose');
const { Pool } = require('pg');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/cafewebsite');

// PostgreSQL connection
const pool = new Pool({
  user: 'cafehub_user',
  host: 'localhost',
  database: 'cafehub',
  password: 'your_secure_password',
  port: 5432,
});

async function migrateData() {
  try {
    // Import your MongoDB models
    const User = require('./models/User');
    const Cafe = require('./models/Cafe');
    const Rating = require('./models/Rating');

    // Migrate Users
    const users = await User.find({});
    for (const user of users) {
      await pool.query(
        'INSERT INTO users (name, email, password, role, phone, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [user.name, user.email, user.password, user.role.toUpperCase(), user.phone, user.createdAt, user.updatedAt]
      );
    }

    // Migrate Cafes (similar pattern)
    // ... implementation details

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateData();
```

## 🚀 Backend Setup

### Step 1: Set Up Java Backend
```bash
# Navigate to java-backend directory
cd java-backend

# Install dependencies
mvn clean install

# Create application-local.yml
cp src/main/resources/application.yml src/main/resources/application-local.yml
```

### Step 2: Configure Environment
Update `application-local.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/cafehub
    username: cafehub_user
    password: your_secure_password

jwt:
  secret: your-secure-jwt-secret-minimum-32-characters-long

file:
  upload-dir: ./uploads

cors:
  allowed-origins: http://localhost:3000
```

### Step 3: Start Java Backend
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

The Java backend will be available at: `http://localhost:8080/api`

## 🔧 Frontend Updates

### Update API Base URL
In your React app, update the API configuration:

```javascript
// src/utils/api.js or similar file
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-url.com/api'
  : 'http://localhost:8080/api';  // Changed from :5000 to :8080

export default API_BASE_URL;
```

### Update Axios Configuration
```javascript
// src/context/AuthContext.js or similar
import axios from 'axios';

// Set base URL
axios.defaults.baseURL = 'http://localhost:8080/api';

// Rest of your code remains the same
```

## 🔄 Side-by-Side Migration Process

### Phase 1: Parallel Running
1. Keep Node.js backend running on port 5000
2. Start Java backend on port 8080
3. Test Java backend with Postman/curl
4. Verify all endpoints work correctly

### Phase 2: Data Migration
1. Export data from MongoDB
2. Import data to PostgreSQL
3. Verify data integrity
4. Test with Java backend

### Phase 3: Frontend Switch
1. Update frontend API URL to point to Java backend
2. Test all functionality
3. Fix any compatibility issues
4. Deploy when satisfied

### Phase 4: Cleanup
1. Stop Node.js backend
2. Archive Node.js code
3. Update deployment scripts

## 🧪 Testing Migration

### API Compatibility Test
Use this test script to verify API compatibility:

```bash
#!/bin/bash
# test-api-compatibility.sh

BASE_URL="http://localhost:8080/api"

# Test registration
echo "Testing registration..."
curl -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "USER",
    "phone": "1234567890"
  }'

# Test login
echo "Testing login..."
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Add more tests for other endpoints...
```

### Database Verification
```sql
-- Verify data migration
SELECT 
  (SELECT COUNT(*) FROM users) as user_count,
  (SELECT COUNT(*) FROM cafes) as cafe_count,
  (SELECT COUNT(*) FROM ratings) as rating_count;

-- Check data integrity
SELECT u.name, u.email, u.role 
FROM users u 
ORDER BY u.created_at DESC 
LIMIT 5;
```

## 📊 Performance Comparison

### MongoDB vs PostgreSQL Queries

| Operation | MongoDB | PostgreSQL |
|-----------|---------|------------|
| Find user by email | `User.findOne({email})` | `SELECT * FROM users WHERE email = ?` |
| Cafe search with filters | Aggregation pipeline | Complex JOIN with WHERE clauses |
| Rating aggregation | `$group` and `$avg` | `AVG()` with GROUP BY |
| Full-text search | Text indexes | ILIKE or full-text search |

### Expected Performance Improvements
- **Complex Queries**: PostgreSQL excels at complex relational queries
- **Data Integrity**: ACID compliance ensures data consistency
- **Indexing**: More sophisticated indexing options
- **Analytics**: Better support for reporting and analytics

## 🚨 Common Issues & Solutions

### Issue 1: Data Type Mismatches
**Problem**: MongoDB's flexible schema vs PostgreSQL's strict types
**Solution**: Implement data validation and transformation during migration

### Issue 2: Relationship Mapping
**Problem**: MongoDB's embedded documents vs PostgreSQL's normalized tables
**Solution**: Use JPA entities with proper relationships (@OneToMany, @ManyToOne)

### Issue 3: Date Handling
**Problem**: Different date formats between systems
**Solution**: Use consistent ISO 8601 format and proper timezone handling

### Issue 4: File Upload Paths
**Problem**: Different file storage approaches
**Solution**: Update file paths and implement proper file serving

## 🔒 Security Considerations

### JWT Secret Migration
- Generate new, secure JWT secret for Java backend
- Existing tokens will become invalid (users need to re-login)
- Consider implementing token migration strategy if needed

### Password Hash Compatibility
- If using different hashing (bcrypt versions), users may need to reset passwords
- Or implement compatibility layer during transition

### Database Security
- Use connection pooling for better performance
- Implement proper database user permissions
- Enable SSL for production database connections

## 📈 Monitoring & Rollback Plan

### Monitoring Setup
```yaml
# Add to application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: always
```

### Rollback Strategy
1. **Immediate Rollback**: Switch frontend back to Node.js backend
2. **Data Rollback**: Restore MongoDB from backup if needed
3. **Gradual Rollback**: Implement feature flags to switch between backends

## ✅ Migration Checklist

### Pre-Migration
- [ ] Java 17+ installed and configured
- [ ] PostgreSQL installed and running
- [ ] Database created and user configured
- [ ] Java backend builds successfully
- [ ] All tests pass

### Data Migration
- [ ] MongoDB data exported
- [ ] Data transformation scripts created
- [ ] PostgreSQL data imported
- [ ] Data integrity verified
- [ ] Performance tested

### API Migration
- [ ] All endpoints implemented in Java
- [ ] Response formats match exactly
- [ ] Error handling consistent
- [ ] Authentication working
- [ ] File upload working

### Frontend Integration
- [ ] API base URL updated
- [ ] Authentication flow tested
- [ ] All features working
- [ ] Error handling verified
- [ ] Performance acceptable

### Production Deployment
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Rollback plan tested

## 🎉 Success Metrics

After successful migration, you should see:
- ✅ All API endpoints working identically
- ✅ Frontend functioning without changes
- ✅ Improved query performance for complex operations
- ✅ Better data consistency and integrity
- ✅ Enhanced security features
- ✅ Easier debugging and monitoring

## 📞 Support & Troubleshooting

### Common Commands
```bash
# Check Java backend status
curl http://localhost:8080/api/actuator/health

# View application logs
mvn spring-boot:run | grep ERROR

# Database connection test
psql -U cafehub_user -d cafehub -c "SELECT version();"

# Check running processes
ps aux | grep java
ps aux | grep postgres
```

### Log Analysis
- Java logs: Check console output and application.log
- PostgreSQL logs: Usually in `/var/log/postgresql/`
- Frontend: Browser console for API errors

---

**🚀 Ready to Migrate!** This comprehensive guide ensures a smooth transition from Node.js/MongoDB to Java/PostgreSQL while maintaining full functionality and improving performance.