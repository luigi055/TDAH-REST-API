const chai = require('chai');
const chaiHTTP = require('chai-http');
const {
  ObjectID
} = require('mongodb');
const app = require('./../server');
const Patient = require('./../models/patient');
const {
  users,
  patients,
  populatePatients
} = require('./seed/seed');

const expect = chai.expect;
chai.use(chaiHTTP);

beforeEach(populatePatients);

describe('POST /api/patients', () => {
  it('should add new patient', done => {
    chai.request(app)
      .post('/api/patients')
      .set('x-auth', users[0].tokens[0].token)
      .send({
        name: 'Jane',
        lastname: 'Taylor',
        age: 13,
      })
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(200);
        expect(res.body.name).to.be.equal('Jane');
        expect(res.body._id).to.exist;

        Patient.findById(res.body._id).then(user => {
          expect(user._creator).to.be.deep.equal(users[0]._id)
          expect(user._id).to.exist;
          expect(user.name).to.be.equal('Jane');
          expect(user.lastname).to.be.equal('Taylor');
          expect(user.age).to.be.equal(13);
          done();
        }).catch(err => done(err));
      });
  });

  it('should not add new patient if send empty patient', done => {
    chai.request(app)
      .post('/api/patients')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('should not add new patient if left any property', done => {
    chai.request(app)
      .post('/api/patients')
      .set('x-auth', users[0].tokens[0].token)
      .send({
        name: 'Jhon',
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it('should get error 401 if unauthorized', done => {
    chai.request(app)
      .post('/api/patients')
      .send({
        name: 'Jhon',
        lastname: 'Doe',
        age: 15,
      })
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});

describe('GET /api/patients/:id', () => {
  it('should get a patient by id', done => {
    const patientId = patients[1]._id.toHexString();
    chai.request(app)
      .get(`/api/patients/${patientId}`)
      .set('x-auth', users[1].tokens[0].token)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.name).to.be.equal(patients[1].name);
        expect(res.body._id).to.be.equal(patientId);
        done();
      });
  });

  it('should not get a patient is from a different creator', done => {
    const patientId = patients[1]._id.toHexString();
    chai.request(app)
      .get(`/api/patients/${patientId}`)
      .set('x-auth', users[0].tokens[0].token)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body.error).to.be.equal('patient not found');
        done();
      });
  });

  it('should not get a patient if not authenticated', done => {
    const patientId = patients[1]._id.toHexString();
    chai.request(app)
      .get(`/api/patients/${patientId}`)
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });

  it('should not get a patient if id invalid', done => {
    chai.request(app)
      .get(`/api/patients/123`)
      .set('x-auth', users[0].tokens[0].token)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body.error).to.be.equal('Invalid ID');
        done();
      });
  });

  it('should not get a patient if id not found', done => {
    const anyId = new ObjectID().toHexString();
    chai.request(app)
      .get(`/api/patients/${anyId}`)
      .set('x-auth', users[0].tokens[0].token)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body.error).to.be.equal('patient not found');
        done();
      });
  });
});

describe('GET /api/patients', () => {
  it('should get all patients created by userOne', done => {
    chai.request(app)
      .get('/api/patients')
      .set('x-auth', users[0].tokens[0].token)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array').that.have.lengthOf(1);
        Patient.find({
          _creator: users[1]._id
        }).then(patients => {
          expect(patients).to.be.an('array').that.have.lengthOf(1);
          done();
        }).catch(err => done(err));
      });
  });

  it('should get all patients created by userTwo', done => {
    chai.request(app)
      .get('/api/patients')
      .set('x-auth', users[1].tokens[0].token)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array').that.have.lengthOf(1);

        Patient.find({
          _creator: users[1]._id
        }).then(patients => {
          expect(patients).to.be.an('array').that.have.lengthOf(1);
          done();
        }).catch(err => done(err));
      });
  });

  it('should not get patients if not authenticated', done => {
    chai.request(app)
      .get('/api/patients')
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});

