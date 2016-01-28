/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

describe("loop.store.RemoteCursorStore", function() {
  "use strict";

  var expect = chai.expect;
  var sharedActions = loop.shared.actions;
  var CURSOR_MESSAGE_TYPES = loop.shared.utils.CURSOR_MESSAGE_TYPES;
  var sandbox, dispatcher, store, fakeSdkDriver;

  beforeEach(function() {
    sandbox = LoopMochaUtils.createSandbox();

    LoopMochaUtils.stubLoopRequest({
      GetLoopPref: sinon.stub()
    });

    dispatcher = new loop.Dispatcher();
    sandbox.stub(dispatcher, "dispatch");

    fakeSdkDriver = {
      sendCursorMessage: sinon.stub()
    };

    store = new loop.store.RemoteCursorStore(dispatcher, {
      sdkDriver: fakeSdkDriver
    });
  });

  afterEach(function() {
    sandbox.restore();
    LoopMochaUtils.restore();
  });

  describe("#constructor", function() {
    it("should throw an error if sdkDriver is missing", function() {
      expect(function() {
        new loop.store.RemoteCursorStore(dispatcher, {});
      }).to.Throw(/sdkDriver/);
    });

    it("should add a CursorPositionChange event listener", function() {
      sandbox.stub(loop, "subscribe");
      new loop.store.RemoteCursorStore(dispatcher, { sdkDriver: fakeSdkDriver });
      sinon.assert.calledOnce(loop.subscribe);
      sinon.assert.calledWith(loop.subscribe, "CursorPositionChange");
    });
  });

  describe("#_cursorPositionChangeListener", function() {
    it("should send cursor data through the sdk", function() {
      var fakeEvent = {
        ratioX: 10,
        ratioY: 10
      };

      LoopMochaUtils.publish("CursorPositionChange", fakeEvent);

      sinon.assert.calledOnce(fakeSdkDriver.sendCursorMessage);
      sinon.assert.calledWith(fakeSdkDriver.sendCursorMessage, {
        type: CURSOR_MESSAGE_TYPES.POSITION,
        ratioX: fakeEvent.ratioX,
        ratioY: fakeEvent.ratioY
      });
    });
  });
});