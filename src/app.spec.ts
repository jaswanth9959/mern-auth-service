import { calculateDiscount } from "./utils.ts";
import request from "supertest";
import app from "./app.ts";
describe("App", () => {
    it("should return correct discount", () => {
        const discount = calculateDiscount(100, 10);

        expect(discount).toBe(10);
    });

    it("should return 200", async () => {
        const response = await request(app).get("/").send();
        expect(response.statusCode).toBe(200);
    });
});
