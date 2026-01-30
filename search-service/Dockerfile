FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy parent + ALL modules
COPY pom.xml .
COPY common-model ./common-model
COPY netflix ./netflix
COPY search-service ./search-service

# Build only search-service (but validate whole reactor)
RUN mvn -pl search-service -am clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/search-service/target/*.jar app.jar
EXPOSE 8082
CMD ["java","-jar","app.jar"]
