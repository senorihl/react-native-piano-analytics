jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  const addListenerMock = jest.fn(() => () => {});
  return () => ({
    addListener: addListenerMock,
    addListenerMock,
  });
});

jest.mock('react-native', () => {
  return {
    __esModule: true,
    Platform: {
      select: jest.fn((map: any) => {
        return map.ios || map.default;
      }),
    },
    NativeModules: {
      PianoAnalytics: {
        configure: jest.fn(),
        setProperties: jest.fn(),

        sendPianoEvent: jest.fn(),
        sendPianoEvents: jest.fn(),

        setVisitorId: jest.fn(),
        getVisitorId: jest.fn(),

        setUser: jest.fn(),
        getUser: jest.fn(),
        deleteUser: jest.fn(),

        setPrivacyMode: jest.fn(),
        getPrivacyMode: jest.fn(),
        privacyIncludeEvents: jest.fn(),
        privacyExcludeEvents: jest.fn(),
        privacyIncludeStorageKeys: jest.fn(),
        privacyExcludeStorageKeys: jest.fn(),
        privacyIncludeProperties: jest.fn(),
        privacyExcludeProperties: jest.fn(),
      },
    },
    NativeEventEmitter: jest.requireMock(
      'react-native/Libraries/EventEmitter/NativeEventEmitter'
    ),
  };
});

import * as Piano from '../index';
import { NativeEventEmitter } from 'react-native';

beforeEach(() => {
  (
    require('react-native').NativeModules.PianoAnalytics
      .sendPianoEvent as jest.Mock
  ).mockReset();
  (
    require('react-native').NativeModules.PianoAnalytics
      .sendPianoEvents as jest.Mock
  ).mockReset();
});

describe('listeners', () => {
  it('shoud have default error listener', () => {
    const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation();

    const ee = new NativeEventEmitter();
    expect(ee.addListener).toBeCalledTimes(1);
    const emitEvent = (ee.addListener as jest.Mock).mock.calls[0][1];
    emitEvent({ __name: 'error', __body: 'sample' });
    expect(consoleWarnMock).toBeCalledTimes(1);
    consoleWarnMock.mockRestore();
  });
  describe('', () => {
    beforeEach(() => {
      const ee = new NativeEventEmitter();
      (ee.addListener as jest.Mock).mockClear();
    });
    describe('onError', () => {
      it('should handle error events', () => {
        const ee = new NativeEventEmitter();
        const listener = jest.fn();
        Piano.onError(listener);
        const [, emitEvent] = (ee.addListener as jest.Mock).mock.calls[0];
        expect(ee.addListener).toBeCalledTimes(1);
        emitEvent({ __name: 'error', __body: 'sample' });
        expect(listener).toBeCalledTimes(1);
      });

      it('should not handle invalid event', () => {
        const ee = new NativeEventEmitter();
        const listener = jest.fn();
        Piano.onError(listener);
        const [, emitEvent] = (ee.addListener as jest.Mock).mock.calls[0];
        expect(ee.addListener).toBeCalledTimes(1);
        emitEvent('Sample event');
        emitEvent({ __name: 'error', __body: {} });
        emitEvent({});
        expect(listener).toBeCalledTimes(0);
      });
    });

    describe('onBeforeBuild', () => {
      it('should handle beforeBuild events', () => {
        const ee = new NativeEventEmitter();
        const listener = jest.fn();
        Piano.onBeforeBuild(listener);
        const [, emitEvent] = (ee.addListener as jest.Mock).mock.calls[0];
        expect(ee.addListener).toBeCalledTimes(1);
        emitEvent({ __name: 'beforeBuild', __body: 'sample' });
        expect(listener).toBeCalledTimes(1);
      });

      it('should not handle invalid event', () => {
        const ee = new NativeEventEmitter();
        const listener = jest.fn();
        Piano.onBeforeBuild(listener);
        const [, emitEvent] = (ee.addListener as jest.Mock).mock.calls[0];
        expect(ee.addListener).toBeCalledTimes(1);
        emitEvent('Sample event');
        emitEvent({ __name: 'error', __body: 'sample' });
        emitEvent({});
        expect(listener).toBeCalledTimes(0);
      });
    });

    describe('onBeforeSend', () => {
      it('should handle beforeSend events', () => {
        const ee = new NativeEventEmitter();
        const listener = jest.fn();
        Piano.onBeforeSend(listener);
        const [, emitEvent] = (ee.addListener as jest.Mock).mock.calls[0];
        expect(ee.addListener).toBeCalledTimes(1);
        emitEvent({
          __name: 'beforeSend',
          __body: {
            body: JSON.stringify('{}'),
            uri: 'test',
          },
        });
        expect(listener).toBeCalledTimes(1);
      });

      it('should not handle invalid event', () => {
        const ee = new NativeEventEmitter();
        const listener = jest.fn();
        Piano.onBeforeSend(listener);
        const [, emitEvent] = (ee.addListener as jest.Mock).mock.calls[0];
        expect(ee.addListener).toBeCalledTimes(1);
        emitEvent('Sample event');
        emitEvent({ __name: 'error', __body: 'sample' });
        emitEvent({});
        emitEvent({ __name: 'error', __body: { invalid_prop: 'test' } });
        expect(listener).toBeCalledTimes(0);
      });
    });
  });
});

