
// pages/map/map.js
const app = getApp();
// 引用百度地图微信小程序JSAPI模块
const BMap = require('../../libs/bmap-wx.min.js');
var bmap;
var util = require('../../utils/util.js');
const pinIcon = '../../public/image/lushu.png';
const poiIcon = '../../public/image/location.png';
const sltIcon = '../../public/image/location-selected.png';
Page({
  mapCtx: undefined,
  /**
   * 页面的初始数据
   */
  data: {
    result: [],
    searchCon:'',     //输入内容
    searchResult:[],  //搜索列表
    
    // 这两个属性用于定位地图中心，修改时会触发regionchange
    // 但是regionchange的时候不会刷新这两个量，否则将导致循环调用
    longitude: '', 
    latitude: '',

    // 这两个属性用来刷新下方显示的坐标
    center: { longitude: '', latitude: ''},

    // 控制选点标签
    lockPicker: false,
    showPicker: false,
    initial: true,

    path_longitude: '',
    path_latitude:'',
    address: '',
    scale: 13, //地图的扩大倍数
    des_lat: '',//目的地纬度
    des_lng: '',//目的地经度
    user_path:[],
    car_num:'',

    // 这两个数组对象由腾讯地图API原生支持
    polylines: [],
    markers: [
    { //标记点用于在地图上显示标记的位置
      id: 1,
      latitude: '',
      longitude: '',
      iconPath: poiIcon,
      width: 30,
      height: 30,
    },
    ],
    carLocation:[{
      "id": 1,
      "lat":"121.449043",
      "lng": "31.031268",
      "desc":"电信群楼5号楼东侧路边(环一路)",
      "name": "car_1"
    },{
      "id": 2,
      "lat":"121.447176",
      "lng": "31.033731",
      "desc":"新行政楼",
      "name": "car_2"
    },{
      "id": 3,
      "lat":"121.444233",
      "lng": "31.031201",
      "desc":"研究生院",
      "name": "car_3"
    },{
      "id": 4,
      "lat":"121.452375",
      "lng": "31.03736",
       "desc":"船舶海洋与建筑工程学院",
      "name": "car_4"
    },{
       "id": 5,
       "lat":"121.437649",
        "lng": "31.024924",
        "desc":"思源门行政楼",
        "name": "car_4"
    }]


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:function(options) {

    // 实例化百度地图API核心类
    bmap = new BMap.BMapWX({
      ak: app.globalData.ak
    });
    
    //获取当前位置经纬度
    const that = this;
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        console.log('Current Location: ', res);
        that.setData({
          longitude: res.longitude,
          latitude: res.latitude,
          center: res,
        });

      }
    })

    // 创建地图上下文
    this.mapCtx = wx.createMapContext("myMap");
  },

  // 绑定input输入 --搜索
  bindKeyInput(e){
    var that = this; 
    var fail = function (data) { //请求失败
      console.log(data) 
    };
    var success = function (data) { //请求成功
      var searchResult =[];
      for(var i=0;i<data.result.length;i++){ //搜索列表只显示10条
        if(i>10){ 
          return;
        }
        if (data.result[i].location){
          searchResult.push(data.result[i]);
        }
      }
      that.setData({
        searchResult: searchResult
      });
    }

    // 发起suggestion检索请求 --模糊查询
    bmap.suggestion({
      query: e.detail.value,
      city_limit: false,
      fail: fail,
      success: success
    });
  },

  // 点击搜索列表某一项
  tapSearchResult(e){
    var that = this;
    var value = e.currentTarget.dataset.value;
    var str = 'markers[0].longitude', str2 = 'markers[0].latitude';
    that.setData({
      lockPicker: true,
      showPicker: false,
      longitude: value.location.lng,
      latitude: value.location.lat,
      searchResult:[],
      searchCon: value.name,
      address: value.province+value.city + value.district+value.name,
      [str]: value.location.lng,
      [str2]: value.location.lat,
    })

  },
  
 
  // 这个方法没用
  // getLngLat: function() {
  //   var that = this;
  //   this.mapCtx = wx.createMapContext("myMap");
  //   var latitude, longitude;
  //   this.mapCtx.getCenterLocation({
  //     success: function(res) {
  //       latitude = res.latitude;
  //       longitude = res.longitude;
  //       var str = 'markers[0].longitude',
  //         str2 = 'markers[0].latitude';
  //       var array = [];
  //       /**
  //        * 将GCJ-02(火星坐标)转为百度坐标
  //        */
  //       var result2 = util.transformFromGCJToBaidu(res.longitude, res.latitude);
  //       console.log("Center location: ", result2)
  //       array.push(result2);
  //       that.setData({
  //         longitude: res.longitude,
  //         latitude: res.latitude,
  //         [str]: res.longitude,
  //         [str2]: res.latitude,
  //         result: array,
  //       })
  //       //that.regeocoding();
  //     }
  //   })

  //   //平移marker，修改坐标位置 
  //    this.mapCtx.translateMarker({
  //      markerId: 1,
  //      autoRotate: true,
  //      duration: 1000,
  //      destination: {
  //        latitude: latitude,
  //        longitude: longitude,
  //      },
  //      animationEnd() {
  //        console.log('animation end')
  //      }
  //    })
  // },

  //地图位置发生变化
  regionchange(e) {
    // 地图发生变化的时候，获取中间点，也就是用户选择的位置
    if (e.type == 'begin' && !this.data.initial && !this.data.lockPicker)
      this.setData({ showPicker: true });
    if (!(e.type == 'end' && e.causedBy == 'drag') && !this.data.initial)
      return;
    let that = this;
    this.mapCtx.getCenterLocation({
      success: (res) => { 
        this.setData({
          center: res
        });
        bmap.regeocoding({
          success: (res) => {
            this.setData({
              address: res.wxMarkerData[0].address
            })
          },
          fail: (res) => { console.warn('regeocoding failed', res.message) },
          location: that.data.center.latitude + ',' + that.data.center.longitude
        })
      },
      fail: (res) => { console.warn(res) },
      complete: () => { console.log()}
    });
    this.setData({initial: false});
  },
  
  markertap(e) {
    console.log(e.markerId)
    for(var i = 0; i < this.data.markers.length; ++i) {
      if (marker[i].id == e.markerId)
        this.setData({
          ['markers['+ i +'].iconPath']: sltIcon 
        })
    }
    //this.regionchange(e)
    // this.getLngLat();
    console.log(e);
  },
  controltap(e) {
    var that = this;
    console.log("scale===" + this.data.scale)
    if (e.controlId === 1) {
      that.setData({
        scale: ++this.data.scale
      })
    } else {
      that.setData({
        scale: --this.data.scale
      })
    }
  },
  click: function() {
    this.getLngLat()
  },

  //提示
  // tipsModal: function (msg) {
  //   wx.showModal({
  //     title: '提示',
  //     content: msg,
  //     showCancel: false,
  //     confirmColor: '#2FB385'
  //   })
  // },

  downloadFile: function () {
    wx.downloadFile({
      url: 'http://yqxspj.natappfree.cc/ocean/download',
      success(res) {
        console.log(res)
        // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
        if (res.statusCode === 200) {
          wx.saveFile({
            tempFilePath: res.tempFilePath,
            success: function (res) {
              console.log(res)
              var savedFilePath = res.savedFilePath
              console.log("文件已下载到：" + savedFilePath)
              wx.getSavedFileList({
                success: function (res) {
                  console.log(res)
                }
              })
              wx.openDocument({
                filePath: savedFilePath,
                success: function (res) {
                  console.log('打开文档成功')
                }
              })
            }
          })
          // wx.playVoice({
          //   filePath: res.tempFilePath
          // })
        }
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  

  //接口数据库函数：
  sendData:function(){
    const that = this;
    var tmp = [];
    wx.request({
      //发送当前经纬度信息
      url:'http://server.natappfree.cc:44285/ocean/get_closet_ugv_id?start_lat=this.data.latitude&start_lng=this.data.longitude', 
      header: { 'content-type': 'application/json' },
      data: {
        //data部分目的地经纬度信息需要用户根据中心点图标移动获取
        start_lat: this.data.latitude,
        start_lng: this.data.longitude,
        mid_lat:(parseFloat(this.data.latitude)+parseFloat(this.data.markers[0].latitude))/2,
        mid_lng: (parseFloat(this.data.longitude)+parseFloat(this.data.markers[0].longitude))/2,
        des_lat: this.data.markers[0].latitude,
        des_lng: this.data.markers[0].longitude
      },
      method: 'get',
      success: function (res) {
        console.log("成功");
        console.log(res);
        that.setData({
            car_num:res.data.car_num,
            distance: res.data.distance,
            arrived_time:res.data.arrived_time,
            car_lat: res.data.car_lat,
            car_lng:res.data.car_lng,
            user_path:res.data.user_path
        })
      },
    })

    for (tmp in this.data.user_path){
      console.log(this.data.user_path[tmp].lat)
      var str = 'markers[1].longitude',
          str2 = 'markers[1].latitude';
      that.setData({
        path_longitude: this.data.user_path[tmp].lng,
        path_latitude: this.data.user_path[tmp].lat,
        [str]: this.data.path_longitude,
        [str2]: this.data.path_latitude,
      })
    }
    //this.data.markers[1].latitude='121.381845';
    //this.data.markers[1].latitude='31.1116';
    
    //var polyline = new BMap.Polyline([new BMap.Point(31.1116,121.381845),new BMap.Point(31.1048,121.405)],{strokeColor: "blue", strokeWeight: 6, strokeOpacity: 0.5});
  },  
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})