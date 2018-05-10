
var NebPay = require("nebpay");
var nebPay = new NebPay();
// var dappAddress="n21BpGpyzQN4NJW3eF8qo2GGTZcvxKWCKJ6"; //testnet
var dappAddress="n1mdH6HS1dGbyhPkaqoG5McqWMVoMTQJA69";
var nickname,account;
var isMain,lastID;
window.App = {
  start: function () {
    var self = this
    this.setStatus('正在加载中...')
    this.getAccount();
  },

  msg:function(msg){
    $('.warning-msg').text(msg);
    $('#warning').modal() 
  },

 

  getAccount:function(){
    var self=this;
    var to=dappAddress;
    nebPay.simulateCall(to, "0", "getAccount", "", {    
      listener: self.getAccountCB 
   });
  },

  setStatus:function(msg){
    $('#status').text(msg);
  },

  bottomTip:function(html){
    $('.status-bottom').html(html);
  },

  getAccountCB:function(cb){
      var result = JSON.parse(cb.result);
      nickname=result.name;
      var like=result.likeCount;
      account= result.account;
      $('.account-name').text(nickname);
      $('.account-like').text('被赞'+like+'次');
      App.setStatus('当前账户：'+account)
      console.log('account:' + account)
      App.initMainPage();
  },

  initMainPage: function () {
    console.log('nickname='+nickname)
    lastID=0;
    isMain=true;
    this.getMainStatus();
    if (nickname==''||nickname==null) {
      $('.setup-name').removeClass('hide');
      $('.post-status').addClass('hide');
    }
  },

  getMainStatus:function(){
    var self=this;
    this.bottomTip('状态加载中...');
    var callArgs = "["+lastID+"]";
      nebPay.simulateCall(dappAddress, "0", "getStatuses", callArgs, {    
        listener: self.getMainStatusCB
      });
  },
  getMainStatusCB:function(cb){
    var arr = JSON.parse(cb.result);
    if(arr.length>0)
    App.initStatuses(arr);
    else
    App.bottomTip('没有更多了');
  },

  getMyStatuses:function(){
    var self=this;
    isMain=false;
    lastID=0;
    $('.all-status').html('');
    this.bottomTip('状态加载中...');
    // var callArgs = "["+lastID+"]";
    nebPay.simulateCall(dappAddress, "0", "getMyStatuses", "", {    
      listener: self.getMyStatusesCB
    });
  },

  getMyStatusesCB:function(cb){
    App.getMainStatusCB(cb)
    console.log('getMyStatusesCB='+cb.result);
  },

  getMyLikes:function(){
    var self=this;
    isMain=false;
    lastID=0;
    $('.all-status').html('');
    this.bottomTip('状态加载中...');
    // var callArgs = "["+lastID+"]";
    nebPay.simulateCall(dappAddress, "0", "getMyLikes", "", {    
      listener: self.getMyLikesCB
    });
  },

  getMyLikesCB:function(cb){
    App.getMainStatusCB(cb);
    console.log('getMyLikesCB='+cb.result);
  },

  initStatuses: function (statuses) {
    console.log(statuses);
    var html = lastID>0? $('.all-status').html():'';
    statuses.forEach(s => {
      var like=s.like==null?'':s.like;
      var date=this.toTime(s.time);
      var str=s.from.substr(s.from.length-2,2);
      lastID=s.id;
      html += '<div class="card status-card mt-3 hide"><div class="card-body"><div class="row"><div class="col-1 "><div class="status-head">'+str+'</div></div><div class="col-11"><div class="row"><div class="col-8 status-name h4 ">'+s.name+'</div><div class="col-4 text-right "><button class="btn btn-mine" onclick="App.likeStatus('+s.id+')">赞 '+like+'</button></div></div><div class="status-time ">'+date+'</div><div class="status-text mt-3 h4">'+s.text+'</div><div class="status-from mt-2">#'+s.id+'#　From：'+s.from+'</div></div></div></div></div>	';
    });
    $('.all-status').html(html);
    $(".status-card").fadeIn(1000);
    var moreBtn='<button class="btn btn-secondary" onclick="App.getMainStatus()">加载更多</button>'
    var nullText='没有更多了';
    this.bottomTip(!isMain?nullText:statuses.length>=5?moreBtn:nullText);
  },


  toTime:function(ts){
    var date = new Date(ts*1000);
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
    var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    var m = (date.getMinutes() <10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    var s = (date.getSeconds() <10 ? '0' + date.getSeconds() : date.getSeconds());
    return h+m+s+'　'+Y+M+D;
},
 
  register:function(){
    var self=this;
    var name=$('#name-input').val().trim();
    if(name==''){
      this.msg('昵称不可为空')
    }else if(name.length>10){
      this.msg('昵称太长了，不可以');
    }else{
      this.msg("正在设置中...稍后自行刷新")
      var callArgs= "[\"" + name + "\"]";
      nebPay.call(dappAddress, "0", "register", callArgs, {    
          listener: self.registerCB
      });
    }
  },
  registerCB:function(cb){
    console.log('registerCB='+cb.result);
  },



  postStatus: function () {
    var self = this;
    var text=$('#status-input').val().trim();
    if(text==''){
      this.msg('博文不可为空')
    }else if(text.length>255){
      this.msg('博文太长了，不可以');
    }else{
      this.msg("正在发布中...稍后自行刷新")
      var callArgs= "[\"" + text + "\"]";
      nebPay.call(dappAddress, "0", "postStatus", callArgs, {    
          listener: self.postStatusCB
      });
    }
  },

  postStatusCB:function(cb){
    console.log('postStatusCB='+cb.result);
    // App.initMainPage();
  },

  likeStatus:function(id){
    var self=this;
    if(nickname==''||nickname==null){
      this.msg('起个名字吧')
    }else{
      this.msg("正在点赞中...稍后自行刷新")
      var callArgs= "[\"" + id + "\"]";
      nebPay.call(dappAddress, "0", "likeStatus", callArgs, {    
          listener: self.likeStatusCB
      });
    }
  },

  likeStatusCB:function(cb){
    console.log('likeStatusCB='+cb.result);
  },


 
};

window.addEventListener('load', function () {

  if(typeof(webExtensionWallet) === "undefined"){
    //alert ("Extension wallet is not installed, please install it first.")
    $("#noExtension").removeClass("hide");
    $(".container").addClass('hide');
  }else{
      App.start();
  }

  
});
