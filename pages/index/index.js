//index.js
//获取应用实例
const app = getApp()
var mkPlayer = {
  api: 'https://iquanzi.wang/music/api.php',
  loadcount: 20,
  method: "POST",
  defaultlist: 3,
};
Page({
  data: {
    motto: 'Hello World',
    artist_list: {},
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    console.log(this.data.artist_list)
    var that = this;
    this.innerAudioContext = wx.createInnerAudioContext()
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }

  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  formSubmit: function(e){
    // console.log(e.detail.value);
    var formData = e.detail.value
    var wd = formData.wd;
    if (!wd) {
      return false;
    }
    var loadPage = 1;
    var source = formData.source;
    var that = this;
    wx.request({
      url: mkPlayer.api,
      data: {types: 'search', count: mkPlayer.loadcount, source: source, pages: loadPage, name: wd}, 
      method: 'GET',
      dataType: "json",
      success: function (jsonData) {
        var musicList = [];
        var tempItem = [];
        for (var i = 0; i < jsonData.data.length; i++) {
          tempItem = {
            id: jsonData.data[i].id,  // 音乐ID
            name: jsonData.data[i].name,  // 音乐名字
            artist: jsonData.data[i].artist[0], // 艺术家名字
            album: jsonData.data[i].album,    // 专辑名字
            source: jsonData.data[i].source,     // 音乐来源
            url_id: jsonData.data[i].url_id,  // 链接ID
            pic_id: jsonData.data[i].pic_id,  // 封面ID
            lyric_id: jsonData.data[i].lyric_id,  // 歌词ID
            pic: null,    // 专辑图片
            url: null   // mp3链接
          };
          
          musicList.push(tempItem);   // 保存到搜索结果临时列表中
        }
        console.log(musicList);
        that.setData({
          artist_list: musicList
        })

      },   //success
      fail: function (XMLHttpRequest, textStatus, errorThrown) {
        // layer.msg('搜索结果获取失败 - ' + XMLHttpRequest.status);
        console.error(XMLHttpRequest + textStatus + errorThrown);
      }
    });
    // console.log(that.artist_list)
  },
  play: function(event){
    var that = this;

     wx.request({
      url: mkPlayer.api,
      data: {types: 'url', source: event.currentTarget.dataset.source, id: event.currentTarget.dataset.id},
      method: 'get',
      dataType: 'json',
      success: function(e){
        var musicUrl = e.data.url;
        
        if (!that.innerAudioContext.paused) {
          that.innerAudioContext.stop();
        }
        that.innerAudioContext.autoplay = true
        that.innerAudioContext.src = musicUrl
        that.innerAudioContext.onPlay(() => {
          console.log('开始播放')
        })
        that.innerAudioContext.onError((res) => {
          console.log(res.errMsg)
          console.log(res.errCode)
        })
        // console.log(e)
        // console.log(e.data.url);
      }
    });
  },
})


