const request = require("supertest");
const app = require("../server");

async function registerAndLogin(user) {
  const res = await request(app).post("/api/auth/register").send(user);
  return res.body.token;
}

describe("Cafe Guards", () => {
  test("visitor cannot create a cafe (403)", async () => {
    const token = await registerAndLogin({ name: "V", email: "v@example.com", password: "secret123", confirmPassword: "secret123" });

    const res = await request(app)
      .post("/api/cafes")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "My Cafe", location: "Testville", description: "Nice spot", address: "123 Street", priceRange: "$" });

    expect(res.statusCode).toBe(403);
  });

  test("owner can create a cafe and owner cannot edit another owner's cafe", async () => {
    const ownerToken1 = await registerAndLogin({ name: "Owner1", email: "o1@example.com", password: "secret123", confirmPassword: "secret123", role: "owner" });
    const ownerToken2 = await registerAndLogin({ name: "Owner2", email: "o2@example.com", password: "secret123", confirmPassword: "secret123", role: "owner" });

    // Owner1 creates a cafe
    const createRes = await request(app)
      .post("/api/cafes")
      .set("Authorization", `Bearer ${ownerToken1}`)
      .send({ name: "Owner1 Cafe", location: "Town", description: "Cozy", address: "1 Owner Lane", priceRange: "$$" });

    expect(createRes.statusCode).toBe(201);
    const cafeId = createRes.body.cafe._id;

    // Owner2 tries to update Owner1's cafe => should be 403
    const updateRes = await request(app)
      .put(`/api/cafes/${cafeId}`)
      .set("Authorization", `Bearer ${ownerToken2}`)
      .send({ name: "Hacked Cafe" });

    expect(updateRes.statusCode).toBe(403);
  });
});
