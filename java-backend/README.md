# CafeHub Java Spring Boot Backend

A comprehensive REST API backend for the CafeHub cafe management and discovery platform, built with Java Spring Boot and PostgreSQL.

## 🚀 Tech Stack

- **Java 17** - Programming language
- **Spring Boot 3.2.0** - Framework
- **Spring Security** - Authentication & Authorization
- **Spring Data JPA** - Data access layer
- **PostgreSQL** - Database
- **JWT** - Token-based authentication
- **Maven** - Dependency management
- **Lombok** - Reducing boilerplate code

## 📋 Prerequisites

- **Java 17+**
- **Maven 3.6+**
- **PostgreSQL 12+**

## 🗄️ Database Schema

### Tables Created:
- `users` - User accounts (customers and cafe owners)
- `cafes` - Cafe information and details
- `menu_items` - Cafe menu items
- `ratings` - User reviews and ratings for cafes
- `cafe_images` - Image URLs for cafes
- `cafe_amenities` - Cafe amenities (WiFi, parking, etc.)
- `cafe_hours` - Operating hours for each day
- `rating_helpful` - Many-to-many for helpful rating votes

## 🔧 Setup Instructions

### 1. Database Setup
```sql
-- Create database
CREATE DATABASE cafehub;

-- Create user (optional)
CREATE USER cafehub_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE cafehub TO cafehub_user;
```

### 2. Environment Configuration
Create `application-local.yml` or set environment variables:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/cafehub
    username: your_username
    password: your_password

jwt:
  secret: your-secret-key-minimum-32-characters-long
```

### 3. Run the Application
```bash
# Install dependencies
mvn clean install

# Run the application
mvn spring-boot:run

# Or run with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

The API will be available at: `http://localhost:8080/api`

## 📚 API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/profile` - Update user profile

### Cafe Endpoints
- `GET /api/cafes` - Get all cafes (with filters)
- `GET /api/cafes/{id}` - Get cafe by ID
- `POST /api/cafes` - Create cafe (Owner only)
- `PUT /api/cafes/{id}` - Update cafe (Owner only)
- `DELETE /api/cafes/{id}` - Delete cafe (Owner only)
- `GET /api/cafes/owner/my-cafes` - Get owner's cafes

### Menu Endpoints
- `POST /api/cafes/{id}/menu` - Add menu item
- `PUT /api/cafes/{cafeId}/menu/{menuId}` - Update menu item
- `DELETE /api/cafes/{cafeId}/menu/{menuId}` - Delete menu item

### Rating Endpoints
- `POST /api/ratings` - Add/update rating
- `GET /api/ratings/cafe/{cafeId}` - Get cafe ratings
- `GET /api/ratings/user/{cafeId}` - Get user's rating for cafe
- `DELETE /api/ratings/{ratingId}` - Delete rating
- `POST /api/ratings/{ratingId}/helpful` - Toggle helpful vote

## 🔍 Advanced Search Features

### Cafe Search Parameters
- `city` - Filter by city
- `state` - Filter by state
- `minBudget` & `maxBudget` - Price range filtering
- `search` - Text search in name/description
- `amenities` - Filter by amenities
- `sortBy` - Sort options: rating, budget-low, budget-high, newest
- `page` & `size` - Pagination

### Example API Calls
```bash
# Get cafes in San Francisco
GET /api/cafes?city=San Francisco

# Search cafes with WiFi and parking, budget under $30
GET /api/cafes?amenities=WIFI,PARKING&maxBudget=30

# Get top-rated cafes
GET /api/cafes?sortBy=rating&page=0&size=10
```

## 🏗️ Project Structure

```
src/main/java/com/cafehub/
├── CafeHubApplication.java     # Main application class
├── model/                      # JPA Entities
│   ├── User.java
│   ├── Cafe.java
│   ├── MenuItem.java
│   └── Rating.java
├── repository/                 # Data access layer
│   ├── UserRepository.java
│   ├── CafeRepository.java
│   ├── MenuItemRepository.java
│   └── RatingRepository.java
├── service/                    # Business logic layer
│   ├── UserService.java
│   ├── CafeService.java
│   ├── RatingService.java
│   └── FileStorageService.java
├── controller/                 # REST controllers
│   ├── AuthController.java
│   ├── CafeController.java
│   └── RatingController.java
├── security/                   # Security configuration
│   ├── JwtUtil.java
│   ├── JwtAuthenticationFilter.java
│   └── CustomUserDetailsService.java
├── config/                     # Configuration classes
│   └── SecurityConfig.java
├── dto/                        # Data transfer objects
│   ├── LoginRequest.java
│   ├── RegisterRequest.java
│   └── AuthResponse.java
└── exception/                  # Exception handling
    └── GlobalExceptionHandler.java
```

