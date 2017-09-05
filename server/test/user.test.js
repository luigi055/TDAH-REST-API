const expect = require('chai').expect;
const request = require('supertest');
const bcrypt = require('bcryptjs')
const app = require('./../server');
const User = require('./../models/user');
const {
  users,
  populateUsers
} = require('./seed/seed');

populateUsers();

describe('POST /api/advisor', () => {
  it('should add a brand new user', done => {

    const email = 'luigi4@test.com';
    const password = '123abc!';

    request(app)
      .post('/api/advisor')
      .send({
        email,
        password
      })
      .expect(200)
      .expect(res => {
        expect(res.header['x-auth']).to.exist;
        expect(res.body.email).to.be.equal('luigi4@test.com')
      })
      .end((err, res) => {
        if (err) return done(err);
        // We'll find the new user created
        User.findOne({
          email
        }).then(user => {
          // make sure it created the new user with the same email
          expect(user).to.be.an('object').that.exist;
          expect(user.email).to.be.equal(email);
          // make sure it hashed properly and if the password
          // match with the hashed password
          bcrypt.compare(password, user.password, (err, userPw) => {
            expect(userPw).to.be.true;
            done();
          });
        }).catch(err => done(err));
      });
  });

  it('should get error 400 if invalid user and passowrd', done => {
    request(app)
      .post('/api/advisor')
      .send({
        email: 'john@mai',
        password: '45s'
      })
      .expect(400)
      .end(done);
  });

  it('should get error 400 if email already in use', done => {
    const {
      email,
      password,
    } = users[0];

    request(app)
      .post('/api/advisor')
      .send({
        email,
        password,
      })
      .expect(400)
      .end(done);
  })
});

describe('POST /api/advisor/login', () => {
  it('should login an existing user', done => {
    request(app)
      .post('/api/advisor/login')
      .send({
        email: users[1].email,
        password: users[1].password,
      })
      .expect(200)
      .expect((res) => {
        expect(res.header['x-auth']).to.exist;
        expect(res.body._id).to.be.a('string').that.is.equal(users[1]._id.toHexString());
        expect(res.body.email).to.be.equal(users[1].email);
      })
      .end((err, res) => {
        if (err) return done(err);

        User.findById(users[1]._id).then(user => {
          expect(user.tokens).is.an('array').that.have.lengthOf(2);
          expect(user.tokens[1]).to.deep.include({
            access: 'auth',
            token: res.header['x-auth'],
          })
          done();
        }).catch(err => done(err));
      });
  });

  it('should not login if any data is incorrect', done => {
    request(app)
      .post('/api/advisor/login')
      .send({
        email: 'luigi@test',
        password: '123',
      })
      .expect(404)
      .end(done);
  });

  it('should not login if user not found', done => {
    request(app)
      .post('/api/advisor/login')
      .send({
        email: 'saitama@hotmail.com',
        password: '123abc!',
      })
      .expect(404)
      .end(done);
  });
});

describe('GET /api/advisor/me', () => {
  it('should get the current logedin user', done => {
    request(app)
      .get('/api/advisor/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end(done);
  });

  it('should not get the current loggedin user if not authenticated', done => {
    request(app)
      .get('/api/advisor/me')
      .expect(401)
      .end(done);
  });
});

describe('DELETE /api/advisor/logout', () => {
  it('should remove token from user and logout', done => {
    request(app)
      .delete('/api/advisor/logout')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.header['x-auth']).to.not.exist;
      })
      .end((err, res) => {
        if (err) return done(err);
        User.findById(users[0]._id).then(user => {
          expect(user.tokens).to.have.lengthOf(0);
          expect(user.tokens).to.be.an('array').that.is.empty;
          done();
        }).catch(err => done(err));
      });

    it('should not remove token if not authenticated', done => {
      request(app)
        .delete('/api/advisor/logout')
        .expect(401)
        .end(done);
    });
  });
});