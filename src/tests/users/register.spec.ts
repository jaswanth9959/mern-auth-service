import request from "supertest";
import app from "../../app.ts";
import type { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source.ts";
import { truncateTables } from "../utils/index.ts";
import { User } from "../../entities/User.ts";

describe("POST /auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        //db truncate
        await truncateTables(connection);
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("all fields are given", () => {
        it("should return 201 status code", async () => {
            const userData = {
                firstName: "jay",
                lastName: "Reddy",
                email: "jay@gmail.com",
                password: "secret",
            };

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            expect(response.statusCode).toBe(201);
        });

        it("should return JSON", async () => {
            const userData = {
                firstName: "jay",
                lastName: "Reddy",
                email: "jay@gmail.com",
                password: "secret",
            };

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            expect(
                (response.headers as Record<string, string>)["content-type"],
            ).toEqual(expect.stringContaining("json"));
        });

        it("should persist user data", async () => {
            const userData = {
                firstName: "jay",
                lastName: "Reddy",
                email: "jay@gmail.com",
                password: "secret",
            };

            await request(app).post("/auth/register").send(userData);

            const userRepository = connection.getRepository(User);

            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0]?.firstName).toBe(userData.firstName);
            expect(users[0]?.lastName).toBe(userData.lastName);
            expect(users[0]?.email).toBe(userData.email);
        });
    });

    describe("all fields are not given", () => {});
});
