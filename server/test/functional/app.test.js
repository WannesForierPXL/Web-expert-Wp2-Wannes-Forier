const dotenv = require("dotenv");
dotenv.config();
const {MongoClient} = require("mongodb");
const {MongoMemoryServer} = require("mongodb-memory-server");

const request = require("supertest");
const uuid = require('uuid');
const mongoose = require("mongoose");

const loadExpress = require("../../loaders/express.js");
const DATABASE_CONNECTION = process.env.DATABASE_CONNECTION_TEST;
const DB_CONNECTION_OPTIONS = JSON.parse(process.env.DATABASE_CONNECTION_OPTIONS);
const CORS_OPTIONS = JSON.parse(process.env.CORS_OPTIONS);

const {usersIncludingPasswords, admin, tasks} = require("./data");

let mongServer, uri, client, app;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    uri = mongoServer.getUri();
    await mongoose.connect(uri, {});
    app = loadExpress(CORS_OPTIONS);
    client = new MongoClient(uri);
    await client.connect();
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
    await client.close();
});

async function resetDatabase() {
    const dbName = mongoose.connection.db.databaseName;
    db = client.db(dbName);
    await db.dropDatabase();
    await db.collection('users').insertMany(
        [...usersIncludingPasswords, admin].map((u) => ({
            _id: u._id,
            username: u.username,
            roles: u.roles,
            hashedPassword: u.hashedPassword,
        }))
    );
    await db.collection('tasks').insertMany(tasks);
}

