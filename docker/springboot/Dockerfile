FROM maven:3.9-eclipse-temurin-26 AS build
WORKDIR /app

COPY backend/demo/pom.xml .
RUN mvn dependency:go-offline -B

COPY backend/demo/src ./src
RUN mvn package -DskipTests -o

FROM eclipse-temurin:26-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 10000
ENTRYPOINT ["java", "-jar", "app.jar"]