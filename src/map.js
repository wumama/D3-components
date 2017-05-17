/**
 * @Author:      wuqin
 * @DateTime:    2017-04-17 17:06:30
 * @Description: 地图组件
 * @Last Modified By:   wuqin
 * @Last Modified Time:    2017-04-17 17:06:30
 */
define(function(require){
  /**
   *  请用公用文件
   */
  require('d3')
  require('jquery')
  require('lodash')

  //变量
  var cfg = {}
  var mapZindex = 1

  var map = {
    /**
     *  [defaultSetting] 地图配置项
     */
    defaultSetting: function(){
      var width = 400
      var height = 200
      return{
        width: width,
        height: height,
        unit: '人',
        id: 'map',
        area: 'chongqing',
        label: {
          fontSize: '16px',
          color: '#fff'
        },
        mapStyle: {
          fillColor: '#09133b',
          stroke: '#0232ac',
          strokeWidth: '2',
          highFillColor: '#1860d1'
        },
        markPoint: {
          symbol: 'circle',
          fill: '#fff',
          imgUrl: '../doc/img/d.png',
          width: '10px',
          height: '10px',
          radius: '10px'
        }

      }

    },
    /**
     *  @[init]  初始化
     *  @param {object} opt 配置项
     *  @param {array} data 数据
     */
    init: function(opt, data){
      var _self = this
      /**
       *  _.merge
       *  该方法类似_.assign， 除了它递归合并 sources 来源对象自身和继承的可枚举属性到 object 目标对象。
       *  如果目标值存在，被解析为undefined的sources 来源对象属性将被跳过。
       *  数组和普通对象会递归合并，其他对象和值会被直接分配覆盖。源对象从从左到右分配。
       *  后续的来源对象属性会覆盖之前分配的属性。
       *  object (Object): 目标对象。
       *  [sources] (...Object): 来源对象。
       *  
       *  _.assign(object, [sources])
       *  object (Object): 目标对象。
       *  [sources] (...Object): 来源对象。
       *  分配来源对象的可枚举属性到目标对象上。 
       *  来源对象的应用规则是从左到右，随后的下一个对象的属性会覆盖上一个对象的属性。 
       */
      cfg = _.merge({}, this.defaultSetting(), opt)
      var jsonUrl = './../data/map/'+ cfg.area + '.json'
      
      var mapDatas = [] //存放地图数据
      for (var i = 0, len = data.length; i < len; i++) {
        var mapDetail = data[i]
        mapDatas.push({
          code: mapDetail.code,
          name: mapDetail.name,
          value: mapDetail.value + cfg.unit
        })
      }
      _self.drawMap(jsonUrl, mapDatas)

    },
    /**
     *  @[drawMap]  绘制地图
     *  @param {string} jsonUrl 接口地址
     *  @param {mapDatas} mapDatas 后端返回的数据
     */
    drawMap: function(jsonUrl, mapDatas){

      var _self = this
      //设置画布
      var svg = d3.select('#' + cfg.id)
        .html('')
        .append('svg')
        .attr('width', cfg.width)
        .attr('height', cfg.height)


      var tooltip = d3.select('#' + cfg.id)
        .append('div')
        .attr('id', 'tooltip')
        .style('display', 'none')

      //向服务器请求文件并绘制地图
      d3.json(jsonUrl, function(error,root){
        if (error) 
          return console.error(error)

          //控制地图缩放的大小
        var scale = _self.getZoomScale(root.features, cfg.width, cfg.height),
            center = _self.getCenters(root.features)

        //投影函数
        var projection = d3.geo.mercator()
          .center(center)  //设置地图的中心位置，[107,31]指的是经度和纬度。
          .scale(scale * 50)  //设定放大的比例
          .translate([cfg.width/2, cfg.height/2])  //设定平移
        //地图路径的生成器
        var path = d3.geo.path()
          .projection(projection)

        var mapStyle = cfg.mapStyle
        var mapSvg = svg.append('g')
          .selectAll('path')
          .data(root.features)
          .enter()
          .append('path')
          .attr('d', path)
          .attr('fill', mapStyle.fillColor)
          .attr('stroke', mapStyle.stroke)
          .attr('stroke-width', mapStyle.strokeWidth)
          .on('mouseover', function(d,i){
            d3.select(this)
              .attr('fill', mapStyle.highFillColor)

            var pos = path.centroid(d)  //计算出地图的中心位置
            var name = d.properties.MC
            var ZZJGDM = d.properties.ZZJGDM.substring(0, 6)
            
            if (mapDatas) {
              var tooltipData = {
                  name: name,
                  value: '暂无数据'
                }
              _self.tooltip(tooltip, tooltipData , pos)
            }

            for (var i = 0, len = mapDatas.length; i < len; i++) {
              if (ZZJGDM == mapDatas[i].code) {
                _self.tooltip(tooltip, mapDatas[i], pos)
                return false
              }else{
                var tooltipData = {
                  name: name,
                  value: '暂无数据'
                }
                _self.tooltip(tooltip, tooltipData , pos)
              }
            }
            

            
          })
          .on('mouseout', function(d,i){
            d3.select(this)
              .attr('fill', mapStyle.fillColor)

            tooltip.style('display', 'none')            
            
          })
          .on('click', function(d,i){
            //判断是否是主城
            
            var areaId = d.properties.ZZJGDM
            console.log(areaId)
            var mainCityCode = ['500103000000','500104000000','500105000000','500106000000','500107000000','500108000000','500109000000','500112000000','500113000000','500199000000']
            if (mapZindex == 3) {
              return false
            }else{
              if (mainCityCode.indexOf(areaId) != -1 && mapZindex == 1) {
                areaId = '222222'
                mapZindex = 2
                d3.select('#back-btn').attr('code', '222222')
                var btnCode1 = d3.select('#back-btn').attr('code')
              }else{
                mapZindex = 3 
              }
              d3.select('#back-btn').style('display', 'block')
              var url = './../data/map/fenju/'+areaId+'.json'
              _self.drawMap(url, mapDatas)
            }
           
          })
          _self.drawMarkPoint(svg, projection, mapDatas)
          _self.backButton()   
      })
         
    },
    /**
     *  [drawMarkPoint]  撒点
     *  @param {object} projection 提示框
     *  @param {object} svg svg对象
     *  @param {object} data 数据
     */
    drawMarkPoint: function(svg, projection, data){

    },
    /**
     *  [tooltip]  悬浮框
     *  @param {object} tooltip 提示框
     *  @param {string} data 数据
     *  @param {array} pos 地图中心坐标
     */
    tooltip: function(tooltip, data, pos){
      tooltip.style('display','block')
        .html('<div id="mapName">' + data.name + '</div><div id="mapValue">' + data.value + '</div>')
        .style('left', pos[0] + 20 + 'px')
        .style('top', pos[1] - 100 + 'px')
    },
    /**
     *  [bacKButton] 点击返回
     *  @param {object} tooltip 提示框
     *  @param {string} data 数据
     *  @param {array} pos 地图中心坐标
     */
    backButton: function(){
      var _self = this
      d3.select('#back-btn').on('click', function(){
      var btnCode = d3.select('#back-btn').attr('code')

      if (mapZindex == 2) {
        mapZindex = 1
        areaId = 'chongqing'
        d3.select('#back-btn').style('display', 'none')
        d3.select('#back-btn').attr('code', 'chongqing')
        var url = './../data/map/fenju/'+areaId+'.json'
        var mapDatas = [] //存放地图数据
        _self.drawMap(url, mapDatas)
      }else if (mapZindex == 3 && btnCode == 222222) {
        mapZindex = 2
        areaId = '222222'
        d3.select('#back-btn').style('display', 'block')
        var url = './../data/map/fenju/'+areaId+'.json'
        var mapDatas = [] //存放地图数据
        _self.drawMap(url, mapDatas)
      }else{
        mapZindex = 1
        areaId = 'chongqing'
        d3.select('#back-btn').style('display', 'none')
        d3.select('#back-btn').attr('code', 'chongqing')
        var url = './../data/map/fenju/'+areaId+'.json'
        var mapDatas = [] //存放地图数据
        _self.drawMap(url, mapDatas)
      }
      })
    },
        /**
     *  @getZoomScale  [地图缩放]
     *  @param     {[object]}    features [地图数据]
     *  @param     {[number]}    width    [容器width]
     *  @param     {[number]}    height   [容器height]
     */
    getZoomScale: function(features, width, height) {
      var longitudeMin = 100000 //最小经度
      var latitudeMin = 100000 //最小维度
      var longitudeMax = 0 //最大经度
      var latitudeMax = 0 //最大纬度
      features.forEach(function(e) {
        var a = d3.geo.bounds(e) //[[最小经度，最小维度][最大经度，最大纬度]]
        if (a[0][0] < longitudeMin) {
          longitudeMin = a[0][0]
        }
        if (a[0][1] < latitudeMin) {
          latitudeMin = a[0][1]
        }
        if (a[1][0] > longitudeMax) {
          longitudeMax = a[1][0]
        }
        if (a[1][1] > latitudeMax) {
          latitudeMax = a[1][1]
        }
      });

      var a = longitudeMax - longitudeMin
      var b = latitudeMax - latitudeMin

      return Math.min(width / a, height / b)
    },
    /**
     *  @getZoomScale  [获取中心点]
     *  @param     {[object]}    features [地图数据]
     */
    getCenters: function(features) {
      var longitudeMin = 100000
      var latitudeMin = 100000
      var longitudeMax = 0
      var latitudeMax = 0
      features.forEach(function(e) {
        var a = d3.geo.bounds(e)
        if (a[0][0] < longitudeMin) {
          longitudeMin = a[0][0]
        }
        if (a[0][1] < latitudeMin) {
          latitudeMin = a[0][1]
        }
        if (a[1][0] > longitudeMax) {
          longitudeMax = a[1][0]
        }
        if (a[1][1] > latitudeMax) {
          latitudeMax = a[1][1]
        }
      });
      var a = (longitudeMax + longitudeMin) / 2
      var b = (latitudeMax + latitudeMin) / 2
      return [a, b]
    }
  }

  return map
})