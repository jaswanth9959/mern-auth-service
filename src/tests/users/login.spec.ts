import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import app from "../../app";
import request from "supertest";
import { RefreshToken } from "../../entities/RefreshToken";
import { User } from "../../entities/User";
import { isJWT } from "../utils";

describe("POST /auth/login", () => {
    let connection: DataSource;

    const createUserLoginData = () => ({
        email: "jay123@gmail.com",
        password: "secret123",
    });

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // Delete child records first
        await connection
            .createQueryBuilder()
            .delete()
            .from(RefreshToken)
            .execute();

        // Delete parent records next
        await connection.createQueryBuilder().delete().from(User).execute();
    });

    afterAll(async () => {
        if (connection?.isInitialized) {
            await connection.destroy();
        }
    });

    describe("successful login", () => {
        beforeEach(async () => {
            await request(app)
                .post("/auth/register")
                .send({
                    firstName: "Jay",
                    lastName: "Test",
                    ...createUserLoginData(),
                });
        });
        it("should return 200 and JSON response", async () => {
            const response = await request(app)
                .post("/auth/login")
                .send(createUserLoginData());

            expect(response.statusCode).toBe(200);
            expect(response.headers["content-type"]).toContain("json");
        });

        it("should return the user ID", async () => {
            const response = await request(app)
                .post("/auth/login")
                .send(createUserLoginData());
            const responseBody = response.body as { id: string };
            expect(response.statusCode).toBe(200);
            expect(responseBody.id).toBeDefined();
        });
        it("should return access and refresh tokens inside cookies", async () => {
            const response = await request(app)
                .post("/auth/login")
                .send(createUserLoginData());

            const cookies = response.headers["set-cookie"] as
                string[] | undefined;

            const accessCookie = cookies?.find((cookie: string) =>
                cookie.startsWith("accessToken="),
            );

            const refreshCookie = cookies?.find((cookie: string) =>
                cookie.startsWith("refreshToken="),
            );

            expect(accessCookie).toBeDefined();
            expect(refreshCookie).toBeDefined();
            expect(isJWT(accessCookie)).toBeTruthy();
            expect(isJWT(refreshCookie)).toBeTruthy();
        });
        it("should retrun the refresh token from the database", async () => {
            await connection
                .createQueryBuilder()
                .delete()
                .from(RefreshToken)
                .execute();

            const userData = createUserLoginData();

            const response = await request(app)
                .post("/auth/login")
                .send(userData);

            const refreshTokenRepo = connection.getRepository(RefreshToken);
            const token = await refreshTokenRepo
                .createQueryBuilder("refreshToken")
                .where("refreshToken.userId = :userId", {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany();

            expect(token).toHaveLength(1);
        });
    });

    describe("Validation Errors", () => {
        it.each([
            {
                field: "email",
                payload: { email: "" },
            },
            {
                field: "password",
                payload: { password: "" },
            },
        ])("should return 400 for $field", async ({ payload }) => {
            const userData = {
                ...createUserLoginData,
                ...payload,
            };

            const response = await request(app)
                .post("/auth/login")
                .send(userData);

            expect(response.statusCode).toBe(400);
        });
    });
});
