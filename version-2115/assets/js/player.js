(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function setMessage(wrapper, value) {
        var message = wrapper.querySelector('.player-message');
        if (message) {
            message.textContent = value || '';
        }
    }

    function prepareVideo(video, wrapper) {
        var stream = video.getAttribute('data-stream');
        if (!stream) {
            setMessage(wrapper, '播放暂时不可用，请稍后重试。');
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 60
            });

            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setMessage(wrapper, '播放暂时不可用，请稍后重试。');
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
        } else {
            setMessage(wrapper, '播放暂时不可用，请稍后重试。');
        }
    }

    ready(function () {
        document.querySelectorAll('.player-shell').forEach(function (wrapper) {
            var video = wrapper.querySelector('video');
            var button = wrapper.querySelector('.video-play-button');

            if (!video) {
                return;
            }

            prepareVideo(video, wrapper);

            function play() {
                setMessage(wrapper, '');
                if (button) {
                    button.classList.add('is-hidden');
                }
                var request = video.play();
                if (request && typeof request.catch === 'function') {
                    request.catch(function () {
                        if (button) {
                            button.classList.remove('is-hidden');
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener('click', play);
            }

            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });

            video.addEventListener('pause', function () {
                if (button && video.currentTime === 0) {
                    button.classList.remove('is-hidden');
                }
            });
        });
    });
})();
