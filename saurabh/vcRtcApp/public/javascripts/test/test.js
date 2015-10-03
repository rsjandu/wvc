$( document ).ready(function() {
  console.log( "ready! calling __init" );
  __init();
  console.log( "calling test" );
        test();
});

function __init()
{
  var _d = $.Deferred();

  func1()
    .then ( func2(), fail())
    ;

  function fail() {
    console.log('failed');
    _d.reject();
  }

  return _d.promise();

}


function func1() {
  console.log('func1');
  var _d = $.Deferred();

  function myfunc1() {
    console.log('myFunc1');
    _d.resolve();
  }

  setTimeout(myfunc1, 10000);

  function fail() {
    console.log('func1 failed');
    _d.resolve();
  }

  return _d.promise();
}


function func2() {
  console.log('func2');
  var _d = $.Deferred();

  function myfunc2() {
    console.log('myFunc2');
    _d.resolve();
  }

  setTimeout(myfunc2, 10000);

  function fail() {
    console.log('func2 failed');
    _d.resolve();
  }

  return _d.promise();
}
function a(arg){
  console.log('inside a with arg:' + arg);
  var deferred = $.Deferred();
  setTimeout(function(){
    console.log("status in a:",deferred.state());
    //this should trigger calling a or not?
    deferred.resolve("from a");
  },5000);
  console.log("a");
  return deferred.promise();
}

function b(arg){
  console.log('inside b with arg:' + arg);
  var deferred = $.Deferred();
  setTimeout(function(){
    console.log("status in b:",deferred.state());
    deferred.resolve("from b");
  },20000);
  console.log("b");
  return deferred.promise();
}
//synchronous function
function c(arg){
  console.log('inside c with arg:' + arg);
  var deferred = $.Deferred();
  console.log("c");
  console.log("status in c:",deferred.state());
  deferred.resolve("from c");
  return deferred.promise();
}
function test(){
  var d = jQuery.Deferred(),
  p=d.promise();
  //instead of the loop doing the following has the same output
  p.then(a).then(b).then(c);
  d.resolve();
}
