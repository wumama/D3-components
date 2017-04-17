/**
 * @Author:      wuqin
 * @DateTime:    2017-04-07 16:16:21
 * @Description: 饼图（环形图）组件
 * @Last Modified By:   wuqin 
 * @Last Modified Time:    2017-04-07 16:16:21
 */
define(function(require){
    /**
     *  引用公用文件
     */
    require('d3')
    require('jquery')
    /*
     *饼图配置项
     */
    var pie = {
      /**
       * @describe [饼图初始化] 
       * @param {object} data 数据
       */
       drawPie: function(Data){
         /**
           *  [cfg 饼图配置项]
           *  @type {Object}
           */
          var width = Data.width
          var height = Data.height

          var cfg = {
            id: Data.id,
            unit: Data.unit,
            data: Data.data,
            width: width,
            height: height,
            label: {
              fontSize: '16px',
              color: '#fff',
              textAnchor: 'start',
              fontFamily: '微软雅黑'
            },
            text: {
              fontSize: '22px',
              fontColor: '#fff',
              x: '-15',
              y: '10'
            },
            tooltip: {
              fontSize: '18px',
              color: '#fff',
              fontFamily: '微软雅黑',
              padding: '10px',
              background: '#043997'
            },
            circle: {
              color: ['#174793','#e14c4c','#f1ae3d','#74b5ed','#780bcc'],
              outerRadius: width / 5.8,  //饼图的外半径 
              innerRadius: width / 5.8 - 20,  //饼图的内半径 内半径为0则中间没有空白
              pieHighColor: '#6a6b80'  //饼图高亮颜色
            },
            outCircle: {
              cx: '0',
              cy: '0',
              r: width / 5.8 +10,
              stroke: '#174793',
              strokeWidth: '2',
              fill: 'rgba(0,0,0,0)'
            },
            line: {
              fill: 'rgba(0,0,0,0)',
              strokeWidth: '2',
              stroke: '#174793'
            }
          }
          var outerRadius = cfg.circle.outerRadius
          var innerRadius = cfg.circle.innerRadius

          /**
           *  得到数据并用集合存起来
           */
          var total = 0 //总数
          var pieDates = []  //存放饼图的数据
          var pieNames = []  //存放饼图的name
          var piePercent = [] //存放饼图百分百
          var data = cfg.data
          for (var i = 0, len = data.length; i < len; i++) { 
            pieDates.push(data[i].value)
            pieNames.push(data[i].name)
            total += data[i].value
          }

          for (var j = 0; j < data.length; j++) {
            var percent = Math.round(pieDates[j] / total*10000) / 100.00
            piePercent.push(percent)
          }

          //设置画布的大小
          var svg = d3.select(cfg.id)
                .append('svg')
                .attr('width',cfg.width)
                .attr('height',cfg.height)

          /**
           *  添加环形图外圈
           *  一定先画外圈的圆圈 不然它会覆盖后面的环形图
           */
          var circle = svg.append('circle')
            .attr('cx', cfg.outCircle.cx)
            .attr('cy', cfg.outCircle.cy)
            .attr('r', cfg.outCircle.r)
            .attr('transform','translate('+ (cfg.width/2) +','+ (cfg.height/2) +')')
            .attr('stroke', cfg.outCircle.stroke)
            .attr('stroke-width', cfg.outCircle.strokeWidth)
            .attr('fill', cfg.outCircle.fill)

          //添加悬浮框
          var tooltip = d3.select(cfg.id).append('div')
            .attr('id','tooltip')
            .style({
              "position": 'absolute',
              "border-radius": '10px',
              "background": cfg.tooltip.background,
              "color": cfg.tooltip.color,
              "font-size": cfg.tooltip.fontSize,
              "padding": cfg.tooltip.padding,
              'display': 'none'
          })

          //将真实数据转化为饼图的数据
          var layoutPie = d3.layout.pie()
          //绑定数据
          var pieDate = layoutPie(pieDates)

          //弧生成器
          var arc = d3.svg.arc()
                .innerRadius(innerRadius)  //设置内半径
                .outerRadius(outerRadius)  //设置外半径

          var arc2 = d3.svg.arc()
                .innerRadius(innerRadius - (innerRadius)/ 15 )  //设置内半径
                .outerRadius(outerRadius + (innerRadius)/ 30 )  //设置外半径

          //折线开始的弧生成器
          var lineArc = d3.svg.arc()
                .innerRadius(1.3 * innerRadius)
                .outerRadius(1.3 * outerRadius)
          //折线结束的弧生成器
          var endArc = d3.svg.arc()
                .innerRadius(1.6 * innerRadius)
                .outerRadius(1.6 * outerRadius)
          //绘制饼图
          var arcs = svg.append('g')
                .attr('class','pie')
                .selectAll('g')
                .data(pieDate)
                .enter()
                .append('g')
                .attr('transform','translate('+ (cfg.width/2) +','+ (cfg.height/2) +')')

          arcs.append('path')
          .attr('fill',function(d,i){
            return cfg.circle.color[i]
          })
          .attr('d',function(d){
            return arc(d)
          })
          .on('mouseover',function(d,i){
            //环形图高亮
            d3.select(this)
              .attr('fill', cfg.circle.pieHighColor)
              .attr('cursor','pointer')
              .transition()
              .attr('d',function(d){
                return arc2(d)
              })

            //计算悬浮框的位置
            var transitPos = endArc.centroid(d)
            transitPos[0] = transitPos[0] + Number(cfg.width) / 2
            transitPos[1] = transitPos[1] + Number(cfg.height) / 2
            var leftPos = Number(cfg.width) / 2 - outerRadius * 2.5
            var rightPos = transitPos[0]
            transitPos[0] = pie.middleAngel(d) < Math.PI ? rightPos : leftPos
            //悬浮框数据
            var data = {
              value: d.value,
              name: pieNames[i],
              unit: cfg.unit,
              percentage: piePercent[i]
            }
            //调用悬浮框方法
            pie.tooltip(tooltip,data,transitPos)

          }) 
          .on('mouseout',function(d,i){
            d3.select(this)
              .attr('fill', cfg.circle.color[i]) 
              .transition()
              .attr('d',function(d){
                return arc(d)
              })

            tooltip.style('display','none')

          })

          //添加总数text
          var totalNum = svg.append('text')
            .attr('class','totalNum')
            .attr('x', cfg.text.x)
            .attr('y', cfg.text.y)
            .style('font-size',cfg.text.fontSize)
            .attr('transform','translate('+ (cfg.width/2) +','+ (cfg.height/2) +')')
            .attr('fill',cfg.text.fontColor)
            .html(total)

          //添加折线
          var polylines = svg.append('g')
            .attr('class','polyline')
            .selectAll('polyline')
            .data(pieDate)
            .enter()
            .append('polyline')
            .attr('points',function(d,i){
              //起始点
              var position = lineArc.centroid(d)
              position[0] = position[0] + Number(cfg.width) / 2
              position[1] = position[1] + Number(cfg.height) / 2
              //过渡点
              var transitPos = endArc.centroid(d)
              transitPos[0] = transitPos[0] + Number(cfg.width) / 2
              transitPos[1] = transitPos[1] + Number(cfg.height) / 2
              //终点
              var leftPos = Number(cfg.width) / 2 - outerRadius * 2
              var rightPos = position[0] + Number(cfg.width) / 4
              var endLinePosX = pie.middleAngel(d) < Math.PI ? rightPos : leftPos
              var endLinePosY = transitPos[1]
              var endLinePos = [endLinePosX , endLinePosY]

              return [position,transitPos,endLinePos]
            })
            .attr('fill', cfg.line.fill)
            .attr('stroke',cfg.line.stroke)
            .attr('stroke-width',cfg.line.strokeWidth)

          // 添加文字标签
          var label = svg.append('g')
            .attr('class','label')
            .selectAll('text')
            .data(pieDate)
            .enter()
            .append('text')
            .attr('fill',cfg.label.color)
            .style('font-size',cfg.label.fontSize)
            .text(function(d,i){
              var html = pieNames[i]
              return html
            })
            .attr('transform',function(d){
              //过渡点
              var transitPos = endArc.centroid(d)
              transitPos[0] = transitPos[0] + Number(cfg.width) / 2 
              transitPos[1] = transitPos[1] + Number(cfg.height) / 2 - 10
              return 'translate(' + transitPos + ')'
            })
            .style('text-anchor', function(d, i) {
            return pie.middleAngel(d)<Math.PI ? cfg.label.textAnchor : 'end';
           })

       },
      /**
       * @describe [悬浮框]
       * @param {Object} data 悬浮框的数据
       * @param {Object} transitPos 悬浮框位置
       */
       tooltip: function(tooltip,data,transitPos){
          //悬浮框内容
          var html = '<div class="pie-name">'+ data.name +'</div><div class="pie-value">'+ data.value + data.unit + '('+ data.percentage + '%)' +'</div>'
          tooltip
            .style('left', transitPos[0] + 'px')
            .style('top', transitPos[1] + 'px')
            .style('display','block')
            .html(html)
       },
       /**
       * @describe [弧长的中心位置]
       * @param {Object} angel 弧长
       */
       middleAngel: function(angel){
          ////计算弧长的中心位置 =（起始弧度 + 终止弧度）/2 = 弧度的中心位置
          return (angel.startAngle + angel.endAngle) /2
       }
    }

    return pie

})