describe('DELETE /api/patients', () => {
  it('should delete a patient', (done) => {
    const patientId = patients[0]._id.toHexString();
    chai.request(app)
      .delete(`/api/patients/${patientId}`)
      .set('x-auth', users[0].tokens[0].token)
      .end((err, res) => {
        expect(res).to.have.status(200);

        Patient.find({
          _creator: users[0]._id.toHexString(),
        }).then(users => {
          expect(users).to.be.an('array').that.is.empty;
          done();
        }).catch(err => done(err));
      });
  });

  it('should not delete a patient if not creator', (done) => {
    const patientId = patients[1]._id.toHexString();
    chai.request(app)
      .delete(`/api/patients/${patientId}`)
      .set('x-auth', users[0].tokens[0].token)
      .end((err, res) => {
        expect(res).to.have.status(404);

        Patient.find({
          _creator: users[0]._id.toHexString(),
        }).then(patients => {
          expect(patients).to.be.an('array').that.have.lengthOf(1);
          done();
        }).catch(err => done(err));
      });
  });

  it('should not delete a patient if invalid id', (done) => {
    const patientId = '123';
    chai.request(app)
      .delete(`/api/patients/${patientId}`)
      .set('x-auth', users[0].tokens[0].token)
      .end((err, res) => {
        expect(res).to.have.status(404);

        Patient.find({
          _creator: users[0]._id.toHexString(),
        }).then(patients => {
          expect(patients).to.be.an('array').that.have.lengthOf(1);
          done();
        }).catch(err => done(err));
      });
  });

  it('should not delete a patient if id not found', (done) => {
    const anyId = new ObjectID().toHexString();
    chai.request(app)
      .delete(`/api/patients/${anyId}`)
      .set('x-auth', users[0].tokens[0].token)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body.error).to.be.equal('patient not found');
        Patient.find({
          _creator: users[0]._id.toHexString(),
        }).then(patients => {
          expect(patients).to.be.an('array').that.have.lengthOf(1);
          done();
        }).catch(err => done(err));
      });
  });

  it('should not delete a patient if user not authenticated', (done) => {
    const patientId = patients[0]._id.toHexString();
    chai.request(app)
      .delete(`/api/patients/${patientId}`)
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});

describe('PATCH /api/patients/:id', () => {
  it('should modify any value of a specific patient', done => {
    const hexId = patients[0]._id.toHexString();
    const modifiedPatient = {
      name: 'Julio Jose',
      lastname: 'Romero',
      age: 21,
      avance: 55,
    };
    chai.request(app)
      .patch(`/api/patients/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send(modifiedPatient)
      .end((err, res) => {
        expect(res).to.have.status(200);
        Patient.findById(hexId).then(patient => {
          expect(patient.name).to.be.equal(modifiedPatient.name);
          expect(patient.age).to.be.equal(modifiedPatient.age);
          expect(patient.avance).to.exist.and.to.be.equal(modifiedPatient.avance);
          expect(patient.lastname).to.be.equal(modifiedPatient.lastname);
          done();
        });
      });
  });
  it('should not modify any value of not the creator', done => {
    const hexId = patients[1]._id.toHexString();
    const modifiedPatient = {
      name: 'Julio Jose',
      lastname: 'Romero',
      age: 21,
      avance: 55,
    };
    chai.request(app)
      .patch(`/api/patients/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send(modifiedPatient)
      .end((err, res) => {
        expect(res).to.have.status(404);
        done()
      });
  });

  it('should not modify patient if id not found', done => {
    const hexId = new ObjectID().toHexString();
    const modifiedPatient = {
      name: 'Julio Jose',
      lastname: 'Romero',
      age: 21,
      avance: 55,
    };
    chai.request(app)
      .patch(`/api/patients/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send(modifiedPatient)
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });

  it('should not modify patient if id invalid', done => {
    const hexId = '123';
    const modifiedPatient = {
      name: 'Julio Jose',
      lastname: 'Romero',
      age: 21,
      avance: 55,
    };
    chai.request(app)
      .patch(`/api/patients/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send(modifiedPatient)
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
  it('should not modify any patient if not authenticated', done => {
    const hexId = '123';
    const modifiedPatient = {
      name: 'Julio Jose',
      lastname: 'Romero',
      age: 21,
      avance: 55,
    };
    chai.request(app)
      .patch(`/api/patients/${hexId}`)
      .send(modifiedPatient)
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});