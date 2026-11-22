import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import app from "../../app";
import request from "supertest";
import { RefreshToken } from "../../entities/RefreshToken";
import { User } from "../../entities/User";
import createJWKSMock from "mock-jwks";
import { ROLES } from "../../constants";

describe("GET /auth/self", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        // Delete child records first
        await connection
            .createQueryBuilder()
            .delete()
            .from(RefreshToken)
            .execute();

        // Delete parent records next
        await connection.createQueryBuilder().delete().from(User).execute();
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        if (connection?.isInitialized) {
            await connection.destroy();
        }
    });

    describe("Given all fields", () => {
        it("should return 200 and JSON response", async () => {
            const accessToken = jwks.token({
                sub: "1",
                role: ROLES.CUSTOMER,
            });

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            expect(response.statusCode).toBe(200);
            expect(response.headers["content-type"]).toContain("json");
        });

        it("should check for the token", async () => {
            //register user
            const user = {
                firstName: "jay",
                lastName: "Reddy",
                email: "jay@gmail.com",
                password: "secret123",
            };

            const userRepository = connection.getRepository(User);

            const data = await userRepository.save({
                ...user,
                role: ROLES.CUSTOMER,
            });

            //create token
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            expect((response.body as Record<string, string>).id).toBe(data.id);
        });

        it("should not return the password", async () => {
            //register user
            const user = {
                firstName: "jay",
                lastName: "Reddy",
                email: "jay@gmail.com",
                password: "secret123",
            };

            const userRepository = connection.getRepository(User);

            const data = await userRepository.save({
                ...user,
                role: ROLES.CUSTOMER,
            });

            //create token
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            expect(response.body as Record<string, string>).not.toHaveProperty(
                "password",
            );
        });
    });
});
