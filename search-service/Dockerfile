## syntax=docker/dockerfile:1.5
#FROM maven:3.9.6-eclipse-temurin-17 AS build
#WORKDIR /app
#
## 1️⃣ Copy only pom files (this is CRITICAL)
#COPY pom.xml .
#COPY common-model/pom.xml common-model/pom.xml
#COPY netflix/pom.xml netflix/pom.xml
#COPY search-service/pom.xml search-service/pom.xml
#
## 2️⃣ Cache Maven repo properly
#RUN --mount=type=cache,id=maven-repo,target=/root/.m2 \
#    mvn -B dependency:go-offline dependency:resolve-plugins
#
## 3️⃣ Now copy actual source code
#COPY common-model common-model
#COPY netflix netflix
#COPY search-service search-service
#
## 4️⃣ Build only what you need
#RUN --mount=type=cache,id=maven-repo,target=/root/.m2 \
#    mvn -o -pl search-service -am clean package -DskipTests
#
#
## ================= RUNTIME =================
#FROM eclipse-temurin:17-jre
#WORKDIR /app
#COPY --from=build /app/search-service/target/*.jar app.jar
#EXPOSE 8082
#CMD ["java","-jar","app.jar"]


# syntax=docker/dockerfile:1.5
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# 1️⃣ Copy only pom files
COPY pom.xml .
COPY common-model/pom.xml common-model/pom.xml
COPY netflix/pom.xml netflix/pom.xml
COPY search-service/pom.xml search-service/pom.xml

# 2️⃣ Warm Maven cache (ONLINE, cached)
RUN --mount=type=cache,id=maven-repo,target=/root/.m2 \
    mvn -B dependency:go-offline dependency:resolve-plugins

# 3️⃣ Copy source code
COPY common-model common-model
COPY netflix netflix
COPY search-service search-service

# 4️⃣ Build (NO OFFLINE FLAG)
RUN --mount=type=cache,id=maven-repo,target=/root/.m2 \
    mvn -pl search-service -am clean package -DskipTests


# ================= RUNTIME =================
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/search-service/target/*.jar app.jar
EXPOSE 8082
CMD ["java","-jar","app.jar"]
