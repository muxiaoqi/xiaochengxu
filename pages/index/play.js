// pages/index/play.js
const app = getApp()
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
    author: ''
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
        })
      }
    })

    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
  navigateBack: function (e) {
    var self = this;
    var pages = getCurrentPages();
    wx.navigateBack({ changed: true });
  }
})