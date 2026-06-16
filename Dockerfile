# Stage 1: Build React frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Spring Boot backend (includes frontend in static/)
FROM maven:3.9-eclipse-temurin-21 AS backend-build
WORKDIR /app
COPY backend/pom.xml ./pom.xml
RUN mvn -B dependency:go-offline -DskipTests
COPY backend/src ./src
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static
RUN mvn -B -DskipTests package

# Stage 3: Run
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN mkdir -p /app/persist/data /app/persist/uploads
COPY --from=backend-build /app/target/store-1.0.0.jar app.jar
ENV PORT=8080
ENV STORE_DATA_PATH=/app/persist/data
ENV STORE_UPLOAD_PATH=/app/persist/uploads
EXPOSE 8080
ENTRYPOINT ["java", "-Xmx512m", "-jar", "app.jar"]
