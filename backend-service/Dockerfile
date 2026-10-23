## syntax=docker/dockerfile:1.5
#
#FROM maven:3.9.6-eclipse-temurin-17 AS build
#WORKDIR /app
#
## Copy root parent POM and module POM files
#COPY pom.xml .
#COPY common-model/pom.xml common-model/pom.xml
#COPY backend-service/pom.xml backend-service/pom.xml
#COPY search-service/pom.xml search-service/pom.xml
#
## Copy source directories required for building backend-service
#COPY common-model common-model
#COPY backend-service backend-service
#
## Build backend-service and its dependent modules
#RUN --mount=type=cache,id=maven-repo,target=/root/.m2 \
#    mvn -pl backend-service -am clean package -DskipTests
#
## ================= RUNTIME =================
#FROM eclipse-temurin:17-jre
#
## Install FFmpeg for video chunking and processing
#RUN apt-get update && \
#    apt-get install -y --no-install-recommends ffmpeg && \
#    rm -rf /var/lib/apt/lists/*
#
#WORKDIR /app
#COPY --from=build /app/backend-service/target/*.jar app.jar
#
#EXPOSE 8080
#CMD ["java", "-jar", "app.jar"]

# Copy static ffmpeg and ffprobe binaries (instant download, zero apt dependencies)
FROM mwader/static-ffmpeg:6.1 AS ffmpeg
FROM eclipse-temurin:17-jre
# Copy binaries into system path
COPY --from=ffmpeg /ffmpeg /usr/local/bin/
COPY --from=ffmpeg /ffprobe /usr/local/bin/

WORKDIR /app
COPY backend-service/target/*.jar app.jar

EXPOSE 8080
CMD ["java", "-jar", "app.jar"]