var request = require('supertest');
const app = require('../server')
const agent = request.agent(app)
const User = require('../models/users.js');



describe('Login Page test', function () {
    it('load  page',function(done){
        request(app).get('/login')
        .expect(200,done)
    });
    
});

describe('User', function () {
    before(function(done) {
        user = new User({
          username    : "test",
          password : "test"
        });
        user.save(done)
      });
      
    describe('login user', function () {
        it('should redirect to /', function (done) {
          agent
          .post('/login')
          .field('username', 'test')
          .field('password', 'test')
          .expect('Location','/')
          .end(done)
        })
  
    after(function(done) {
        User.remove().exec();
        return done();
      });
  
  })
  })
