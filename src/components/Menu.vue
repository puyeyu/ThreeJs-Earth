<template>
  <div>
    <div id="container"></div>
    <!-- <div id="tooltip"></div> -->
  </div>
</template>


<script>
  import * as THREE from "three";
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js';

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

        groupOne: new THREE.Group(),
        groupTwo: new THREE.Group(),

        waveMesh1: null,
        waveMesh2: null,
        waveMesh3: null,
        waveMesh4: null,

        clock: new THREE.Clock()


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
        this.addSpace();
        this.setRaycaster();
        this.setLight();
        this.addMenu();
        this.addWave();
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

        this.camera.position.set(0, 1, 2);  // 0, -5, 1
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

      },

      setController() {
        // this.controller = new OrbitControls(this.camera, this.renderer.domElement);
				// this.controller.minDistance = 1;
				// this.controller.maxDistance = 5;  // 5.5

        // 阻尼（惯性）
        // this.controller.enableDamping = true;
				// this.controller.dampingFactor = 0.04;

        // this.controller.minAzimuthAngle = -Math.PI / 3;
				// this.controller.maxAzimuthAngle = Math.PI / 3;

        // this.controller.minPolarAngle = 1;
				// this.controller.maxPolarAngle = Math.PI - 0.1;

        // 修改相机的lookAt是不会影响THREE.OrbitControls的target的
        // this.controller.target = new THREE.Vector3(0, 0, 0); 


        // 测试其它控制器
				this.controller = new FirstPersonControls(this.camera, this.renderer.domElement);
				this.controller.lookVertical = false;
				this.controller.mouseDragOn = false;
				this.controller.movementSpeed = 0;
				this.controller.lookSpeed = 0.01;        

				// this.controller.lookAt(new THREE.Vector3(0, 0, 0));
				// this.controller.constrainVertical = true;
				// this.controller.heightMax = 0.1;
				// this.controller.heightMin = 0;        
				// this.controller.verticalMax = Math.PI;
				// this.controller.verticalMin = Math.PI / 2;

        
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
        const ambientLight = new THREE.AmbientLight(0x404040, 4);
        this.scene.add(ambientLight);
        // // 平行光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        // this.scene.add(directionalLight); 

        // 点光源 - 照模型
        const test = new THREE.PointLight("#ffffff", 10, 2);
        test.position.set(0, 0, 0);
        this.scene.add(test);
        const testHelperMap = new THREE.PointLightHelper(test);
        // this.scene.add(testHelperMap);

      },

      addMenu() {
        const lookAtPos = this.camera.position;  // new THREE.Vector3(0, 0.5, 1)

        // 菜单1
        const mesh1 = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1), 
          new THREE.MeshBasicMaterial({
          map: new THREE.TextureLoader().load('/static/home/menu/1.png'),
          // color: 0xffff00, 
          side: THREE.DoubleSide,
          depthTest: false,
          blending: THREE.AdditiveBlending
        }));
        mesh1.position.set(-2.0, 0.3, 0);
        mesh1.lookAt(lookAtPos);
        mesh1._type = "menu";
        mesh1._router = 1;

        // 菜单2
        const mesh2 = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1), 
          new THREE.MeshBasicMaterial({
          map: new THREE.TextureLoader().load('/static/home/menu/2.png'),
          // color: 0xffff00, 
          side: THREE.DoubleSide,
          depthTest: false,
          blending: THREE.AdditiveBlending
        }));
        mesh2.position.set(-1.0, 0.4, -0.5);
        mesh2.lookAt(lookAtPos);
        mesh2._type = "menu";
        mesh2._router = 2;

        // 菜单3
        const mesh3 = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1), 
          new THREE.MeshBasicMaterial({
          map: new THREE.TextureLoader().load('/static/home/menu/3.png'),
          // color: 0xffff00, 
          side: THREE.DoubleSide,
          depthTest: false,
          blending: THREE.AdditiveBlending
        }));
        mesh3.position.set(0, 0.4, -1);
        mesh3.lookAt(lookAtPos);
        mesh3._type = "menu";
        mesh3._router = 3;

        // 菜单4
        const mesh4 = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1), 
          new THREE.MeshBasicMaterial({
          map: new THREE.TextureLoader().load('/static/home/menu/4.png'),
          // color: 0xffff00, 
          side: THREE.DoubleSide,
          depthTest: false,
          blending: THREE.AdditiveBlending
        }));
        mesh4.position.set(1.0, 0.4, -0.5);
        mesh4.lookAt(lookAtPos);
        mesh4._type = "menu";
        mesh4._router = 4;

        // 菜单5
        const mesh5 = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1), 
          new THREE.MeshBasicMaterial({
          map: new THREE.TextureLoader().load('/static/home/menu/5.png'),
          // color: 0xffff00, 
          side: THREE.DoubleSide,
          depthTest: false,
          blending: THREE.AdditiveBlending
        }));
        mesh5.position.set(2.0, 0.3, 0);
        mesh5.lookAt(lookAtPos);
        mesh5._type = "menu";
        mesh5._router = 5;

        this.groupOne.add(mesh1);
        this.groupOne.add(mesh2);
        this.groupOne.add(mesh3);
        this.groupOne.add(mesh4);
        this.groupOne.add(mesh5);

        this.scene.add(this.groupOne);
      },

      addWave() {
        const mesh1 = new THREE.Mesh(
          new THREE.PlaneGeometry(1.0, 1.0), 
          new THREE.MeshBasicMaterial({
          map: new THREE.TextureLoader().load('/static/home/wave/1.png'),
          // color: 0xffff00, 
          side: THREE.DoubleSide,
          depthTest: false,
          blending: THREE.AdditiveBlending
        }));
        mesh1.position.set(0, -1.3, 0);
        mesh1.rotateX(Math.PI / 2);
        this.waveMesh1 = mesh1;


        const mesh2 = new THREE.Mesh(
          new THREE.PlaneGeometry(1.8, 1.8), 
          new THREE.MeshBasicMaterial({
          map: new THREE.TextureLoader().load('/static/home/wave/2.png'),
          // color: 0xffff00, 
          side: THREE.DoubleSide,
          depthTest: false,
          blending: THREE.AdditiveBlending
        }));
        mesh2.position.set(0, -0.8, 0);
        mesh2.rotateX(Math.PI / 2);
        this.waveMesh2 = mesh2;


        const mesh3 = new THREE.Mesh(
          new THREE.PlaneGeometry(2, 2), 
          new THREE.MeshBasicMaterial({
          map: new THREE.TextureLoader().load('/static/home/wave/3.png'),
          // color: 0xffff00, 
          side: THREE.DoubleSide,
          depthTest: false,
          blending: THREE.AdditiveBlending
        }));
        mesh3.position.set(0, -0.3, 0);
        mesh3.rotateX(Math.PI / 2);
        this.waveMesh3 = mesh3;


        const mesh4 = new THREE.Mesh(
          new THREE.PlaneGeometry(3.2, 3.2), 
          new THREE.MeshBasicMaterial({
          map: new THREE.TextureLoader().load('/static/home/wave/4.png'),
          // color: 0xffff00, 
          side: THREE.DoubleSide,
          depthTest: false,
          blending: THREE.AdditiveBlending
        }));
        mesh4.position.set(0, -0.3, 0);
        mesh4.rotateX(Math.PI / 2);
        this.waveMesh4 = mesh4;


        this.groupTwo.add(mesh1);
        this.groupTwo.add(mesh2);
        this.groupTwo.add(mesh3);
        this.groupTwo.add(mesh4);

        this.scene.add(this.groupTwo);
      },


      // 宇宙模型
      addSpace() {
        let textures = [
            new THREE.TextureLoader().load('/static/map/texture/space/4.jpg'), // right
            new THREE.TextureLoader().load('/static/map/texture/space/2.jpg'), // left
            new THREE.TextureLoader().load('/static/map/texture/space/1.jpg'), // top
            new THREE.TextureLoader().load('/static/map/texture/space/6.jpg'), // bottom
            new THREE.TextureLoader().load('/static/map/texture/space/3.jpg'), // back
            new THREE.TextureLoader().load('/static/map/texture/space/5.jpg') // front
        ];
        let materials = [
          new THREE.MeshBasicMaterial({map: textures[0], side: THREE.BackSide, precision: "highp"}),
          new THREE.MeshBasicMaterial({map: textures[1], side: THREE.BackSide, precision: "highp"}),
          new THREE.MeshBasicMaterial({map: textures[2], side: THREE.BackSide, precision: "highp"}),
          new THREE.MeshBasicMaterial({map: textures[3], side: THREE.BackSide, precision: "highp"}),
          new THREE.MeshBasicMaterial({map: textures[4], side: THREE.BackSide, precision: "highp"}),
          new THREE.MeshBasicMaterial({map: textures[5], side: THREE.BackSide, precision: "highp"}),
        ];
        const geometry = new THREE.BoxGeometry(300, 300, 300);
        let mesh = new THREE.Mesh(geometry, materials);
        // console.log(mesh);

        // const position = mesh.geometry.attributes.position;
        // const vector = new THREE.Vector3();
        // for ( let i = 0, l = position.count; i < l; i ++ ){
        //     vector.fromBufferAttribute( position, i );
        //     vector.applyMatrix4(mesh.matrixWorld);
        //     console.log(vector);
        // }

        // for (var i = 0, l = mesh.geometry.attributes.position.length; i < l; i++) {
        //   var vertex = mesh.geometry.vertices[i];
        //   vertex.normalize();
        //   vertex.multiplyScalar(550);
        // }     

        mesh.scale.x = -1;
        this.scene.add(mesh);

      },

      // 射线
      setRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.tooltip = document.getElementById('tooltip');
        const onMouseMove = (event) => {
          this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          // this.tooltip.style.left = event.clientX + 2 + 'px';
          // this.tooltip.style.top = event.clientY + 2 + 'px';
        }

        const onMouseClick = (event) => {
          // console.log("onMouseClick");
          this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          this.menuClick();
        }

        window.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('click', onMouseClick, false);
      },

      // 鼠标点击菜单
      menuClick() {
        if (this.lastPick) {
          // console.log(this.lastPick);
          // alert("跳转至" + this.lastPick.object._router)

          // const properties = this.lastPick.object.parent.properties;

          // this.tooltip.textContent = properties.name;

          // this.tooltip.style.visibility = 'visible';
        } else {
          // this.tooltip.style.visibility = 'hidden';
        }
      },

      // 窗口变化
      onWindowSize() {
        // let container = document.getElementById("container");
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
      },

      // 动画
      animate() {
        requestAnimationFrame(this.animate);

        this.animationMouseover();
        this.animationWave();

        this.controller.update(this.clock.getDelta());
        this.renderer.render(this.scene, this.camera);

        // console.log(this.camera.rotation.y);
        // if(this.camera.rotation.y > 0.5) {
        //   this.camera.rotation.y = 0.5
        // }
        // if(this.camera.rotation.y < -0.5) {
        //   this.camera.rotation.y = -0.5
        // }        
      },

      // 动画 - 城市标记
      animationWave() {
        this.waveMesh1.rotation.z -= 0.01;
        this.waveMesh2.rotation.z -= 0.01;
        this.waveMesh3.rotation.z -= 0.01;
        this.waveMesh4.rotation.z += 0.005;

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
          this.lastPick.object.position.y -= 0.02;
          this.lastPick.object.scale.set(1, 1, 1);
        }
        this.lastPick = null;
        this.lastPick = intersects.find(
          (item) => item.object._type && item.object._type === "menu"
        )
        if (this.lastPick) {
          // console.log(this.lastPick);
          this.lastPick.object.position.y += 0.02;
          this.lastPick.object.scale.set(1.2, 1.2, 1.2);
        }
      },

      // 切换Group形态
      groupOneChange() {
        console.log("groupOneChange");
      },
      groupTwoChange() {
        console.log("groupTwoChange");
      },
      groupThreeChange() {
        console.log("groupThreeChange");
      },
      groupFourChange() {
        onsole.log("groupFourChange");
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
  /* position: absolute;
  z-index: 2;
  background: linear-gradient(180deg, #B0DEFF 0%, #2C4FDC 100%);
  padding: 6px;
  color: #fff;
  border: 2px solid #FAE52D;
  font-size: 14px;
  border-radius: 4px;
  visibility: hidden; */
}

.button-group {
  position: absolute;
  left: 24px;
  top: 24px;
  z-index: 2;
}

</style>