test('configure', () => {
  Piano.configure({
    site: 1234,
    collectDomain: 'example.org',
  });

  expect(
    require('react-native').NativeModules.PianoAnalytics.configure
  ).toBeCalled();
});

test('setProperties', () => {
  Piano.setProperties({
    site: 1234,
    collectDomain: 'example.org',
  });

  expect(
    require('react-native').NativeModules.PianoAnalytics.setProperties
  ).toBeCalled();
});

describe('sendEvent', () => {
  it('should call native method', () => {
    Piano.sendEvent('click.action');

    expect(
      require('react-native').NativeModules.PianoAnalytics.sendPianoEvent
    ).toBeCalled();
  });
  it('should not call if invalid parameters', () => {
    expect(() => {
      // @ts-ignore
      Piano.sendEvent({ 'click.action': null });
    }).toThrow();

    expect(() => {
      // @ts-ignore
      Piano.sendEvent('click.action', 'click.download');
    }).toThrow();

    (
      require('react-native').NativeModules.PianoAnalytics
        .sendPianoEvent as jest.Mock
    ).mockImplementationOnce(() => {
      throw Error('test');
    });

    const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation();
    Piano.sendEvent('click.action');
    expect(consoleWarnMock).toBeCalledTimes(1);
    consoleWarnMock.mockRestore();
  });
});

describe('sendEvents', () => {
  it('should call native method', () => {
    Piano.sendEvents([{ name: 'click.download' }]);

    expect(
      require('react-native').NativeModules.PianoAnalytics.sendPianoEvents
    ).toBeCalled();
  });
  it('should not call if invalid parameters', () => {
    expect(() => {
      // @ts-ignore
      Piano.sendEvents('anything');
    }).toThrow();

    (
      require('react-native').NativeModules.PianoAnalytics
        .sendPianoEvents as jest.Mock
    ).mockImplementationOnce(() => {
      throw Error('test');
    });

    const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation();
    // @ts-ignore
    Piano.sendEvents(['click.action']);
    expect(consoleWarnMock).toBeCalledTimes(1);
    consoleWarnMock.mockRestore();
  });
});

test('setVisitorId', () => {
  Piano.setVisitorId('toto');
  expect(
    require('react-native').NativeModules.PianoAnalytics
      .setVisitorId as jest.Mock
  ).toBeCalledTimes(1);
});

test('getVisitorId', async () => {
  (
    require('react-native').NativeModules.PianoAnalytics
      .getVisitorId as jest.Mock
  ).mockResolvedValue('toto');
  expect(await Piano.getVisitorId()).toBe('toto');
});

test('setUser', () => {
  Piano.setUser('toto');
  expect(
    require('react-native').NativeModules.PianoAnalytics.setUser as jest.Mock
  ).toHaveBeenCalledWith('toto', null, true);

  Piano.setUser('toto', 'blague');
  expect(
    require('react-native').NativeModules.PianoAnalytics.setUser as jest.Mock
  ).toHaveBeenCalledWith('toto', 'blague', true);

  Piano.setUser('toto', 'blague', false);
  expect(
    require('react-native').NativeModules.PianoAnalytics.setUser as jest.Mock
  ).toHaveBeenCalledWith('toto', 'blague', false);
});

test('getUser', async () => {
  (
    require('react-native').NativeModules.PianoAnalytics.getUser as jest.Mock
  ).mockResolvedValue({ any: 'thing' });
  expect(await Piano.getUser()).toStrictEqual({ any: 'thing' });
});