## 🔐 Security Features

### JWT Authentication
- Stateless authentication using JWT tokens
- Token expiration handling
- Role-based access control (USER, OWNER)

### Authorization Rules
- **Public**: Cafe browsing, cafe details, public ratings
- **Authenticated**: Rating submission, profile management
- **Owner Only**: Cafe management, menu management
- **Admin**: System administration (future feature)

### Password Security
- BCrypt hashing for password storage
- Strong password requirements
- Secure token generation

## 📊 Database Features

### JPA Features Used
- Entity relationships (OneToMany, ManyToOne, ManyToMany)
- Embedded objects for complex data types
- Custom queries with JPQL
- Pagination and sorting
- Audit trails with @CreatedDate and @LastModifiedDate

### PostgreSQL Optimizations
- Database indexes on frequently queried fields
- Efficient queries for search and filtering
- Connection pooling
- Transaction management

## 🔄 Key Business Logic

### Rating System
- One rating per user per cafe
- Aggregate rating calculation
- Aspect-based ratings (food, service, ambiance, value)
- Helpful vote system
- Rating distribution analytics

### Cafe Management
- Image upload and management
- Menu item CRUD operations
- Operating hours management
- Amenity tracking
- Location-based searching

### Search & Filtering
- Complex multi-criteria search
- Full-text search in cafe names and descriptions
- Budget range filtering
- Geographic filtering by city/state
- Amenity-based filtering

## 🧪 Testing

### Run Tests
```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=CafeServiceTest

# Run with coverage
mvn test jacoco:report
```

### Test Database
- H2 in-memory database for testing
- Separate test profiles
- Mock data setup for integration tests

## 🚀 Deployment

### Build for Production
```bash
# Create JAR file
mvn clean package -DskipTests

# Run JAR
java -jar target/cafe-backend-1.0.0.jar --spring.profiles.active=prod
```

### Docker Support
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/cafe-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## 📈 Monitoring & Logging

### Actuator Endpoints
- `/actuator/health` - Application health
- `/actuator/info` - Application info
- `/actuator/metrics` - Application metrics

### Logging Configuration
- Structured logging with Logback
- Different log levels for different environments
- SQL query logging in development

## 🔧 Configuration Properties

### Essential Properties
```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/cafehub
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false

jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000

file:
  upload-dir: ./uploads

cors:
  allowed-origins: http://localhost:3000
```

## 🤝 API Integration with React Frontend

The Java backend is designed to work seamlessly with the existing React frontend. Key compatibility features:

- **Same API Endpoints**: All endpoints match the Node.js version
- **Identical Response Format**: JSON responses use the same structure
- **CORS Configuration**: Properly configured for React development server
- **Error Handling**: Consistent error response format

## 🔄 Migration from Node.js

To migrate from the Node.js backend:

1. **Database Migration**: 
   - Export data from MongoDB
   - Transform to PostgreSQL format
   - Import using SQL scripts

2. **Update Frontend**:
   - Change API base URL to `http://localhost:8080/api`
   - No other changes needed due to API compatibility

3. **Environment Setup**:
   - Configure PostgreSQL database
   - Set environment variables
   - Start Java application

## 📝 Development Notes

### Code Quality
- Lombok reduces boilerplate code
- Clear separation of concerns
- Comprehensive error handling
- Input validation at multiple levels

### Performance Considerations
- Lazy loading for relationships
- Pagination for large datasets
- Database query optimization
- Connection pooling

### Future Enhancements
- Redis caching layer
- Elasticsearch for advanced search
- Image processing and optimization
- Real-time notifications with WebSocket
- Analytics and reporting features

---

**🎯 Ready to Use!** The Java backend provides a robust, scalable foundation for the CafeHub platform with enterprise-grade features and security.