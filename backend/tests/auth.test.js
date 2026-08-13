const request = require("supertest");
const app = require("../server");

describe("Auth: Register", () => {
  test("registers a visitor when no role is provided", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Visitor", email: "visitor@example.com", password: "secret123", confirmPassword: "secret123" });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.role).toBe("visitor");
  });

  test("registers an owner when role=owner is provided", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Owner", email: "owner@example.com", password: "secret123", confirmPassword: "secret123", role: "owner" });

    expect(res.statusCode).toBe(201);
    expect(res.body.user.role).toBe("owner");
  });

  test("does not allow setting role=admin via register payload", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Evil", email: "evil@example.com", password: "secret123", confirmPassword: "secret123", role: "admin" });

    expect(res.statusCode).toBe(201);
    // Controller coerces invalid roles to visitor
    expect(res.body.user.role).toBe("visitor");
  });
});
