define([
  'bonsai/renderer/svg/svg'
], function(SvgRenderer) {
  describe('SvgRenderer', function() {
    function createFakeDomNode() {
      return {
        ownerSVGElement: {},
        appendChild: function() {},
        setAttribute: function() {}
      };
    }
    function createSvgRenderer() {
      return new SvgRenderer(createFakeDomNode(), 1, 1);
    }

    describe('allowEventDefaults', function() {
      it('should assign the constructor value as property', function() {
        expect(new SvgRenderer(createFakeDomNode(), 1, 1, {
          allowEventDefaults: true
        }).allowEventDefaults).toBe(true);
      });

      it('should not call .preventDefault() on events when allowEventDefaults is set to true', function() {
        var renderer = createSvgRenderer();
        renderer.allowEventDefaults = true;

        var event = {
          target: createFakeDomNode(),
          preventDefault: jasmine.createSpy('preventDefault')
        };
        renderer.handleEvent(event);
        expect(event.preventDefault).not.toHaveBeenCalled();
      });

      it('should call .preventDefault() on events when allowEventDefaults is set to false', function() {
        var renderer = createSvgRenderer();
        renderer.allowEventDefaults = false;

        var event = {
          target: createFakeDomNode(),
          preventDefault: jasmine.createSpy('preventDefault')
        };
        renderer.handleEvent(event);
        expect(event.preventDefault).toHaveBeenCalled();
      });

      it('should call .preventDefault() on events when allowEventDefaults is not set', function() {
        var renderer = createSvgRenderer();

        var event = {
          target: createFakeDomNode(),
          preventDefault: jasmine.createSpy('preventDefault')
        };
        renderer.handleEvent(event);
        expect(event.preventDefault).toHaveBeenCalled();
      });
    });

    describe('#render', function() {
      it('should emit a "canRender" event after rendering', function() {
        var onCanRender = jasmine.createSpy('onCanRender');
        var renderer = createSvgRenderer();
        renderer.on('canRender', onCanRender);

        renderer.render([]);

        expect(onCanRender).toHaveBeenCalled();
      });
    });

    describe('applyFilter', function() {
      it('is a function', function() {
        expect(typeof createSvgRenderer().applyFilters).toBe('function');
      });
      it('adds a `_filterSignature` attribute to the node', function() {
        var node = createFakeDomNode();
        createSvgRenderer().applyFilters(node, []);
        expect(node._filterSignature).toBe('filter:');
      });
      it('adds a filter:colorMatrix() signature when a `colorMatrix` filter is applied', function() {
        var node = createFakeDomNode(), filter = { type: 'colorMatrix', value: [] };
        createSvgRenderer().applyFilters(node, [filter]);
        expect(node._filterSignature).toBe('filter:colorMatrix()');
      });
    });

    describe('drawAudio', function() {
      it('is a function', function() {
        expect(typeof createSvgRenderer().drawAudio).toBe('function');
      });
      describe('handles a Video Object depending on `message.attributes`', function() {
        it('attributes.playing=true', function() {
          var audioElement = { play: jasmine.createSpy('play') };
          var message = { attributes: { playing: true } };
          createSvgRenderer().drawAudio(audioElement, message);
          expect(audioElement.play).toHaveBeenCalled();
        });
        it('attributes.playing=false', function() {
          var audioElement = { pause: jasmine.createSpy('pause') };
          var message = { attributes: { playing: false } };
          createSvgRenderer().drawAudio(audioElement, message);
          expect(audioElement.pause).toHaveBeenCalled();
        });
        it('volume is not changed w/o attributes.volume', function() {
          var audioElement = { volume: 0.123 };
          var message = { attributes: {} };
          createSvgRenderer().drawAudio(audioElement, message);
          expect(audioElement.volume).toBe(0.123);
        });
        it('attributes.volume=0', function() {
          var audioElement = { volume: -1 };
          var message = { attributes: { volume: 0 } };
          createSvgRenderer().drawAudio(audioElement, message);
          expect(audioElement.volume).toBe(0);
        });
        it('attributes.volume=0.5', function() {
          var audioElement = { volume: -1 };
          var message = { attributes: { volume: 0.5 } };
          createSvgRenderer().drawAudio(audioElement, message);
          expect(audioElement.volume).toBe(0.5);
        });
        it('attributes.volume=1', function() {
          var audioElement = { volume: -1 };
          var message = { attributes: { volume: 1.0 } };
          createSvgRenderer().drawAudio(audioElement, message);
          expect(audioElement.volume).toBe(1.0);
        });
        it('attributes.volume=NaN (casted to `0`)', function() {
          var audioElement = { volume: -1 };
          var message = { attributes: { volume: NaN } };
          createSvgRenderer().drawAudio(audioElement, message);
          expect(audioElement.volume).toBe(0.0);
        });
      });
    });

    function createTouchEvent(which) {
      var evt = document.createEvent('UIEvent');
      evt.initEvent(which, true, true);
      evt.view = window;
      evt.altKey = false;
      evt.ctrlKey = false;
      evt.shiftKey = false;
      evt.metaKey = false;
      evt.touches = [{identifier:1}];
      evt.changedTouches = evt.touches;
      return evt;
    }

    describe('handleEvent', function() {
      it('should only fire one `click` for touchstart+touchend', function() {
        var numCalls = 0;
        var listener = function(e) { if (e.type=='click') numCalls++; };
        var renderer = createSvgRenderer();
        renderer.on('userevent', listener);
        renderer.svg.root.dispatchEvent(createTouchEvent('touchstart'));
        renderer.svg.root.dispatchEvent(createTouchEvent('touchend'));
        expect(numCalls)
          .toBe(1);
        renderer.removeListener('userevent', listener);
      });
    });

  });
});
