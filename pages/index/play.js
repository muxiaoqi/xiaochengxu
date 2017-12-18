// pages/index/play.js
const app = getApp()
const backgroundAudioManager = wx.getBackgroundAudioManager()
var mkPlayer = {
  api: 'https://iquanzi.wang/music/api.php',
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    musicUrl: '',
    audioAction: {
      method: 'pause'
    },
    name: '',
    author: '',
    musicLyric: {},
    toView: '',
    current_lyric: '',
    lastLyric: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.setData({
      name:　options.name,
      author: options.author+' - <'+options.album+'>'
    })

    console.log(options)
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else {
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

    // 获取歌曲链接
    wx.request({
      url: mkPlayer.api,
      data: { types: 'url', source: options.source, id: options.id },
      method: 'get',
      dataType: 'json',
      success: function (e) {
        that.setData({
          musicUrl: e.data.url
        });
        //  后台播放
        backgroundAudioManager.title = that.data.name
        backgroundAudioManager.epname = that.data.name
        backgroundAudioManager.singer = that.data.author
        backgroundAudioManager.src = that.data.musicUrl
      }
    })
    // 获取歌词信息
    wx.request({
      url: mkPlayer.api,
      data: {types: 'lyric', source: options.source, id: options.lyric_id},
      method: 'get',
      dataType: 'json',
      success: function (e) {
        if (e.data.lyric) {
          var lyricObj = '';
          // console.log(e.data.lyric)
          lyricObj = that.parseLyric(e.data.lyric);
          that.setData({
            musicLyric: lyricObj
          })
          backgroundAudioManager.onTimeUpdate(function () {
            
            if (lyricObj === '') return false;
            var time = 0;
            time = parseInt(backgroundAudioManager.currentTime);
            
            if (lyricObj === undefined || lyricObj[time] === undefined) return false;  // 当前时间点没有歌词
            if (that.data.lastLyric == time) return true;  // 歌词没发生改变
            
            that.data.lastLyric = time;  // 记录方便下次使用

            that.setData({
              'toView': 'lyc_' + time,
              'current_lyric': time
            })
          })
        }
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        console.error(XMLHttpRequest + textStatus + errorThrown);
      }
    })

    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 使用 wx.createAudioContext 获取 audio 上下文 context
    this.audioCtx = wx.createAudioContext('myAudio')
    
  },

  audioPlay: function () {
    this.audioCtx.play()
  },

  audioPause: function () {
    this.audioCtx.pause()
  },

  audioStart: function () {
    this.audioCtx.seek(0)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  parseLyric: function (lrc) {
    if (lrc === '') return '';
    var lyrics = lrc.split("\n");
    var lrcObj = {};
    for (var i = 0; i < lyrics.length; i++) {
      var lyric = decodeURIComponent(lyrics[i]);
      var timeReg = /\[\d*:\d*((\.|\:)\d*)*\]/g;
      var timeRegExpArr = lyric.match(timeReg);
      if (!timeRegExpArr) continue;
      var clause = lyric.replace(timeReg, '');
      for (var k = 0, h = timeRegExpArr.length; k < h; k++) {
        var t = timeRegExpArr[k];
        var min = Number(String(t.match(/\[\d*/i)).slice(1)),
          sec = Number(String(t.match(/\:\d*/i)).slice(1));
        var time = min * 60 + sec;
        lrcObj[time] = clause;
      }
    }
    return lrcObj;
  },

  scrollLyc: function (e) {

    if (this.data.musicLyric === '') return false;
    var time = 0;
    time = parseInt(e.detail.currentTime);

    if (this.data.musicLyric === undefined || this.data.musicLyric[time] === undefined) return false;  // 当前时间点没有歌词
    if (this.data.lastLyric == time) return true;  // 歌词没发生改变

    this.data.lastLyric = time;  // 记录方便下次使用

    this.setData({
      'toView': 'lyc_' + time,
      'current_lyric': time
    })
  }
})