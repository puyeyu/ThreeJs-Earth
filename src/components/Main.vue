<template>
  <div>
    <div id="container"></div>
    <div id="tooltip"></div>

    <el-button-group class="button-group">
      <el-button type="" icon="" @click="groupOneChange">首页总览</el-button>
      <el-button type="" icon="" @click="groupTwoChange">应急管理</el-button>
      <el-button type="" icon="" @click="groupThreeChange">能源管理</el-button>
      <el-button type="" icon="" @click="groupFourChange">环境监测</el-button>
      <!-- <el-button type="" icon="">综合能源监控中心</el-button> -->

    </el-button-group>
  </div>
</template>


<script>
  import * as THREE from "three";
  import * as d3 from 'd3';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

  export default {
    data() {
      return {
        camera: null,
        scene: null,
        renderer: null,
        labelRenderer: null,
        container: null,
        // mesh: null,
        controller: null,
        map: null,
        raycaster: null,
        mouse: null,
        tooltip: null,
        lastPick: null,
        mapEdgeLightObj: {
          mapEdgePoints: [],
          lightOpacityGeometry: null,  // 单独把geometry提出来，动画用

          // 边缘流光参数
          lightSpeed: 3,
          lightCurrentPos: 0,
          lightOpacitys: null,          
        },

        // 每个屏幕模型一组
        groupOne: new THREE.Group(),
        groupTwo: new THREE.Group(),
        groupThree: new THREE.Group(),
        groupFour: new THREE.Group(),


        // groupOne 统计信息
        cityWaveMeshArr: [],
        cityCylinderMeshArr: [],
        cityMarkerMeshArr: [],
        cityNumMeshArr: [],

        // groupTwo 告警信息
        alarmWaveMeshArr: [],
        alarmCylinderMeshArr: [],
        alarmNameMeshArr: [],

        // groupThree 能源
        energyWaveMeshArr: [],
        energyCylinderMeshArr: [],        
        energyNameMeshArr: [],
        
        // groupFour 环境
        monitorWaveMeshArr: [],
        monitorIconMeshArr: [],        
        monitorNameMeshArr: [],

        // 城市信息
        mapConfig: {
          deep: 0.2,
        },
        // 摄像机移动位置，初始：0, -5, 1
        cameraPosArr: [
          // {x: 0.0, y: -0.3, z: 1},
          // {x: 5.0, y: 5.0, z: 2},
          // {x: 3.0, y: 3.0, z: 2},
          // {x: 0, y: 5.0, z: 2},
          // {x: -2.0, y: 3.0, z: 1},
          {x: 0, y: -3.0, z: 3.8},
        ],

        // 数据 - 区县总数量
        dataTotal: [
          {
            name: "淄川区", adcode: "370302", total: 129,
            brief: "经营范围包括凭资质证从事炉窑工程专业承包贰级；工业窑炉热工设备、环保节能设备、机电设备、仪器仪表、电器的制造、销售及调试。"
          },
          {
            name: "张店区", adcode: "370303", total: 89,
            brief: "经营范围包括凭资质证从事炉窑工程专业承包贰级；工业窑炉热工设备、环保节能设备、机电设备、仪器仪表、电器的制造、销售及调试。"
          },
          {
            name: "博山区", adcode: "370304", total: 205,
            brief: "经营范围包括凭资质证从事炉窑工程专业承包贰级；工业窑炉热工设备、环保节能设备、机电设备、仪器仪表、电器的制造、销售及调试。"
          },
          {
            name: "沂源县", adcode: "370323", total: 26,
            brief: "经营范围包括凭资质证从事炉窑工程专业承包贰级；工业窑炉热工设备、环保节能设备、机电设备、仪器仪表、电器的制造、销售及调试。"
          },
          {
            name: "高青县", adcode: "370322", total: 8,
            brief: "经营范围包括凭资质证从事炉窑工程专业承包贰级；工业窑炉热工设备、环保节能设备、机电设备、仪器仪表、电器的制造、销售及调试。"
          },

        ],
        dataAlarm: [
          {
            name: "张店区", adcode: "370303", level: 1, 
            type: "压力异常",
            content: "检测到压力过高，超过标准2000Pa",
            company: "窑炉5厂", location: "张店区万山村", tel: "18861899887"
          },
          {
            name: "沂源县", adcode: "370303", level: 1,
            type: "温度异常",
            content: "检测到温度2900­°C，超过标准1200-1800­°C",
            company: "窑炉1厂", location: "沂源县白塔镇南万山村", tel: "13561899812"            
          },
          {
            name: "博山区", adcode: "370303", level: 2,
            type: "压力异常",
            content: "检测到压力过高，超过标准2000Pa",
            company: "窑炉2厂", location: "博山区白塔镇南万山村", tel: "14561899817"            
          },
          {
            name: "临淄区", adcode: "370303", level: 3,
            type: "用水异常",
            content: "检测到用水异常，超过标准10万吨",
            company: "窑炉3厂", location: "临淄区南万山村", tel: "18061899829"            
          },
        ],
        dataEnergy: [
          {
            name: "张店区", adcode: "370303", level: 1, 
            type: "用水异常",
            content: "检测到用水异常",
            company: "窑炉5厂", location: "张店区万山村", tel: "18861899887"
          },
          {
            name: "高青县", adcode: "370303", level: 1,
            type: "用电异常",
            content: "检测到用电异常",
            company: "窑炉1厂", location: "沂源县白塔镇南万山村", tel: "13561899812"            
          },
          {
            name: "淄川区", adcode: "370303", level: 2,
            type: "用气异常",
            content: "检测到用气异常",
            company: "窑炉2厂", location: "博山区白塔镇南万山村", tel: "14561899817"            
          }
        ],
        dataMonitor: [
          {
            name: "临淄区", adcode: "370303", monitor: "监控点一", 
            // type: 2,
            content: "正常",
            company: "窑炉5厂", location: "张店区万山村"
          },
          {
            name: "张店区", adcode: "370303", monitor: "监控点二",
            // type: 1,
            content: "正常",
            company: "窑炉1厂", location: "沂源县白塔镇南万山村" 
          },
          {
            name: "淄川区", adcode: "370303", monitor: "监控点三",
            // type: 2,
            content: "正常",
            company: "窑炉2厂", location: "博山区白塔镇南万山村"
          }
        ],           
      };
    },
    mounted() {
      this.init();
      this.animate();
      window.addEventListener('resize', this.onWindowSize)
    },
    methods: {
      //初始化
      init() {
        this.container = document.getElementById("container");
        this.setScene();
        this.setCamera();
        this.setRenderer();  // 创建渲染器对象
        this.setController();  // 创建控件对象
        this.addHelper();
        this.loadMapData();
        this.setEarth();
        this.setRaycaster();
        this.setLight();
      },

      setScene() {
        //  创建场景对象Scene
        this.scene = new THREE.Scene();
      },

      setCamera() {
        // 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
        this.camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          500
        );

        this.camera.position.set(0, -5, 1);  // 0, -5, 1
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));  // 0, 0, 0 this.scene.position
      },

      setRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          // logarithmicDepthBuffer: true,  // 是否使用对数深度缓存
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        // this.renderer.sortObjects = false;  // 是否需要对对象排序
        this.container.appendChild(this.renderer.domElement);


        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = 0;
        this.container.appendChild(this.labelRenderer.domElement);
      },

      setController() {
        this.controller = new OrbitControls(this.camera, this.labelRenderer.domElement);
				this.controller.minDistance = 2;
				this.controller.maxDistance = 5.5  // 5.5

        // 阻尼（惯性）
        // this.controller.enableDamping = true;
				// this.controller.dampingFactor = 0.04;

        this.controller.minAzimuthAngle = -Math.PI / 4;
				this.controller.maxAzimuthAngle = Math.PI / 4;

        this.controller.minPolarAngle = 1;
				this.controller.maxPolarAngle = Math.PI - 0.1;

        // 修改相机的lookAt是不会影响THREE.OrbitControls的target的
        // this.controller.target = new THREE.Vector3(0, -5, 2); 
        
      },

      // 辅助线
      addHelper() {
        // let helper = new THREE.CameraHelper(this.camera);
        // this.scene.add(helper);

        //轴辅助 （每一个轴的长度）
        let axisHelper = new THREE.AxisHelper(150);  // 红线是X轴，绿线是Y轴，蓝线是Z轴
        // this.scene.add(axisHelper);

        let gridHelper = new THREE.GridHelper(100, 30, 0x2C2C2C, 0x888888);
        // this.scene.add(gridHelper);        
      },

      setLight() {
        const ambientLight = new THREE.AmbientLight(0x404040, 1.2);
        this.scene.add(ambientLight);
        // // 平行光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        this.scene.add(directionalLight); 

        // 聚光光源 - 照模型
        // const spotLight = new THREE.SpotLight(0xffffff, 0.9);
        // spotLight.position.set(1, -4, 4);
        // spotLight.castShadow = true;
        // this.scene.add(spotLight);
        // 聚光光源辅助线
        // const spotLightHelper = new THREE.SpotLightHelper(spotLight);
        // this.scene.add(spotLightHelper);

        // 点光源 - 照模型
        const test = new THREE.PointLight("#ffffff", 1.8, 20);
        test.position.set(1, -7, 7);
        this.scene.add(test);
        const testHelperMap = new THREE.PointLightHelper(test);
        this.scene.add(testHelperMap);

        // 点光源 - 蓝色照地球
        const pointLightMap = new THREE.PointLight("#4161ff", 1.4, 20);
        pointLightMap.position.set(0, 7, 3);
        this.scene.add(pointLightMap);
        const spotLightHelperMap = new THREE.PointLightHelper(pointLightMap);
        // this.scene.add(spotLightHelperMap);
      },

      // 加载地图数据
      loadMapData() {
        const loader = new THREE.FileLoader();
        loader.load("/static/map/json/zibo.json", data => {
          const jsondata = JSON.parse(data);
          this.addMapGeometry(jsondata);
        })
      },

      // 地图模型
      addMapGeometry(jsondata) {
        // 初始化一个地图对象
        this.map = new THREE.Object3D();
        // 墨卡托投影转换
        const projection = d3
          .geoMercator()
          .center([118.2, 36.7])  // 淄博市
          // .scale(2000) 
          .translate([0.2, 0.15]);  // 根据地球贴图做轻微调整

        jsondata.features.forEach((elem) => {
          // 定一个省份3D对象
          const province = new THREE.Object3D();
          // 每个的 坐标 数组
          const coordinates = elem.geometry.coordinates;
          // 循环坐标数组
          coordinates.forEach((multiPolygon) => {
            multiPolygon.forEach((polygon) => {
              const shape = new THREE.Shape();
              const lineMaterial = new THREE.LineBasicMaterial({
                color: '#ffffff',
                // linewidth: 1,
                // linecap: 'round', //ignored by WebGLRenderer
                // linejoin:  'round' //ignored by WebGLRenderer                
              });
              // const lineGeometry = new THREE.Geometry();
              // for (let i = 0; i < polygon.length; i++) {
              //   const [x, y] = projection(polygon[i]);
              //   if (i === 0) {
              //     shape.moveTo(x, -y);
              //   }
              //   shape.lineTo(x, -y);
              //   lineGeometry.vertices.push(new THREE.Vector3(x, -y, 3));
              // }
              const lineGeometry = new THREE.BufferGeometry();
              const pointsArray = new Array();
              for (let i = 0; i < polygon.length; i++) {
                const [x, y] = projection(polygon[i]);
                if (i === 0) {
                  shape.moveTo(x, -y);
                }
                shape.lineTo(x, -y);
                pointsArray.push(new THREE.Vector3(x, -y, this.mapConfig.deep));

                // 做边缘流光效果，把所有点保存下来
                this.mapEdgeLightObj.mapEdgePoints.push([x, -y, this.mapConfig.deep]);
              }
              // console.log(pointsArray);
              lineGeometry.setFromPoints(pointsArray);
              
              const extrudeSettings = {
                depth: this.mapConfig.deep,
                bevelEnabled: false,  // 对挤出的形状应用是否斜角
              };

              const geometry = new THREE.ExtrudeGeometry(
                shape,
                extrudeSettings
              );
              const material = new THREE.MeshPhongMaterial({
                color: '#4161ff',
                transparent: true,
                opacity: 0.4,
                side: THREE.FrontSide,
                // depthTest: true,
              });
              const material1 = new THREE.MeshLambertMaterial({
                color: '#10004a',
                transparent: true,
                opacity: 0.7,
                side: THREE.FrontSide,
                // wireframe: true
              });
              const mesh = new THREE.Mesh(geometry, [material, material1]);
              const line = new THREE.Line(lineGeometry, lineMaterial);
              // 将省份的属性 加进来
              province.properties = elem.properties;

              // 将城市信息放到模型中，后续做动画用
              if (elem.properties.centroid) {
                  const [x, y] = projection(elem.properties.centroid)  // uv映射坐标
                  province.properties._centroid = [x, y]
              }

              // console.log(elem.properties);
              province.add(mesh);
              province.add(line);
            })
          })
          // province.scale.set(5, 5, 0);
          // province.position.set(0, 0, 0);
          // console.log(province);
          this.map.add(province);
        })
        this.setMapEdgeLight();
        this.setMapName();
        this.scene.add(this.map);

        // 获取数据后，加载模型
        this.getResponseData();

      },

      // 地图边缘流光效果
      setMapEdgeLight() {
        // console.log(this.mapEdgeLightObj.mapEdgePoints);
        let positions = new Float32Array(this.mapEdgeLightObj.mapEdgePoints.flat(1));  // 数组深度遍历扁平化
        // console.log(positions);
        this.mapEdgeLightObj.lightOpacityGeometry = new THREE.BufferGeometry();
        // 设置顶点
        this.mapEdgeLightObj.lightOpacityGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        // 设置 粒子透明度为 0
        this.mapEdgeLightObj.lightOpacitys = new Float32Array(positions.length).map(() => 0);
        this.mapEdgeLightObj.lightOpacityGeometry.setAttribute("aOpacity", new THREE.BufferAttribute(this.mapEdgeLightObj.lightOpacitys, 1));

        // 顶点着色器
        const vertexShader = `
          attribute float aOpacity;
          uniform float uSize;
          varying float vOpacity;

          void main(){
              gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);
              gl_PointSize = uSize;

              vOpacity=aOpacity;
          }
          `
        // 片段着色器
        const fragmentShader = `
          varying float vOpacity;
          uniform vec3 uColor;

          float invert(float n){
              return 1.-n;
          }

          void main(){
            if(vOpacity <=0.2){
                discard;
            }
            vec2 uv=vec2(gl_PointCoord.x,invert(gl_PointCoord.y));
            vec2 cUv=2.*uv-1.;
            vec4 color=vec4(1./length(cUv));
            color*=vOpacity;
            color.rgb*=uColor;
            gl_FragColor=color;
          }
          `
        
        const material = new THREE.ShaderMaterial({
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          transparent: true, // 设置透明
          // blending: THREE.AdditiveBlending,
          uniforms: {
            uSize: {
              value: 5.0
            },
            uColor: {
              value: new THREE.Color("#ffffff")  // 光点颜色 fffb85
            }
          }
        })
        // material.blending = THREE.AdditiveBlending;
        const opacityPointsMesh = new THREE.Points(this.mapEdgeLightObj.lightOpacityGeometry, material);
        this.scene.add(opacityPointsMesh);

      },

      // 地球贴图纹理
      setEarth() {
        const geometry = new THREE.PlaneGeometry(14.0, 14.0);
        const texture = new THREE.TextureLoader().load('/static/map/texture/earth.jpg');
        const bumpTexture = new THREE.TextureLoader().load('/static/map/texture/earth.jpg');
        // texture.wrapS = THREE.RepeatWrapping;  // 质地.包裹
        // texture.wrapT = THREE.RepeatWrapping;
        
        const material = new THREE.MeshPhongMaterial({
          map: texture,  // 贴图
          bumpMap: bumpTexture,
          bumpScale: 0.05,
          // specularMap: texture,
          // specular: 0xffffff,
          // shininess: 1,
          // color: "#000000", 
          side: THREE.FrontSide} 
        );
        const earthPlane = new THREE.Mesh(geometry, material);
        this.scene.add(earthPlane);        
      },

      // 地图label
      setMapName(){
        this.map.children.forEach((elem, index) => {
          // 找到中心点
          const y = -elem.properties._centroid[1]
          const x = elem.properties._centroid[0]
          // 转化为二维坐标
          const vector = new THREE.Vector3(x, y, this.mapConfig.deep + 0.01)

          // 添加城市名称
          this.setCityName(vector, elem.properties.name);
        })
      },
      
      // 获取数据后，加载模型
      getResponseData() {
        let self = this;
        setTimeout(function(){
          self.addCityModel();
          self.addAlarmModel();
          self.addEnergyModel();
          self.addMonitorModel();
          // 初始化动画
          setTimeout(self.cameraTween, 1000) 
        }, 500)
      },
      
      // 地区中心点 - 获取向量
      mapElem2Centroid(elem) {
        // 找到中心点
        const y = -elem.properties._centroid[1];
        const x = elem.properties._centroid[0];
        // 转化为二维坐标
        const vector = new THREE.Vector3(x, y, this.mapConfig.deep + 0.01);
        return vector;
      },

      // 数据归一化，映射到0-1区间 - 获取最大值
      getMaxV(distributionInfo) {
        let max = 0;
        for (let item of distributionInfo) {
          if (max < item.total) max = item.total;
        }
        return max;
      },
      // 数据归一化，映射到0-1区间 - 获取最小值
      getMinV(distributionInfo) {
        let min = 1000000;
        for (let item of distributionInfo) {
          if (min > item.total) min = item.total;
        }
        return min;
      },
      // 数据归一化，映射到0-1区间
      normalization(data, min, max) {
        let normalizationRatio = (data - min) / (max - min)
        return normalizationRatio
      },

      // GroupOne 添加模型
      addCityModel() {
        // 数据归一化
        const min = this.getMinV(this.dataTotal);
        const max = this.getMaxV(this.dataTotal);
        // 添加模型
        this.map.children.forEach((elem, index) => {
          // console.log(elem);
          // 满足数据条件 dataTotal
          if(this.dataTotal) {
            const vector = this.mapElem2Centroid(elem);
            this.dataTotal.forEach(d => {
              // 数据归一化，映射到0-1区间
              let num = this.normalization(d.total, min, max);

              // 判断区县
              if(d.name === elem.properties.name) {
                // 添加城市光波
                this.setCityWave(vector);

                // 添加城市标记
                this.setCityMarker(vector);
                            
                // 添加城市光柱
                this.setCityCylinder(vector, num);

                // 添加城市数据
                this.setCityNum(vector, num, d);
              }
            })
            this.scene.add(this.groupOne);
          }
        })
      },

      // GroupTwo 添加模型
      addAlarmModel() {
        this.map.children.forEach((elem, index) => {
          // console.log(elem);
          // 满足数据条件 dataAlarm
          if(this.dataAlarm) {
            const vector = this.mapElem2Centroid(elem);
            // 各等级颜色 1、2、3
            const colorLevel = ["#ff1800", "#FF8A00", "#FAE52D"];      
            this.dataAlarm.forEach(d => {
              // 判断区县
              if(d.name === elem.properties.name) {
                // 添加告警光波
                this.setAlarmWave(vector, colorLevel[d.level - 1]);

                // 添加告警标记
                this.setAlarmCylinder(vector, colorLevel[d.level - 1]);

                // 添加告警名称
                this.setAlarmName(vector, colorLevel[d.level - 1], d);
              }
            })

            // 先隐藏，通过按钮控制
            this.groupTwo.visible = false;
            this.scene.add(this.groupTwo);
          }
        })     
      },

      // GroupThree 添加模型
      addEnergyModel() {
        this.map.children.forEach((elem, index) => {
          // console.log(elem);
          // 满足数据条件 dataEnergy
          if(this.dataEnergy) {
            const vector = this.mapElem2Centroid(elem);
            // 各等级颜色 1、2、3
            const colorLevel = ["#ff1800", "#FF8A00", "#FAE52D"];      
            this.dataEnergy.forEach(d => {
              // 判断区县
              if(d.name === elem.properties.name) {
                // 添加能源光波
                this.setEnergyWave(vector, colorLevel[d.level - 1]);

                // 添加能源标记
                this.setEnergyCylinder(vector, colorLevel[d.level - 1]);

                // 添加能源名称
                this.setEnergyName(vector, colorLevel[d.level - 1], d);
              }
            })

            // 先隐藏，通过按钮控制
            this.groupThree.visible = false;
            this.scene.add(this.groupThree);
          }
        })     
      },

      // GroupFour 添加模型
      addMonitorModel() {
        this.map.children.forEach((elem, index) => {
          // console.log(elem);
          // 满足数据条件 dataMonitor
          if(this.dataMonitor) {
            const vector = this.mapElem2Centroid(elem);
            // 各等级颜色 1、2、3
            this.dataMonitor.forEach(d => {
              // 判断区县
              if(d.name === elem.properties.name) {
                // 添加监测光波
                this.setMonitorWave(vector);

                // 添加监测标记
                this.setMonitorIcon(vector);

                // 添加监测名称
                this.setMonitorName(vector, d);
              }
            })

            // 先隐藏，通过按钮控制
            this.groupFour.visible = false;
            this.scene.add(this.groupFour);
          }
        })     
      },

      // 城市 - 光柱
      setCityCylinder(vector, num) {
        const height = num;
        const geometry = new THREE.CylinderGeometry(0.08, 0.08, height, 20);
        
        // 顶点着色器
        const vertexShader = `
          uniform vec3 viewVector;
          varying float intensity;
          void main() {
              gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
              vec3 actual_normal = vec3(modelMatrix * vec4(normal, 0.0));
              intensity = pow(dot(normalize(viewVector), actual_normal), 3.0);
          }
          `
        // 片段着色器
        const fragmentShader = `
          varying float intensity;
          void main() {
            vec3 glow = vec3(246, 239, 0) * 3.0;
            gl_FragColor = vec4(glow, 1);
          }
          `
        
        let material = new THREE.MeshPhongMaterial({  // ShaderMaterial
            // uniforms: {
            //     viewVector: this.camera.position
            // },
            // vertexShader: vertexShader,
            // fragmentShader: fragmentShader,
            color: "#ede619",
            side: THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
            // depthTest: false,
            precision: "mediump",
            // depthFunc: THREE.LessEqualDepth,
            opacity: 0.9,
        });

        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.set(vector.x, vector.y, vector.z + height / 2);
        cylinder.rotateX(Math.PI / 2);
        cylinder.scale.set(1, 1, 1);
        // cylinder.position.z -= height / 2;
        // cylinder.translateY(-height);
        cylinder._height = height;

        // 法向量计算位置
        // let coordVec3 = vector.normalize();
        // // mesh默认在XOY平面上，法线方向沿着z轴new THREE.Vector3(0, 0, 1)
        // let meshNormal = new THREE.Vector3(0, 0, 0);
        // // 四元数属性，角度旋转，quaternion表示mesh的角度状态，setFromUnitVectors();计算两个向量之间构成的四元数值
        // cylinder.quaternion.setFromUnitVectors(meshNormal, coordVec3);
        this.cityCylinderMeshArr.push(cylinder);
        this.groupOne.add(cylinder);
        // this.scene.add(cylinder);
      },

      // 城市 - 光波
      setCityWave(vector) {
        const cityGeometry = new THREE.PlaneBufferGeometry(1, 1); //默认在XOY平面上
        const textureLoader = new THREE.TextureLoader(); // TextureLoader创建一个纹理加载器对象
        const texture = textureLoader.load('/static/map/texture/wave.png');

        // 如果不同mesh材质的透明度、颜色等属性同一时刻不同，材质不能共享
        const cityWaveMaterial = new THREE.MeshBasicMaterial({
          color: "#ede619",  // 0x22ffcc
          map: texture,
          transparent: true, //使用背景透明的png贴图，注意开启透明计算
          opacity: 1.0,
          side: THREE.FrontSide, //双面可见
          depthWrite: false, //禁止写入深度缓冲区数据
          blending: THREE.AdditiveBlending,
        });

        let cityWaveMesh = new THREE.Mesh(cityGeometry, cityWaveMaterial);
        cityWaveMesh.position.set(vector.x, vector.y, vector.z);
        cityWaveMesh.size = 0; 
        // cityWaveMesh.scale.set(0.1, 0.1, 0.1);  // 设置mesh大小

        // 法向量计算位置
        // let coordVec3 = vector.normalize();
        // // mesh默认在XOY平面上，法线方向沿着z轴new THREE.Vector3(0, 0, 1)
        // let meshNormal = new THREE.Vector3(0, 0, 0);
        // // 四元数属性，角度旋转，quaternion表示mesh的角度状态，setFromUnitVectors();计算两个向量之间构成的四元数值
        // cityWaveMesh.quaternion.setFromUnitVectors(meshNormal, coordVec3);
        this.cityWaveMeshArr.push(cityWaveMesh);
        this.groupOne.add(cityWaveMesh);
        // 添加到场景中
        // this.scene.add(cityWaveMesh);
      },

      // 城市 - 标记
      setCityMarker(vector) {
        const cityGeometry = new THREE.PlaneBufferGeometry(0.3, 0.3); //默认在XOY平面上
        const textureLoader = new THREE.TextureLoader(); // TextureLoader创建一个纹理加载器对象
        const texture = textureLoader.load('/static/map/texture/marker.png');

        // 如果不同mesh材质的透明度、颜色等属性同一时刻不同，材质不能共享
        const cityMaterial = new THREE.MeshBasicMaterial({
          color: "#ffe000",  // 0x22ffcc
          map: texture,
          transparent: true, //使用背景透明的png贴图，注意开启透明计算
          opacity: 1.0,
          side: THREE.FrontSide, //双面可见
          depthWrite: false, //禁止写入深度缓冲区数据
          blending: THREE.AdditiveBlending,
        });
        cityMaterial.blending = THREE.CustomBlending;
        cityMaterial.blendSrc = THREE.SrcAlphaFactor;
        cityMaterial.blendDst = THREE.DstAlphaFactor;
        cityMaterial.blendEquation = THREE.AddEquation;

        let cityMarkerMesh = new THREE.Mesh(cityGeometry, cityMaterial);
        cityMarkerMesh.position.set(vector.x, vector.y, vector.z);
        cityMarkerMesh.size = 0; 
        // cityWaveMesh.scale.set(0.1, 0.1, 0.1);  // 设置mesh大小

        this.cityMarkerMeshArr.push(cityMarkerMesh);
        this.groupOne.add(cityMarkerMesh);
        // 添加到场景中
        // this.scene.add(cityMarkerMesh);  
      },

      // 城市 - 数据显示
      setCityNum(vector, num, data) {
        // CSS2DRenderer生成的标签直接就是挂在真实的DOM上，并非是Vue的虚拟DOM上
				const div = document.createElement('div');
				div.className = 'city-num-label';
				div.textContent = data.total;

				const contentDiv = document.createElement('div');
				contentDiv.className = 'city-num-label-content';
				contentDiv.innerHTML = 
          '本区县共有窑炉企业 ' + data.total + ' 个。<br/>' +
          '介绍：' + data.brief
        ;
        div.appendChild(contentDiv);

				const label = new CSS2DObject(div);
				label.position.set(vector.x, vector.y, num + 0.5);
        label.visible = true;
        this.cityNumMeshArr.push(label);
        this.groupOne.add(label);
        // this.scene.add(spritey);

      },

      // 城市 - 名称显示
      setCityName(vector, name) {
        let spritey = this.makeTextSprite(
          name, 
          {
            fontface: "微软雅黑",
            fontsize: 28,  // 定100调整位置，下面通过scale缩放
            fontColor: {r: 255, g: 255, b: 255, a: 1.0}, 
            borderColor: {r: 94, g: 94, b: 94, a: 0.0}, 
            backgroundColor: {r: 255, g: 255, b: 0, a: 0.0},
            borderThickness: 2,
            round: 6
          }
        );
        // 轻微偏移，错开光柱
        spritey.position.set(vector.x + 0.06, vector.y + 0.0, 0.22);  // num + 0.3
        this.scene.add(spritey);     
      },

      // 城市 - 名称显示 - 小精灵mesh
      makeTextSprite(message, parameters) {
        if (parameters === undefined) parameters = {};
        
        let fontface = parameters["fontface"];
        let fontsize = parameters["fontsize"];
        let fontColor = parameters["fontColor"];
        let borderThickness = parameters["borderThickness"];
        let borderColor = parameters["borderColor"];
        let backgroundColor = parameters["backgroundColor"];

        // var spriteAlignment = THREE.SpriteAlignment.topLeft;
          
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        context.font = "Bold " + fontsize + "px " + fontface;
          
        // get size data (height depends only on font size)
        let metrics = context.measureText(message);
        let textWidth = metrics.width;
        
        // background color
        context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
        // border color
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

        context.lineWidth = borderThickness;
        const painting = {
          width: textWidth * 1.4 + borderThickness * 2,
          height: fontsize * 1.4 + borderThickness * 2,
          round: parameters["round"]
        };
        // 1.4 is extra height factor for text below baseline: g,j,p,q.
        // context.fillRect(0, 0, painting.width, painting.height)
        this.roundRect(
          context, 
          borderThickness / 2, 
          borderThickness / 2, 
          painting.width, 
          painting.height, 
          painting.round
        );
        
        // text color
        context.fillStyle = "rgba(" + fontColor.r + "," + fontColor.g + "," + fontColor.b + "," + fontColor.a + ")";
        context.textAlign = "center";
        context.textBaseline = "middle";
        
        context.fillText(message, painting.width / 2, painting.height / 2);
        
        // canvas contents will be used for a texture
        let texture = new THREE.Texture(canvas) 
        texture.needsUpdate = true;
        let spriteMaterial = new THREE.SpriteMaterial({ 
          map: texture, 
          useScreenCoordinates: false,
          depthTest: false,  // 解决精灵谍影问题
          // blending: THREE.AdditiveBlending,
          // transparent: true,
          // alignment: spriteAlignment
        });
        let sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(1, 1 / 2, 1);
        return sprite;	
      },

      // 城市 - 名称显示 - 样式
      roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x+r, y);
        ctx.lineTo(x+w-r, y);
        ctx.quadraticCurveTo(x+w, y, x+w, y+r);
        ctx.lineTo(x+w, y+h-r);
        ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
        ctx.lineTo(x+r, y+h);
        ctx.quadraticCurveTo(x, y+h, x, y+h-r);
        ctx.lineTo(x, y+r);
        ctx.quadraticCurveTo(x, y, x+r, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();   
      },

      // 告警 - 光波
      setAlarmWave(vector, color) {
        const geometry = new THREE.PlaneBufferGeometry(1, 1); //默认在XOY平面上
        const textureLoader = new THREE.TextureLoader(); // TextureLoader创建一个纹理加载器对象
        const texture = textureLoader.load('/static/map/texture/alarm.png');

        const material = new THREE.MeshBasicMaterial({
          color: color,
          map: texture,
          transparent: true, //使用背景透明的png贴图，注意开启透明计算
          opacity: 1.0,
          side: THREE.FrontSide,
          depthWrite: false, //禁止写入深度缓冲区数据
          blending: THREE.AdditiveBlending,

        });

        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(vector.x, vector.y, vector.z);
        mesh.scale.set(0.4, 0.4, 0.4);  // 设置mesh大小

        this.alarmWaveMeshArr.push(mesh);
        this.groupTwo.add(mesh);
      },

      // 告警 - 三角锥标记
      setAlarmCylinder(vector, color) {
        const geometry = new THREE.CylinderGeometry(0.1, 0.0, 0.3, 3);
        let material = new THREE.MeshPhongMaterial({  // ShaderMaterial
            color: color,
            side: THREE.FrontSide,
            // blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.8,
        });

        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.set(vector.x, vector.y, vector.z + 0.3);
        cylinder.rotateX(Math.PI / 2);
        cylinder.scale.set(1, 1, 1);

        this.alarmCylinderMeshArr.push(cylinder);
        this.groupTwo.add(cylinder);
      },

      // 告警 - 名称显示
      setAlarmName(vector, color, data) {
        // CSS2DRenderer生成的标签直接就是挂在真实的DOM上，并非是Vue的虚拟DOM上
				const div = document.createElement('div');
				div.className = 'alarm-label';

        const icon = document.createElement('span');
        icon.className = 'alarm-label-icon';
				icon.textContent = '●';
        icon.style.color = color;
        div.appendChild(icon);

        const text = document.createElement('span');
        text.className = 'alarm-label-text';
				text.textContent = data.type;
        div.appendChild(text);

				const contentDiv = document.createElement('div');
				contentDiv.className = 'alarm-label-content';
				contentDiv.innerHTML = 
          '告警：' + data.content + '<br/>' +
          '企业：' + data.company + '<br/>' +
          '位置：' + data.location + '<br/>' +
          '电话：' + data.tel
        ;
        div.appendChild(contentDiv);

				const label = new CSS2DObject(div);
				label.position.set(vector.x, vector.y, vector.z + 0.65);
        label.visible = false;
        this.alarmNameMeshArr.push(label);
        this.groupTwo.add(label);
        // this.scene.add(spritey);

      },
      
      // 能源 - 光波
      setEnergyWave(vector, color) {
        const geometry = new THREE.PlaneBufferGeometry(1, 1); //默认在XOY平面上
        const textureLoader = new THREE.TextureLoader(); // TextureLoader创建一个纹理加载器对象
        const texture = textureLoader.load('/static/map/texture/alarm.png');

        const material = new THREE.MeshBasicMaterial({
          color: color,
          map: texture,
          transparent: true, //使用背景透明的png贴图，注意开启透明计算
          opacity: 1.0,
          side: THREE.FrontSide,
          depthWrite: false, //禁止写入深度缓冲区数据
          blending: THREE.AdditiveBlending,

        });

        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(vector.x, vector.y, vector.z);
        mesh.scale.set(0.4, 0.4, 0.4);  // 设置mesh大小

        this.energyWaveMeshArr.push(mesh);
        this.groupThree.add(mesh);
      },

      // 能源 - 三角锥标记
      setEnergyCylinder(vector, color) {
        const geometry = new THREE.CylinderGeometry(0.1, 0.0, 0.3, 20);
        let material = new THREE.MeshPhongMaterial({  // ShaderMaterial
            color: color,
            side: THREE.FrontSide,
            // blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.8,
        });

        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.set(vector.x, vector.y, vector.z + 0.3);
        cylinder.rotateX(Math.PI / 2);
        cylinder.scale.set(1, 1, 1);

        this.energyCylinderMeshArr.push(cylinder);
        this.groupThree.add(cylinder);
      },

      // 能源 - 名称显示
      setEnergyName(vector, color, data) {
        // CSS2DRenderer生成的标签直接就是挂在真实的DOM上，并非是Vue的虚拟DOM上
				const div = document.createElement('div');
				div.className = 'alarm-label';

        const icon = document.createElement('span');
        icon.className = 'alarm-label-icon';
				icon.textContent = '◆';
        icon.style.color = color;
        div.appendChild(icon);

        const text = document.createElement('span');
        text.className = 'alarm-label-text';
				text.textContent = data.type;
        div.appendChild(text);

				const contentDiv = document.createElement('div');
				contentDiv.className = 'alarm-label-content';
				contentDiv.innerHTML = 
          '告警：' + data.content + '<br/>' +
          '企业：' + data.company + '<br/>' +
          '位置：' + data.location + '<br/>' +
          '电话：' + data.tel
        ;
        div.appendChild(contentDiv);

				const label = new CSS2DObject(div);
				label.position.set(vector.x, vector.y, vector.z + 0.65);
        label.visible = false;
        this.energyNameMeshArr.push(label);
        this.groupThree.add(label);
        // this.scene.add(spritey);

      },

      // 监测 - 光波
      setMonitorWave(vector) {
        const geometry = new THREE.PlaneBufferGeometry(1, 1); //默认在XOY平面上
        const textureLoader = new THREE.TextureLoader(); // TextureLoader创建一个纹理加载器对象
        const texture = textureLoader.load('/static/map/texture/marker.png');

        const material = new THREE.MeshBasicMaterial({
          color: "#B3FFFF",
          map: texture,
          transparent: true, //使用背景透明的png贴图，注意开启透明计算
          opacity: 0.9,
          side: THREE.FrontSide,
          depthWrite: false, //禁止写入深度缓冲区数据
          // blending: THREE.AdditiveBlending,

        });

        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(vector.x, vector.y, vector.z);
        mesh.scale.set(0.4, 0.4, 0.4);  // 设置mesh大小

        this.monitorWaveMeshArr.push(mesh);
        this.groupFour.add(mesh);
      },

      // 监测 - 标记
      setMonitorIcon(vector) {
        const geometry = new THREE.PlaneGeometry(1, 1);
        const texture = new THREE.TextureLoader().load('/static/map/texture/monitor.png')
        let material = new THREE.MeshPhongMaterial({
          map: texture,
          // color: "#ffffff",
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: 0.9,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(vector.x, vector.y, vector.z + 0.25);
        mesh.rotateX(Math.PI / 4);
        mesh.scale.set(0.3, 0.3, 0.3);
        // mesh.lookAt(this.camera.position)

        this.monitorIconMeshArr.push(mesh);
        this.groupFour.add(mesh);
      },

      // 监测 - 名称显示
      setMonitorName(vector, data) {
        // CSS2DRenderer生成的标签直接就是挂在真实的DOM上，并非是Vue的虚拟DOM上
				const div = document.createElement('div');
				div.className = 'alarm-label';

        const icon = document.createElement('span');
        icon.className = 'alarm-label-icon';
				icon.textContent = '◉';
        icon.style.color = "#ffffff";
        div.appendChild(icon);

        const text = document.createElement('span');
        text.className = 'alarm-label-text';
				text.textContent = data.monitor;
        div.appendChild(text);

				const contentDiv = document.createElement('div');
				contentDiv.className = 'alarm-label-content';
				contentDiv.innerHTML = 
          '状态：' + data.content + '<br/>' +
          '位置：' + data.location
        ;
        div.appendChild(contentDiv);

				const label = new CSS2DObject(div);
				label.position.set(vector.x, vector.y, vector.z + 0.65);
        label.visible = false;
        this.monitorNameMeshArr.push(label);
        this.groupFour.add(label);
        // this.scene.add(spritey);

      },

      // 射线
      setRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.tooltip = document.getElementById('tooltip');
        const onMouseMove = (event) => {
          this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          this.tooltip.style.left = event.clientX + 2 + 'px';
          this.tooltip.style.top = event.clientY + 2 + 'px';
        }

        // 点击地图事件
        const onClick = (event) => {
          // console.log(this.lastPick);
          if(this.lastPick && "point" in this.lastPick) this.mapClickTween(this.lastPick.point);
          else this.resetCameraTween();
        }

        window.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('click', onClick, false);

      },

      // 鼠标悬浮显示
      showTip() {
        // 显示省份的信息
        if (this.lastPick) {
          const properties = this.lastPick.object.parent.properties;

          this.tooltip.textContent = properties.name;

          this.tooltip.style.visibility = 'visible';
        } else {
          this.tooltip.style.visibility = 'hidden';
        }
      },

      // 窗口变化
      onWindowSize() {
        // let container = document.getElementById("container");
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.labelRenderer.setSize(this.container.clientWidth, this.container.clientHeight);
      },

      // Tween - 城市光柱动画
      cityCylinderTween() {
        this.cityCylinderMeshArr.forEach(mesh => {
          // console.log(mesh);
          const begin = {
            z: mesh.position.z,
          };
          const end = {
            z: mesh.position.z + mesh._height,
          };
          const self = this;
          this.$tween.use({
              begin,
              end,
              time: 1000,
              onUpdate(obj) {
                mesh.position.z = obj.z;
              },
              onComplete() {
                // 动画结束，显示数据
                self.cityNumMeshArr.forEach(e => {
                  e.visible = true;
                })
                // console.log(document.getElementsByClassName("city-num-label"));
                // for (let i = 0; i < document.getElementsByClassName("city-num-label").length; i++) {
                //   document.getElementsByClassName("city-num-label")[i].style.display = "block"
                // }
              }
          });          
        })
      },

      // Tween - 加载时相机移动动画
      cameraTween(i) {
        // console.log("cameraTween");

        !i ? i = 0 : i = i;
        if(i > this.cameraPosArr.length - 1) {
          // this.cityCylinderTween();
          return false;
        }

        //关闭控制器
			  this.controller.enabled = false;

        const begin = {
          x: this.camera.position.x,
          y: this.camera.position.y,
          z: this.camera.position.z,
        };
        const end = {
          x: this.cameraPosArr[i].x,
          y: this.cameraPosArr[i].y,
          z: this.cameraPosArr[i].z,          
          // x: 0,
          // y: -3.0,
          // z: 3.8,
        };
        const self = this;
        this.$tween.use({
            begin,
            end,
            time: 1500,
            onUpdate(obj) {
              self.camera.position.x = obj.x;
              self.camera.position.y = obj.y;
              self.camera.position.z = obj.z;
              
              // self.controller.target.x = obj.x;
              // self.controller.target.y = obj.y;
              // self.controller.target.z = obj.z;

              // 控制器更新
              self.controller.update();
            },
            onComplete() {
              self.controller.enabled = true;
              self.cameraTween(i+1);
            }
        });
      },
      
      // Tween - 点击省份动画
      mapClickTween(pos) {
        //关闭控制器
			  this.controller.enabled = false;

        const begin = {
          x: this.camera.position.x,
          y: this.camera.position.y,
          z: this.camera.position.z,
        };
        const end = {
          x: pos.x,
          y: pos.y,
          z: pos.z + 2.5,          
        };
        const self = this;
        this.$tween.use({
            begin,
            end,
            time: 500,
            onUpdate(obj) {
              self.camera.position.x = obj.x;
              self.camera.position.y = obj.y;
              self.camera.position.z = obj.z;

              self.camera.lookAt(obj.x, obj.y, obj.z);

              // 控制器更新
              self.controller.update();
            },
            onComplete() {
              self.controller.enabled = true;
            }
        });
      },

      // Tween - 重置相机
      resetCameraTween() {
        //关闭控制器
			  this.controller.enabled = false;

        const begin = {
          x: this.camera.position.x,
          y: this.camera.position.y,
          z: this.camera.position.z,
        };
        const end = {
          x: this.cameraPosArr[this.cameraPosArr.length - 1].x,
          y: this.cameraPosArr[this.cameraPosArr.length - 1].y,
          z: this.cameraPosArr[this.cameraPosArr.length - 1].z,          
        };
        const self = this;
        this.$tween.use({
            begin,
            end,
            time: 500,
            onUpdate(obj) {
              self.camera.position.x = obj.x;
              self.camera.position.y = obj.y;
              self.camera.position.z = obj.z;

              self.camera.lookAt(0, 0, 0);

              // 控制器更新
              self.controller.update();
            },
            onComplete() {
              self.controller.enabled = true;
            }
        });
      },

      // 动画
      animate() {
        requestAnimationFrame(this.animate);

        this.showTip();
        this.animationMouseover();
        
        // city
        this.animationCityWave();
        this.animationCityMarker();
        this.animationCityCylinder();
        this.animationCityEdgeLight();
        
        // alarm
        this.animationAlarmWave();
        this.animationAlarmCylinder();

        // energy
        this.animationEnergyWave();
        
        // monitor
        this.animationMonitorWave();
        
        this.controller.update();
        this.renderer.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);
      },
      
      // 动画 - 鼠标悬浮动作
      animationMouseover() {
        // 通过摄像机和鼠标位置更新射线
        this.raycaster.setFromCamera(this.mouse, this.camera)
        // 计算物体和射线的焦点，与当场景相交的对象有那些
        const intersects = this.raycaster.intersectObjects(
          this.scene.children,
          true  // true，则同时也会检测所有物体的后代
        )
        // 恢复上一次清空的
        if (this.lastPick) {
          this.lastPick.object.material[0].color.set('#4161ff');
          // this.lastPick.object.material[1].color.set('#00035d');
        }
        this.lastPick = null;
        this.lastPick = intersects.find(
          (item) => item.object.material && item.object.material.length === 2  // 选择map object
        )
        if (this.lastPick) {
          this.lastPick.object.material[0].color.set('#00035d');
          // this.lastPick.object.material[1].color.set('#00035d');
        }
      },

      // 动画 - 城市光柱
      animationCityCylinder() {

        this.cityCylinderMeshArr.forEach(mesh => {
          // console.log(mesh);
          
          // 着色器动作
          // let viewVector = new THREE.Vector3().subVectors(this.camera.position, mesh.getWorldPosition());
          // mesh.material.uniforms.viewVector.value = this.camera.position;

          // mesh.translateY(0.05);
          // mesh.position.z <= mesh._height * 2 ? mesh.position.z += 0.05 : "";

          // mesh.scale.z <= 1 ? mesh.scale.z += 0.05 : "";

        })          
      },

      // 动画 - 城市光波
      animationCityWave() {
        // console.log(this.cityWaveMesh);
        this.cityWaveMeshArr.forEach(mesh => {
          // console.log(mesh);
          mesh.size += 0.005;  // Math.random() / 100 / 2
          let scale = mesh.size / 1;
          mesh.scale.set(scale, scale, scale);
          if(mesh.size <= 0.5) {
            mesh.material.opacity = 1;
          } else if (mesh.size > 0.5 && mesh.size <= 1) {
            mesh.material.opacity = 1.0 - (mesh.size - 0.5) * 2;  // 0.5以后开始加透明度直到0
          } else if (mesh.size > 1 && mesh.size < 2) {
            mesh.size = 0;
          }
        })
      },
      // 动画 - 城市标记
      animationCityMarker() {
        this.cityMarkerMeshArr.forEach(mesh => {
          // console.log(mesh);
          mesh.rotation.z += 0.05;
        })        
      },
      // 动画 - 城市边缘流光
      animationCityEdgeLight() {
        if(this.mapEdgeLightObj.lightOpacitys && this.mapEdgeLightObj.mapEdgePoints) {
          if (this.mapEdgeLightObj.lightCurrentPos > this.mapEdgeLightObj.mapEdgePoints.length) {
            this.mapEdgeLightObj.lightCurrentPos = 0;
          }

          this.mapEdgeLightObj.lightCurrentPos += this.mapEdgeLightObj.lightSpeed;
          for (let i = 0; i < this.mapEdgeLightObj.lightSpeed; i++) {
            this.mapEdgeLightObj.lightOpacitys[(this.mapEdgeLightObj.lightCurrentPos - i) % this.mapEdgeLightObj.mapEdgePoints.length] = 0;
          }

          for (let i = 0; i < 100; i++) {
            this.mapEdgeLightObj.lightOpacitys[(this.mapEdgeLightObj.lightCurrentPos + i) % this.mapEdgeLightObj.mapEdgePoints.length] = i / 50 > 2 ? 2 : i / 50;
          }

          if (this.mapEdgeLightObj.lightOpacityGeometry) {
            this.mapEdgeLightObj.lightOpacityGeometry.attributes.aOpacity.needsUpdate = true;
          }
        }
      },

      // 动画 - 告警光波
      animationAlarmWave() {
        // console.log(this.alarmWaveMeshArr);
        this.alarmWaveMeshArr.forEach(mesh => {
          // console.log(mesh);
          mesh.rotation.z -= 0.01;
        })
      },

      // 动画 - 告警三角锥
      animationAlarmCylinder() {
        this.alarmCylinderMeshArr.forEach(mesh => {
          // console.log(mesh);
          mesh.rotation.y += 0.03;

          // if(mesh.position.z < 0.8) {
          //   mesh.position.z += 0.03;
          // } else if(mesh.position.z > 1.2) {
          //   mesh.position.z -= 0.03;
          // }
        })        
      },

      // 动画 - 能源光波
      animationEnergyWave() {
        this.energyWaveMeshArr.forEach(mesh => {
          // console.log(mesh);
          mesh.rotation.z -= 0.01;
        })
      },

      // 动画 - 监测光波
      animationMonitorWave() {
        this.monitorWaveMeshArr.forEach(mesh => {
          // console.log(mesh);
          mesh.rotation.z += 0.03;
        })
      },

      // 切换Group形态
      groupOneChange() {
        console.log("groupOneChange");
        // CSS2DObject数据单独做处理
        this.cityNumMeshArr.forEach(e => {e.visible = true});
        this.alarmNameMeshArr.forEach(e => {e.visible = false});
        this.energyNameMeshArr.forEach(e => {e.visible = false});
        this.monitorNameMeshArr.forEach(e => {e.visible = false});

        this.groupOne.visible = true;
        this.groupTwo.visible = false;
        this.groupThree.visible = false;
        this.groupFour.visible = false;

      },
      groupTwoChange() {
        console.log("groupTwoChange");
        // CSS2DObject数据单独做处理
        this.cityNumMeshArr.forEach(e => {e.visible = false});
        this.alarmNameMeshArr.forEach(e => {e.visible = true});
        this.energyNameMeshArr.forEach(e => {e.visible = false});        
        this.monitorNameMeshArr.forEach(e => {e.visible = false});

        this.groupOne.visible = false;
        this.groupTwo.visible = true;
        this.groupThree.visible = false;
        this.groupFour.visible = false;
      },
      groupThreeChange() {
        console.log("groupThreeChange");
        // CSS2DObject数据单独做处理
        this.cityNumMeshArr.forEach(e => {e.visible = false});
        this.alarmNameMeshArr.forEach(e => {e.visible = false});
        this.energyNameMeshArr.forEach(e => {e.visible = true});    
        this.monitorNameMeshArr.forEach(e => {e.visible = false});

        this.groupOne.visible = false;
        this.groupTwo.visible = false;       
        this.groupThree.visible = true;    
        this.groupFour.visible = false;
      },
      groupFourChange() {
        console.log("groupFourChange");
        // CSS2DObject数据单独做处理
        this.cityNumMeshArr.forEach(e => {e.visible = false});
        this.alarmNameMeshArr.forEach(e => {e.visible = false}); 
        this.energyNameMeshArr.forEach(e => {e.visible = false});     
        this.monitorNameMeshArr.forEach(e => {e.visible = true});

        this.groupOne.visible = false;
        this.groupTwo.visible = false;    
        this.groupThree.visible = false;  
        this.groupFour.visible = true;       
      }
    }
  };
