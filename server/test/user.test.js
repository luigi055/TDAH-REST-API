const chai = require("chai");
const chaiHTTP = require("chai-http");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = require("./../server");
const User = require("./../models/user");
const { users, populateUsers } = require("./seed/seed");

const expect = chai.expect;
chai.use(chaiHTTP);

beforeEach(populateUsers);

describe("POST /api/advisor", () => {
  it("should add a brand new user", done => {
    const email = "luigi4@test.com";
    const password = "123abc!";

    chai
      .request(app)
      .post("/api/advisor")
      .send({
        email,
        password
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.header["x-auth"]).to.exist;
        expect(res.body.email).to.be.equal("luigi4@test.com");

        if (err) return done(err);
        // We'll find the new user created
        User.findOne({
          email
        })
          .then(user => {
            // make sure it created the new user with the same email
            expect(user).to.be.an("object").that.exist;
            expect(user.email).to.be.equal(email);
            // make sure it hashed properly and if the password
            // match with the hashed password
            bcrypt.compare(password, user.password, (err, userPw) => {
              expect(userPw).to.be.true;
              done();
            });
          })
          .catch(err => done(err));
      });
  });

  it("should get error 400 if invalid user and passowrd", done => {
    chai
      .request(app)
      .post("/api/advisor")
      .send({
        email: "john@mai",
        password: "45s"
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it("should get error 400 if email already in use", done => {
    const { email, password } = users[0];

    chai
      .request(app)
      .post("/api/advisor")
      .send({
        email,
        password
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
});

describe("POST /api/advisor/login", () => {
  it("should login an existing user", done => {
    chai
      .request(app)
      .post("/api/advisor/login")
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.header["x-auth"]).to.exist;
        expect(res.body._id)
          .to.be.a("string")
          .that.is.equal(users[1]._id.toHexString());
        expect(res.body.email).to.be.equal(users[1].email);

        if (err) return done(err);

        User.findById(users[1]._id)
          .then(user => {
            expect(user.tokens)
              .is.an("array")
              .that.have.lengthOf(2);
            expect(user.tokens[1]).to.deep.include({
              access: "auth",
              token: res.header["x-auth"]
            });
            done();
          })
          .catch(err => done(err));
      });
  });

  it("should not login if any data is incorrect", done => {
    chai
      .request(app)
      .post("/api/advisor/login")
      .send({
        email: "luigi@test",
        password: "123"
      })
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });

  it("should not login if user not found", done => {
    chai
      .request(app)
      .post("/api/advisor/login")
      .send({
        email: "saitama@hotmail.com",
        password: "123abc!"
      })
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
});

describe("GET /api/advisor/activation/:emailToken", () => {
  it("should confirm an user", done => {
    const user = users[0];
    const emailToken = jwt.sign(
      {
        _id: user._id.toHexString()
      },
      process.env.EMAIL_SECRET,
      {
        expiresIn: "1d"
      }
    );
    chai
      .request(app)
      .get(`/api/advisor/activation/${emailToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        User.findById(users[0]._id)
          .then(user => {
            expect(user.confirmed).to.be.true;
            done();
          })
          .catch(err => done(err));
      });
  });
  it("should get error if token invalid", done => {
    chai
      .request(app)
      .get(`/api/advisor/activation/5s6a1as6dg51s`)
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
});

describe("GET /api/advisor/activation", () => {
  it("should send activation email to an user", done => {
    const user = users[0];

    chai
      .request(app)
      .get(`/api/advisor/activation`)
      .set("x-auth", users[0].tokens[0].token)
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it("should get error if not authenticated", done => {
    chai
      .request(app)
      .get(`/api/advisor/activation`)
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});

describe("GET /api/advisor/me", () => {
  it("should get the current logedin user", done => {
    chai
      .request(app)
      .get("/api/advisor/me")
      .set("x-auth", users[0].tokens[0].token)
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it("should not get the current loggedin user if not authenticated", done => {
    chai
      .request(app)
      .get("/api/advisor/me")
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});

describe("GET /api/advisor/all", () => {
  it("should get all exiting users", done => {
    chai
      .request(app)
      .get("/api/advisor/all")
      .set("x-auth", users[0].tokens[0].token)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body)
          .to.be.an("array")
          .that.have.lengthOf(2);
        done();
      });
  });

  it("should not get all users if not authenticated", done => {
    chai
      .request(app)
      .get("/api/advisor/all")
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});

describe("DELETE /api/advisor/logout", () => {
  it("should remove token from user and logout", done => {
    chai
      .request(app)
      .delete("/api/advisor/logout")
      .set("x-auth", users[0].tokens[0].token)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.header["x-auth"]).to.not.exist;

        if (err) return done(err);
        User.findById(users[0]._id)
          .then(user => {
            expect(user.tokens).to.have.lengthOf(0);
            expect(user.tokens).to.be.an("array").that.is.empty;
            done();
          })
          .catch(err => done(err));
      });
  });
  it("should not remove token if not authenticated", done => {
    chai
      .request(app)
      .delete("/api/advisor/logout")
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});

describe("PATCH /api/advisor/me", () => {
  it("should change password and logout", done => {
    const password = "123abc!123";
    chai
      .request(app)
      .patch("/api/advisor/me")
      .set("x-auth", users[0].tokens[0].token)
      .send({
        currentPassword: users[0].password,
        password
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        if (err) return done(err);
        User.findById(users[0]._id)
          .then(user => {
            bcrypt.compare(password, user.password, (err, res) => {
              expect(res).to.be.true;
              expect(user.tokens).to.be.an("array").that.is.empty;
              done();
            });
          })
          .catch(err => done(err));
      });
  });

  it("should change and trim password and logout", done => {
    const password = "   123abc!123   ";
    const trimmedPassword = password.trim();
    chai
      .request(app)
      .patch("/api/advisor/me")
      .set("x-auth", users[0].tokens[0].token)
      .send({
        currentPassword: users[0].password,
        password
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        if (err) return done(err);
        User.findById(users[0]._id)
          .then(user => {
            bcrypt.compare(trimmedPassword, user.password, (err, res) => {
              expect(res).to.be.true;
              expect(user.tokens).to.be.an("array").that.is.empty;
              done();
            });
          })
          .catch(err => done(err));
      });
  });

  it("should change displayName and keep logged in", done => {
    const displayName = "Pedro Luis La Rosa Doganieri";
    chai
      .request(app)
      .patch("/api/advisor/me")
      .set("x-auth", users[0].tokens[0].token)
      .send({
        currentPassword: users[0].password,
        displayName
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        if (err) return done(err);
        User.findById(users[0]._id)
          .then(user => {
            expect(user.displayName).to.be.equal(displayName);
            expect(user.tokens).to.have.lengthOf(1);
            done();
          })
          .catch(err => done(err));
      });
  });

  it("should not change displayName if currentPassword wasnt passed in", done => {
    const displayName = "Pedro Luis La Rosa Doganieri";
    chai
      .request(app)
      .patch("/api/advisor/me")
      .set("x-auth", users[0].tokens[0].token)
      .send({
        displayName
      })
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });

  it("should not change password if invalid", done => {
    const password = "123";
    chai
      .request(app)
      .patch("/api/advisor/me")
      .set("x-auth", users[0].tokens[0].token)
      .send({
        currentPassword: users[0].password,
        password
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it("should not change password if currentPassword doesnt exist", done => {
    const password = "123";
    chai
      .request(app)
      .patch("/api/advisor/me")
      .set("x-auth", users[0].tokens[0].token)
      .send({
        password
      })
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });

  it("should not change data if not authenticated", done => {
    chai
      .request(app)
      .patch("/api/advisor/me")
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});

describe("POST /api/advisor/change-password", () => {
  it("should send email for change pasword request", done => {
    chai
      .request(app)
      .post("/api/advisor/change-password")
      .send({
        email: users[0].email
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it("should not send email for change pasword request if invalid email", done => {
    chai
      .request(app)
      .post("/api/advisor/change-password")
      .send({
        email: "luigi.com"
      })
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
});

describe("GET /api/advisor/change-password", () => {
  it("should send email for change pasword request", done => {
    chai
      .request(app)
      .get("/api/advisor/change-password")
      .set("x-auth", users[0].tokens[0].token)
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it("should not send email for change pasword request if not authenticated", done => {
    chai
      .request(app)
      .get("/api/advisor/change-password")
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});

describe("PATCH /api/advisor/auth-change-password/:emailToken", () => {
  it("should change password", done => {
    const user = users[0];
    const newPassword = "123abc!50";
    const emailToken = jwt.sign(
      {
        _id: users[0]._id.toHexString(),
        email: users[0].email
      },
      process.env.EMAIL_SECRET,
      {
        expiresIn: "2h"
      }
    );

    chai
      .request(app)
      .patch(`/api/advisor/auth-change-password/${emailToken}`)
      .set("x-auth", user.tokens[0].token)
      .send({
        currentPassword: user.password,
        password: newPassword
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        User.findById(user._id)
          .then(user => {
            expect(bcrypt.compareSync(newPassword, user.password)).to.be.true;
            done();
          })
          .catch(err => done(err));
      });
  });

  it("should not change password if current password isnt provided", done => {
    const user = users[0];
    const newPassword = "123abc!50";
    const emailToken = jwt.sign(
      {
        _id: user._id.toHexString(),
        email: user.email
      },
      process.env.EMAIL_SECRET,
      {
        expiresIn: "2h"
      }
    );

    chai
      .request(app)
      .patch(`/api/advisor/auth-change-password/${emailToken}`)
      .set("x-auth", user.tokens[0].token)
      .send({
        password: newPassword
      })
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });

  it("should not change password if current password invalid", done => {
    const user = users[0];
    const newPassword = "123abc!50";
    const emailToken = jwt.sign(
      {
        _id: user._id.toHexString(),
        email: user.email
      },
      process.env.EMAIL_SECRET,
      {
        expiresIn: "2h"
      }
    );

    chai
      .request(app)
      .patch(`/api/advisor/auth-change-password/${emailToken}`)
      .set("x-auth", user.tokens[0].token)
      .send({
        currentPassword: "1234567",
        password: newPassword
      })
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });

  it("should not change password if new password invalid", done => {
    const user = users[0];
    const newPassword = "123abc!50";
    const emailToken = jwt.sign(
      {
        _id: user._id.toHexString(),
        email: user.email
      },
      process.env.EMAIL_SECRET,
      {
        expiresIn: "2h"
      }
    );

    chai
      .request(app)
      .patch(`/api/advisor/auth-change-password/${emailToken}`)
      .set("x-auth", user.tokens[0].token)
      .send({
        currentPassword: user.password,
        password: "123"
      })
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });

  it("should get error if token invalid", done => {
    chai
      .request(app)
      .patch(`/api/advisor/auth-change-password/5s6a1as6dg51s`)
      .set("x-auth", users[0].tokens[0].token)
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});

describe("PATCH /api/advisor/change-password/:emailToken?email=", () => {
  it("should change password", done => {
    const user = users[0];
    const emailToken = jwt.sign(
      {
        _id: user._id.toHexString(),
        email: user.email
      },
      process.env.EMAIL_SECRET,
      {
        expiresIn: "2h"
      }
    );
    const newPassword = "123abc!50";

    chai
      .request(app)
      .patch(`/api/advisor/change-password/${emailToken}?email=${user.email}`)
      .send({
        password: newPassword
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        User.findById(user._id)
          .then(user => {
            expect(bcrypt.compareSync(newPassword, user.password)).to.be.true;
            done();
          })
          .catch(err => done(err));
      });
  });

  it("should not change password if password invalid", done => {
    const user = users[0];
    const emailToken = jwt.sign(
      {
        _id: user._id.toHexString(),
        email: user.email
      },
      process.env.EMAIL_SECRET,
      {
        expiresIn: "2h"
      }
    );
    const newPassword = "123";

    chai
      .request(app)
      .patch(`/api/advisor/change-password/${emailToken}?email=${user.email}`)
      .send({
        password: newPassword
      })
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });

  it("should not change password if token invalid", done => {
    const user = users[0];
    const newPassword = "123abc!50";

    chai
      .request(app)
      .patch(
        `/api/advisor/change-password/${"fr6g1a6g5a1rg"}?email=${user.email}`
      )
      .send({
        password: newPassword
      })
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });

  it("should not change password if email is invalid", done => {
    const user = users[0];
    const emailToken = jwt.sign(
      {
        _id: user._id.toHexString(),
        email: user.email
      },
      process.env.EMAIL_SECRET,
      {
        expiresIn: "2h"
      }
    );
    const newPassword = "123abc!50";

    chai
      .request(app)
      .patch(`/api/advisor/change-password/${emailToken}?email=${"luigi.com"}`)
      .send({
        password: newPassword
      })
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
});
