import request from "supertest";
import app from "../../app.ts";
import type { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source.ts";
import { User } from "../../entities/User.ts";
import { ROLES } from "../../constants/index.ts";
import { isJWT } from "../utils/index.ts";
import { RefreshToken } from "./../../entities/RefreshToken.ts";

describe("POST /auth/register", () => {
    let connection: DataSource;

    const createUserData = () => ({
        firstName: "jay",
        lastName: "Reddy",
        email: "jay@gmail.com",
        password: "secret123",
    });

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    // beforeEach(async () => {
    //     // Delete child records first
    //     await connection.getRepository(RefreshToken).clear();

    //     // Then delete parent records
    //     await connection.getRepository(User).clear();
    // });

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

    describe("Successful registration", () => {
        it("should return 201 and JSON response", async () => {
            const response = await request(app)
                .post("/auth/register")
                .send(createUserData());

            expect(response.statusCode).toBe(201);
            expect(response.headers["content-type"]).toContain("json");
        });

        it("should return the newly created user ID", async () => {
            const response = await request(app)
                .post("/auth/register")
                .send(createUserData());
            const responseBody = response.body as { id: string };
            expect(response.statusCode).toBe(201);
            expect(responseBody.id).toBeDefined();
        });

        it("should persist user data in the database", async () => {
            const userData = createUserData();

            await request(app).post("/auth/register").send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0]?.firstName).toBe(userData.firstName);
            expect(users[0]?.lastName).toBe(userData.lastName);
            expect(users[0]?.email).toBe(userData.email);
        });

        it("should assign customer role by default", async () => {
            await request(app).post("/auth/register").send(createUserData());

            const users = await connection.getRepository(User).find();

            expect(users[0]?.role).toBe(ROLES.CUSTOMER);
        });
        it("should return access and refresh tokens inside cookies", async () => {
            const response = await request(app)
                .post("/auth/register")
                .send(createUserData());

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
            const userData = createUserData();

            const response = await request(app)
                .post("/auth/register")
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

    describe("Password security", () => {
        it("should store a hashed password instead of plain text", async () => {
            const userData = createUserData();

            await request(app).post("/auth/register").send(userData);

            const users = await connection.getRepository(User).find();

            expect(users).toHaveLength(1);

            const hashedPassword = users[0]?.password;

            expect(hashedPassword).not.toBe(userData.password);
            expect(hashedPassword).toMatch(/^\$2[aby]\$/);
        });
    });

    describe("Duplicate registration", () => {
        it("should return 400 and not create a duplicate user", async () => {
            const userData = createUserData();
            const userRepository = connection.getRepository(User);

            await userRepository.save({
                ...userData,
                role: ROLES.CUSTOMER,
            });

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            const users = await userRepository.find();

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });
    });

    describe("Validation errors", () => {
        it.each([
            {
                field: "email",
                payload: { email: "" },
            },
            {
                field: "firstName",
                payload: { firstName: "" },
            },
            {
                field: "lastName",
                payload: { lastName: "" },
            },
            {
                field: "password",
                payload: { password: "" },
            },
            {
                field: "invalid email",
                payload: { email: "jayreddy" },
            },
            {
                field: "short password",
                payload: { password: "secret" },
            },
        ])("should return 400 for $field", async ({ payload }) => {
            const userData = {
                ...createUserData(),
                ...payload,
            };

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            expect(response.statusCode).toBe(400);
        });
    });
});