</script>

<style>
#container {
  position: absolute;
  width: 100%;
  height: 100%;
}
#tooltip {
  position: absolute;
  z-index: 2;
  background: linear-gradient(180deg, #B0DEFF 0%, #2C4FDC 100%);
  padding: 6px 10px;
  color: #fff;
  border: 2px solid #FAE52D;
  font-weight: bold;
  font-size: 16px;
  /* border-radius: 4px; */
  visibility: hidden;
}
#cityName {
  z-index: 2;
}
.button-group {
  position: absolute;
  left: 24px;
  top: 24px;
  z-index: 2;
}

/* 城市统计数据 */
.city-num-label {
  width: 32px;
  height: 32px;
  line-height: 32px;
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
  border-radius: 100px;
  background-color: rgba(192, 174, 12, 0.8);
  box-shadow: 0px 0px 4px rgba(237, 230, 25, 0.5);
  border: 2px solid rgba(237, 230, 25, 1);
  /* font-family: 'PingFang SC'; */
  text-align: center;
  cursor: pointer;
  /* opacity: 0.8; */
  transition: all 0.1s linear;
}
.city-num-label:hover {
  margin-top: -60px;
  width: 300px;
  min-height: 140px;
  padding: 16px 16px;
  text-align: left;  
  /* opacity: 1.0; */
  border-radius: 4px;
  box-shadow: 0px 0px 12px rgba(237, 230, 25, 0.9);
}
.city-num-label-content {
  display: none;
  font-size: 12px;
  line-height: 24px;
  color: #eeeeee;
}
.city-num-label:hover .city-num-label-content {
  display: block;
}
/* 告警名称 */
.alarm-label {
  min-width: 100px;
  height: 32px;
  line-height: 30px;
  border-radius: 4px;  
  background: rgba(10, 26, 52, 0.8);
  border: 1px solid #59AFF9;
  box-shadow: 0px 0px 4px rgba(3, 149, 255, 0.5); 
  text-align: center;
  cursor: pointer;
  transition: all 0.1s linear;
}
.alarm-label:hover {
  margin-top: -60px;
  width: 300px;
  min-height: 140px;
  padding: 16px 16px;
  text-align: left;
  /* opacity: 1.0; */
  box-shadow: 0px 0px 12px rgba(3, 149, 255, 0.9);
}
.alarm-label-icon {
  margin-right: 4px;
  font-size: 22px;
}
.alarm-label-text {
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
}
.alarm-label-content {
  display: none;
  font-size: 12px;
  line-height: 24px;
  color: #eeeeee;
}
.alarm-label:hover .alarm-label-content {
  display: block;
}
</style>