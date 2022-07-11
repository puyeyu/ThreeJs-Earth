import TWEEN from '@tweenjs/tween.js';

export default {
    install: function(Vue) {
        Vue.prototype.$tween = this;
        Vue.prototype.$tweener = TWEEN;
    },
    pause: function(tw) {
        tw.pause();
    },
    use({
        begin,
        end,
        time = 1500,
        delay = 0,
        easing = TWEEN.Easing.Linear.None,
        onStart,
        onUpdate,
        onComplete,
    }) {
        // 内部对应动画响应和视图渲染自动维护
        let timer = requestAnimationFrame(function move() {
            timer = requestAnimationFrame(move);
            TWEEN.update();
        });
        new TWEEN.Tween(begin)
            .to(end, time)
            .delay(delay)
            .easing(easing)
            .onStart(() => {
                onStart && onStart();
            })
            .onUpdate((value, step) => {
                onUpdate && onUpdate(value);
            })
            .onComplete(() => {
                onComplete && onComplete();
                cancelAnimationFrame(timer);
            })
            .start();
    },
};