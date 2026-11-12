import request from "supertest";
import app from "../../app.ts";

describe("POST /auth/register", () => {
    describe("all fields are given", () => {
        it("should return 201 status code", async () => {
            const userData = {
                name: "jay",
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
                name: "jay",
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
    });

    describe("all fields are not given", () => {});
});