test('deleteUser', () => {
  Piano.deleteUser();
  expect(
    require('react-native').NativeModules.PianoAnalytics.deleteUser as jest.Mock
  ).toBeCalled();
});

describe('privacy', () => {
  test('setPrivacyMode', () => {
    Piano.privacy.setPrivacyMode('toto');
    expect(
      require('react-native').NativeModules.PianoAnalytics
        .setPrivacyMode as jest.Mock
    ).toHaveBeenCalledWith('toto');
  });
  test('getPrivacyMode', async () => {
    (
      require('react-native').NativeModules.PianoAnalytics
        .getPrivacyMode as jest.Mock
    ).mockResolvedValueOnce('optin');
    expect(await Piano.privacy.getPrivacyMode()).toBe('optin');
  });

  test('getUser', async () => {
    (
      require('react-native').NativeModules.PianoAnalytics.getUser as jest.Mock
    ).mockResolvedValue({ any: 'thing' });
    expect(await Piano.getUser()).toStrictEqual({ any: 'thing' });
  });

  test('includeEvents', () => {
    Piano.privacy.includeEvents(['toto']);
    expect(
      require('react-native').NativeModules.PianoAnalytics
        .privacyIncludeEvents as jest.Mock
    ).toHaveBeenCalledWith(['toto'], ['*']);

    Piano.privacy.includeEvents(['toto'], ['click.action']);
    expect(
      require('react-native').NativeModules.PianoAnalytics
        .privacyIncludeEvents as jest.Mock
    ).toHaveBeenCalledWith(['toto'], ['click.action']);
  });

  test('excludeEvents', () => {
    Piano.privacy.excludeEvents(['toto']);
    expect(
      require('react-native').NativeModules.PianoAnalytics
        .privacyExcludeEvents as jest.Mock
    ).toHaveBeenCalledWith(['toto'], ['*']);

    Piano.privacy.excludeEvents(['toto'], ['click.action']);
    expect(
      require('react-native').NativeModules.PianoAnalytics
        .privacyExcludeEvents as jest.Mock
    ).toHaveBeenCalledWith(['toto'], ['click.action']);
  });

  test('includeStorageKeys', () => {
    Piano.privacy.includeStorageKeys(['toto']);
    expect(
      require('react-native').NativeModules.PianoAnalytics
        .privacyIncludeStorageKeys as jest.Mock
    ).toHaveBeenCalledWith(['toto'], ['*']);

    Piano.privacy.includeStorageKeys(['toto'], ['optin']);
    expect(
      require('react-native').NativeModules.PianoAnalytics
        .privacyIncludeStorageKeys as jest.Mock
    ).toHaveBeenCalledWith(['toto'], ['optin']);
  });

  test('excludeStorageKeys', () => {
    Piano.privacy.excludeStorageKeys(['toto']);
    expect(
      require('react-native').NativeModules.PianoAnalytics
        .privacyExcludeStorageKeys as jest.Mock
    ).toHaveBeenCalledWith(['toto'], ['*']);

    Piano.privacy.excludeStorageKeys(['toto'], ['optin']);
    expect(
      require('react-native').NativeModules.PianoAnalytics
        .privacyExcludeStorageKeys as jest.Mock
    ).toHaveBeenCalledWith(['toto'], ['optin']);
  });

  test('includeProperties', () => {
    Piano.privacy.includeProperties(['toto']);
    expect(
      require('react-native').NativeModules.PianoAnalytics
        .privacyIncludeProperties as jest.Mock
    ).toHaveBeenCalledWith(['toto'], ['*'], ['*']);

    Piano.privacy.includeProperties(['toto'], ['optin']);
    expect(
      require('react-native').NativeModules.PianoAnalytics
        .privacyIncludeProperties as jest.Mock
    ).toHaveBeenCalledWith(['toto'], ['optin'], ['*']);
  });

  test('excludeProperties', () => {
    Piano.privacy.excludeProperties(['toto']);
    expect(
      require('react-native').NativeModules.PianoAnalytics
        .privacyExcludeProperties as jest.Mock
    ).toHaveBeenCalledWith(['toto'], ['*'], ['*']);

    Piano.privacy.excludeProperties(['toto'], ['optin']);
    expect(
      require('react-native').NativeModules.PianoAnalytics
        .privacyExcludeProperties as jest.Mock
    ).toHaveBeenCalledWith(['toto'], ['optin'], ['*']);
  });
});
