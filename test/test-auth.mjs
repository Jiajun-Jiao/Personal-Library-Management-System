// npx mocha --loader=mock-import test/test-auth.mjs

/* eslint-disable-file no-unused-expressions: 0 */
import bcrypt from 'bcryptjs';
import chai from 'chai';
const expect = chai.expect; 
import {createMockImport} from 'mock-import';
import {User} from './mock-user.mjs';

const {mockImport, reImport, stopAll, enableNestedImports} = createMockImport(import.meta.url);
console.log(mockImport, reImport, stopAll);


mockImport('mongoose', {
  model() {
    return User;
  },
  foo() {console.log('foo')},
  connect() { }
});

const auth = await reImport('../src/auth.mjs');


describe('ERROR1', function(){
  it('should call error function with "ENTERED DIFFERENT NEW PASSWORD" when user entered two different new password', function(done){
    function error(obj) { 
      expect(obj).to.equal('ENTERED DIFFERENT NEW PASSWORD');
      done();
    }
    auth.reset({}, "", "123", "234", error, console.log);    
  });
});

describe('ERROR2', function(){
  it('should call error function with "PASSWORD TOO SHORT" when user entered an old password with length < 8', function(done){
    function error(obj) { 
      expect(obj).to.equal('PASSWORD TOO SHORT');
      done();
    }
    auth.reset({}, "111", "12345678", "12345678", error, console.log);    
  });

  it('should call error function with "PASSWORD TOO SHORT" when user entered a new password with length < 8', function(done){
    function error(obj) { 
      expect(obj).to.equal('PASSWORD TOO SHORT');
      done();
    }
    auth.reset({}, "88888888", "123", "123", error, console.log);    
  });
});

describe('ERROR3', function(){
  it('should call error function with "PASSWORDS DO NOT MATCH" when user entered an incorrect old password', function(done){
    function error(obj) { 
      expect(obj).to.equal('PASSWORDS DO NOT MATCH');
      done();
    }
    bcrypt.hash("88888888", 10, function(err, hash){
      auth.reset({
        "username": "testtest",
        "password": hash
      }, "88888889", "12345678", "12345678", error, console.log);    
    });
  });
});

describe('PASS1', function(){
  it('should call success function with new password as its second parameter when user entered everything correctly', function(done){
    function error(obj) { 
      expect(obj).to.equal('PASSWORDS DO NOT MATCH');
      done();
    }
    function success(user, newpswd) { 
      expect(newpswd).to.equal('12345678');
      done();
    }
    bcrypt.hash("88888888", 10, function(err, hash){
      auth.reset({
        "username": "testtest",
        "password": hash
      }, "88888888", "12345678", "12345678", error, success);    
    });
  });
});