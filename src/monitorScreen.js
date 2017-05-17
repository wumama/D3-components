/**
 * @Author:      wuqin
 * @DateTime:    2017-05-04 11:11:18
 * @Description: 数据监控大屏
 * @Last Modified By:   wuqin
 * @Last Modified Time:    2017-05-04 11:11:18
 */
define(function(require){
  /**
   *  引用公用文件
   */
  require('d3')
  require('lodash')
  // require('jquery')

  //变量
  var cfg = {}

  var monitorScreen = {
    /**
     *  @description 配置项
     */
    defaultSetting: function(){
      return{
        width: '500',
        height: '500',
        outCircle: {
          fill: '#437bd0',
          stroke: '#437bd0',
          strokeWidth: '2'
        }
      }
    },
    /**
     *  @description 初始化
     *  @param {object} data 数据和其他配置项
     */
    init: function(data){
      console.log(data)
      var _self = this
      cfg = _.merge({}, this.defaultSetting(), data)

      var svg = d3.select( '#' + cfg.id)
        .append('svg')
        .attr('width', cfg.width)
        .attr('height', cfg.height)

        console.log(cfg.id)

      _self.drawCircle(cfg, svg)
    },
    /**
     *  @description 绘制一个圆得到每个数据对应的位置
     *  @param {object} cfg 所有配置项
     *  @param {object} svg svg对象
     */
    drawCircle: function(cfg, svg){
      var circleData = cfg.data
      console.log(circleData)

      //将真实数据转化为饼图数据
      var pie = d3.layout.pie().value(function(d){
        return 1  //全部数据都返回为1 饼图才能成是等分的
      })
      //绑定数据
      var pieDates = pie(circleData)
      
      var innerRadius = cfg.width / 5
      var outerRadius = cfg.width / 5
      //弧生成器
      var arc = d3.svg.arc()
        .innerRadius(innerRadius)  //设置内半径
        .outerRadius(outerRadius)  //设置外半径
      //绘制对应数目的弧 g元素
      var arcs = svg.selectAll('g')
        .data(pieDates)
        .enter()
        .append('g')
        .attr('class', 'arcs')
        .attr('transform', 'translate(' + (cfg.width/2) + ',' + (cfg.height/2) + ')')

      var arr = []
      //添加外部圆圈
      var outCircle = arcs.append('g')
        .attr('class', 'outCircle')
      var outCircleCfg = cfg.outCircle
      var rx = cfg.height / 10
      outCircle.append('ellipse')
        .attr('rx', rx)
        .attr('ry', rx - 25)
        .attr('cy', function(d){
          var cy = arc.centroid(d)[1] * 1.6
          var cx = arc.centroid(d)[0] * 1.6
          arr.push(cx)
          return cy
        })
        .attr('cx', function(d, i){
          // var arr1 = arr.concat()
          // arr1.sort(function(a,b){
          //   return b-a
          // })
          // console.log(arr1)
          console.log(arr)

          // if (arr[i] == arr1[0] || arr[i] == arr1[1]) {
          //   return arr[i] + 200
          // }else{
            return arr[i]
          // }
          
        })
        .attr('fill', 'none')
        .attr('stroke-width', outCircleCfg.strokeWidth)
        .attr('stroke', outCircleCfg.stroke)


    }

  }

  return monitorScreen
})