describe("app", () => {

    describe("POST /security/login", () => {
        usersIncludingPasswords.forEach((user, index) => {
            it(`should return statuscode 401 when an incorrect password is provided for user ${index + 1}`, async () => {
                await resetDatabase();
                const {username} = user;
                await request(app)
                    .post("/security/login")
                    .send({username, password: "incorrectpassword"})
                    .expect(401);
            });

            it(`should return statuscode 200 and user and token if username and password are correct for user ${index + 1}`, async () => {
                await resetDatabase();
                const {username, password} = user;
                const response = await request(app)
                    .post("/security/login")
                    .send({username, password});
                const cookie = response.headers['set-cookie'].pop().split(';')[0];
                expect(cookie).toMatch(/^token=/);
                const token = cookie.substring(6);
                const responseUser = response.body;
                expect(responseUser).toBeDefined();
                expect(token).toBeDefined();
                expect(responseUser.username).toEqual(username);
            });
        });
    });

    describe("POST /security/login/check", () => {
        usersIncludingPasswords.forEach((user, index) => {
            it(`should return statuscode 401 when no token is provided for user ${index + 1}`, async () => {
                await resetDatabase();
                await request(app)
                    .post("/security/login/check")
                    .expect(401);
            });

            it(`should return statuscode 200 and user when a valid token is presented for user ${index + 1}`, async () => {
                await resetDatabase();
                const {username, password} = user;
                const response = await request(app)
                    .post("/security/login")
                    .send({username, password});
                const cookie = response.headers['set-cookie'].pop().split(';')[0];
                expect(cookie).toMatch(/^token=/);
                const token = cookie.substring(6);
                const checkResponse = await request(app)
                    .post("/security/login/check")
                    .set("Cookie", [`token=${token}`])
                    .send()
                    .expect(200);
                const responseUser = response.body;
                expect(responseUser).toBeDefined();
                expect(responseUser.username).toEqual(username);
                expect(responseUser._id.toString()).toEqual(user._id.toString());
            });

            it(`should return statuscode 401 when an invalid token is provided for user ${index + 1}`, async () => {
                await resetDatabase();
                const token = "invalidtoken";
                await request(app)
                    .post("/security/login/check")
                    .set("Cookie", [`token=${token}`])
                    .send()
                    .expect(401);
            });
        });
    });

    describe("GET /task/me", () => {
        usersIncludingPasswords.forEach((user, index) => {
            it(`should return statuscode 401 if no token is provided for user ${index + 1}`, async () => {
                await resetDatabase();
                await request(app)
                    .get(`/task/me`)
                    .expect(401);
            });

            it(`should return statuscode 401 when an invalid token is provided for user ${index + 1}`, async () => {
                await resetDatabase();
                const token = "invalidtoken";
                await request(app)
                    .get(`/task/me`)
                    .set("Cookie", [`token=${token}`])
                    .send()
                    .expect(401);
            });

            it(`should return statuscode 401 when an invalid token is provided for user ${index + 1}`, async () => {
                await resetDatabase();
                const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30";
                await request(app)
                    .get(`/task/me`)
                    .set("Cookie", [`token=${token}`])
                    .send()
                    .expect(401);
            });


            it(`should return statuscode 200 and the tasks when a valid token is provided for user ${index + 1}`, async () => {
                await resetDatabase();
                const {username, password} = user;
                const response = await request(app)
                    .post("/security/login")
                    .send({username, password});
                const responseUser = response.body;
                const cookie = response.headers['set-cookie'].pop().split(';')[0];
                expect(cookie).toMatch(/^token=/);
                const token = cookie.substring(6);
                const response2 = await request(app)
                    .get(`/task/me`)
                    .set("Cookie", [`token=${token}`])
                    .send();
                const actualTasks = response2.body;
                const actualTaskIds = actualTasks.map((t) => t._id.toString());
                const expectedTaskIds = tasks
                    .filter((t) => t.userId?.toString() === responseUser._id.toString())
                    .map((t) => t._id.toString());
                expect(actualTaskIds.sort()).toEqual(expectedTaskIds.sort());
            });
        });
    });

    describe("PATCH /task/:taskId", () => {
        tasks.forEach((task, index) => {
            it(`should return statuscode 401 if no token is provided for task ${index + 1}`, async () => {
                await resetDatabase();
                await request(app)
                    .patch(`/task/{index}`)
                    .expect(401);
            });

            it(`should return statuscode 401 when an invalid token is provided for task ${index + 1}`, async () => {
                await resetDatabase();
                const token = "invalidtoken";
                await request(app)
                    .patch(`/task/{index}`)
                    .set("Cookie", [`token=${token}`])
                    .send()
                    .expect(401);
            });

            it(`should return statuscode 401 when an invalid token is provided for task ${index + 1}`, async () => {
                await resetDatabase();
                const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30";
                await request(app)
                    .patch(`/task/{index}`)
                    .set("Cookie", [`token=${token}`])
                    .send()
                    .expect(401);
            });

            if (task.userId) {
                it(`should return statuscode 200 and the updated task when a valid token is provided for task ${index + 1}`, async () => {
                    await resetDatabase();
                    const user = usersIncludingPasswords.find(u => u._id.toString() === task.userId.toString())
                    const {username, password} = user;
                    const response = await request(app)
                        .post("/security/login")
                        .send({username, password});
                    const responseUser = response.body;
                    const cookie = response.headers['set-cookie'].pop().split(';')[0];
                    expect(cookie).toMatch(/^token=/);
                    const token = cookie.substring(6);
                    const response2 = await request(app)
                        .patch(`/task/${task._id.toString()}`)
                        .set("Cookie", [`token=${token}`])
                        .send({completed: !task.completed})
                        .expect(200)
                    const updatedTask = response2.body;
                    expect(updatedTask.completed).toBe(!task.completed)
                });

                it(`should return statuscode 400 for invalid completed for task ${index + 1}`, async () => {
                    await resetDatabase();
                    const user = usersIncludingPasswords.find(u => u._id.toString() === task.userId.toString())
                    const {username, password} = user;
                    const response = await request(app)
                        .post("/security/login")
                        .send({username, password});
                    const responseUser = response.body;
                    const cookie = response.headers['set-cookie'].pop().split(';')[0];
                    expect(cookie).toMatch(/^token=/);
                    const token = cookie.substring(6);
                    const response2 = await request(app)
                        .patch(`/task/${task._id.toString()}`)
                        .set("Cookie", [`token=${token}`])
                        .send({completed: "invalid value"})
                        .expect(400)
                });


                it(`should return statuscode 403 if a another user updates the task ${index + 1}`, async () => {
                    await resetDatabase();
                    const user = usersIncludingPasswords.find(u => u._id.toString() !== task.userId.toString())
                    const {username, password} = user;
                    const response = await request(app)
                        .post("/security/login")
                        .send({username, password});
                    const responseUser = response.body;
                    const cookie = response.headers['set-cookie'].pop().split(';')[0];
                    expect(cookie).toMatch(/^token=/);
                    const token = cookie.substring(6);
                    const response2 = await request(app)
                        .patch(`/task/${task._id.toString()}`)
                        .set("Cookie", [`token=${token}`])
                        .send({completed: true})
                        .expect(403)
                });
            }
        });
    });
    describe("GET /user", () => {
        it("should return statuscode 401 if no token is provided", async () => {
            await resetDatabase();
            await request(app)
                .get("/user")
                .expect(401);
        });

        it("should return statuscode 401 when an invalid token is provided", async () => {
            await resetDatabase();
            await request(app)
                .get("/user")
                .set("Cookie", ["token=invalidtoken"])
                .expect(401);
        });

        usersIncludingPasswords.forEach((user, index) => {
            it(`should return statuscode 403 when a regular user requests all users (user ${index + 1})`, async () => {
                await resetDatabase();
                const {username, password} = user;
                const response = await request(app)
                    .post("/security/login")
                    .send({username, password});
                const cookie = response.headers['set-cookie'].pop().split(';')[0];
                await request(app)
                    .get("/user")
                    .set("Cookie", [cookie])
                    .expect(403);
            });
        });

        it("should return statuscode 200 and all users without hashedPassword for an admin", async () => {
            await resetDatabase();
            const {username, password} = admin;
            const response = await request(app)
                .post("/security/login")
                .send({username, password});
            const cookie = response.headers['set-cookie'].pop().split(';')[0];

            const response2 = await request(app)
                .get("/user")
                .set("Cookie", [cookie])
                .expect(200);

            const actualIds = response2.body.map((u) => u._id).sort();
            const expectedIds = [...usersIncludingPasswords, admin].map((u) => u._id).sort();
            expect(actualIds).toEqual(expectedIds);
            response2.body.forEach((u) => expect(u).not.toHaveProperty('hashedPassword'));
        });
    });

    describe("GET /task", () => {
        it("should return statuscode 401 if no token is provided", async () => {
            await resetDatabase();
            await request(app)
                .get("/task")
                .expect(401);
        });

        usersIncludingPasswords.forEach((user, index) => {
            it(`should return statuscode 403 when a regular user requests all tasks (user ${index + 1})`, async () => {
                await resetDatabase();
                const {username, password} = user;
                const response = await request(app)
                    .post("/security/login")
                    .send({username, password});
                const cookie = response.headers['set-cookie'].pop().split(';')[0];
                await request(app)
                    .get("/task")
                    .set("Cookie", [cookie])
                    .expect(403);
            });
        });

        it("should return statuscode 200 and all tasks with populated username for an admin", async () => {
            await resetDatabase();
            const {username, password} = admin;
            const response = await request(app)
                .post("/security/login")
                .send({username, password});
            const cookie = response.headers['set-cookie'].pop().split(';')[0];

            const response2 = await request(app)
                .get("/task")
                .set("Cookie", [cookie])
                .expect(200);

            const actualTasks = response2.body;
            expect(actualTasks.map((t) => t._id).sort())
                .toEqual(tasks.map((t) => t._id).sort());

            tasks.forEach((expected) => {
                const actual = actualTasks.find((t) => t._id === expected._id);
                if (expected.userId) {
                    const owner = usersIncludingPasswords.find((u) => u._id === expected.userId);
                    expect(actual.userId).toEqual({_id: owner._id, username: owner.username});
                } else {
                    expect(actual.userId).toBeUndefined();
                }
            });
        });
    });

    describe("PATCH /task/:taskId/user", () => {
        async function loginAs({username, password}) {
            const response = await request(app)
                .post("/security/login")
                .send({username, password});
            return response.headers['set-cookie'].pop().split(';')[0];
        }

        const unassignedTask = tasks[2];
        const targetUser = usersIncludingPasswords[1];

        it("should return statuscode 401 if no token is provided", async () => {
            await resetDatabase();
            await request(app)
                .patch(`/task/${unassignedTask._id}/user`)
                .send({userId: targetUser._id})
                .expect(401);
        });

        it("should return statuscode 403 when a regular user tries to assign a task", async () => {
            await resetDatabase();
            const cookie = await loginAs(usersIncludingPasswords[0]);
            await request(app)
                .patch(`/task/${unassignedTask._id}/user`)
                .set("Cookie", [cookie])
                .send({userId: targetUser._id})
                .expect(403);
        });

        it("should return statuscode 200 and the updated task when an admin assigns a task", async () => {
            await resetDatabase();
            const cookie = await loginAs(admin);
            const response = await request(app)
                .patch(`/task/${unassignedTask._id}/user`)
                .set("Cookie", [cookie])
                .send({userId: targetUser._id})
                .expect(200);
            expect(response.body._id).toBe(unassignedTask._id);
            expect(response.body.userId).toBe(targetUser._id);
        });

        it("should return statuscode 200 when an admin reassigns an already assigned task", async () => {
            await resetDatabase();
            const cookie = await loginAs(admin);
            const response = await request(app)
                .patch(`/task/${tasks[0]._id}/user`)
                .set("Cookie", [cookie])
                .send({userId: targetUser._id})
                .expect(200);
            expect(response.body.userId).toBe(targetUser._id);
        });

        it("should return statuscode 400 when userId is not a valid uuid", async () => {
            await resetDatabase();
            const cookie = await loginAs(admin);
            await request(app)
                .patch(`/task/${unassignedTask._id}/user`)
                .set("Cookie", [cookie])
                .send({userId: "abc"})
                .expect(400);
        });

        it("should return statuscode 400 when no body is sent", async () => {
            await resetDatabase();
            const cookie = await loginAs(admin);
            await request(app)
                .patch(`/task/${unassignedTask._id}/user`)
                .set("Cookie", [cookie])
                .expect(400);
        });

        it("should return statuscode 400 when the task is assigned to an admin", async () => {
            await resetDatabase();
            const cookie = await loginAs(admin);
            await request(app)
                .patch(`/task/${unassignedTask._id}/user`)
                .set("Cookie", [cookie])
                .send({userId: admin._id})
                .expect(400);
        });

        it("should return statuscode 404 when the task does not exist", async () => {
            await resetDatabase();
            const cookie = await loginAs(admin);
            await request(app)
                .patch(`/task/${uuid.v4()}/user`)
                .set("Cookie", [cookie])
                .send({userId: targetUser._id})
                .expect(404);
        });

        it("should return statuscode 404 when the user does not exist", async () => {
            await resetDatabase();
            const cookie = await loginAs(admin);
            await request(app)
                .patch(`/task/${unassignedTask._id}/user`)
                .set("Cookie", [cookie])
                .send({userId: uuid.v4()})
                .expect(404);
        });
    });
});
