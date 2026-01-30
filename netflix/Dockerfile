FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
COPY common-model ./common-model
COPY netflix ./netflix
COPY search-service ./search-service

RUN mvn -pl netflix -am clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/netflix/target/*.jar app.jar
EXPOSE 8080
CMD ["java","-jar","app.jar"]
