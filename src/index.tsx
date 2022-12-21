import { NativeModules, Platform, NativeEventEmitter } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-piano-analytics' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

/* istanbul ignore next */
const PianoAnalytics = NativeModules.PianoAnalytics
  ? NativeModules.PianoAnalytics
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const nativeEventEmitter = new NativeEventEmitter(PianoAnalytics);

export const onBeforeBuild = (cb: () => void) => {
  return nativeEventEmitter.addListener('pianoEvent', (e) => {
    if (typeof e === 'object') {
      const { __name = undefined } = e;

      if (typeof __name === 'string' && __name === 'beforeBuild') {
        cb();
      }
    }
  }).remove;
};

export const onBeforeSend = (
  cb: (
    body: { events: Array<{ data: object; name: string }> },
    uri: string
  ) => void
) => {
  return nativeEventEmitter.addListener('pianoEvent', (e) => {
    if (typeof e === 'object') {
      const { __body = undefined, __name = undefined } = e;

      if (
        typeof __name === 'string' &&
        typeof __body === 'object' &&
        __name === 'beforeSend'
      ) {
        cb(JSON.parse(__body.body), __body.uri);
      }
    }
  }).remove;
};

export const onError = (cb: (message: string) => void) => {
  typeof defaultErrorListener === 'function' && defaultErrorListener();
  return nativeEventEmitter.addListener('pianoEvent', (e) => {
    if (typeof e === 'object') {
      const { __body = undefined, __name = undefined } = e;

      if (
        typeof __name === 'string' &&
        typeof __body === 'string' &&
        __name === 'error'
      ) {
        cb(__body);
      }
    }
  }).remove;
};

const defaultErrorListener = onError((msg) => {
  console.warn(`[PianoAnalytics] ${msg}`);
});

export type PianoConfiguration = {
  collectDomain: string;
  site: number;
  path?: string;
  crashDetection?: boolean;
  sessionBackgroundDuration?: number;
  ignoreLimitedAdvertisingTracking?: boolean;
  sendEventWhenOptout?: boolean;
  privacyDefaultMode?: string;
  offlineEncryptionMode?: 'none' | 'ifCompatible' | 'force';
  offlineStorageMode?: 'always' | 'required' | 'never';
  offlineSendInterval?: number;
  storageLifetimePrivacy?: number;
  storageLifetimeUser?: number;
  storageLifetimeVisitor?: number;
  visitorStorageMode?: 'fixed' | 'relative';
  visitorIdType?: 'uuid' | 'idfa' | 'idfv' | 'custom';
  visitorId?: string;
};

type Events = {
  'page.display': {
    page: string;
    page_chapter1: string;
    page_chapter2: string;
    page_chapter3: string;
  };
  'click.action': {
    click: string;
    click_chapter1: string;
    click_chapter2: string;
    click_chapter3: string;
  };
  'click.navigation': {
    click: string;
    click_chapter1: string;
    click_chapter2: string;
    click_chapter3: string;
  };
  'click.download': {
    click: string;
    click_chapter1: string;
    click_chapter2: string;
    click_chapter3: string;
  };
  'click.exit': {
    click: string;
    click_chapter1: string;
    click_chapter2: string;
    click_chapter3: string;
  };
  'publisher.impression': {
    onsitead_type: 'Publisher';
    onsitead_advertiser: string;
    onsitead_campaign: string;
    onsitead_category: string;
    onsitead_creation: string;
    onsitead_detailed_placement: string;
    onsitead_format: string;
    onsitead_general_placement: string;
    onsitead_url: string;
    onsitead_variant: string;
  };
  'publisher.click': {
    onsitead_type: 'Publisher';
    onsitead_advertiser: string;
    onsitead_campaign: string;
    onsitead_category: string;
    onsitead_creation: string;
    onsitead_detailed_placement: string;
    onsitead_format: string;
    onsitead_general_placement: string;
    onsitead_url: string;
    onsitead_variant: string;
  };
  'self_promotion.impression': {
    onsitead_type: 'Self promotion';
    onsitead_advertiser: string;
    onsitead_campaign: string;
    onsitead_category: string;
    onsitead_creation: string;
    onsitead_detailed_placement: string;
    onsitead_format: string;
    onsitead_general_placement: string;
    onsitead_url: string;
    onsitead_variant: string;
  };
  'self_promotion.click': {
    onsitead_type: 'Self promotion';
    onsitead_advertiser: string;
    onsitead_campaign: string;
    onsitead_category: string;
    onsitead_creation: string;
    onsitead_detailed_placement: string;
    onsitead_format: string;
    onsitead_general_placement: string;
    onsitead_url: string;
    onsitead_variant: string;
  };
  'internal_search_result.display': {
    ise_keyword: string;
    ise_page: number;
  };
  'internal_search_result.click': {
    ise_keyword: string;
    ise_page: number;
    ise_click_rank: number;
  };
  'mv_test.display': {
    mv_creation: string;
    mv_test: string;
    mv_wave: number;
  };
};

type EventProperties = { [prop: string]: string | number };

export function configure(config: PianoConfiguration): void {
  return PianoAnalytics.configure(config);
}

export function setProperties(
  properties: EventProperties,
  persistent: boolean = true,
  events: string[] = ['*']
): void {
  return PianoAnalytics.setProperties(properties, persistent, events);
}

export function sendEvent<T extends keyof Events>(
  name: T,
  properties: Partial<Events[T]> = {}
) {
  if (typeof name !== 'string') {
    throw new Error('Invalid type for `name`.');
  }
  if (typeof properties !== 'object') {
    throw new Error('Invalid type for `properties`.');
  }
  try {
    PianoAnalytics.sendPianoEvent(name, { ...properties });
  } catch (e) {
    console.warn(e);
  }
}

export enum PrivacyModes {
  OPT_IN = 'optin',
  OPT_OUT = 'optout',
  EXEMPT = 'exempt',
}

export function sendEvents<T extends keyof Events>(
  events: Array<{ name: T; properties?: Partial<Events[T]> }>
) {
  if (!Array.isArray(events)) {
    throw new Error('Invalid type for `events`.');
  }
  try {
    PianoAnalytics.sendPianoEvents(events.map((event) => ({ ...event })));
  } catch (e) {
    console.warn(e);
  }
}

export const privacy = {
  setPrivacyMode: function (mode: string) {
    PianoAnalytics.setPrivacyMode(mode);
  },
  getPrivacyMode: async function () {
    return (await PianoAnalytics.getPrivacyMode()) as string;
  },
  includeEvents: function (events: string[], modes: string[] = ['*']) {
    PianoAnalytics.privacyIncludeEvents(events, modes);
  },
  excludeEvents: function (events: string[], modes: string[] = ['*']) {
    PianoAnalytics.privacyExcludeEvents(events, modes);
  },
  includeStorageKeys: function (keys: string[], modes: string[] = ['*']) {
    PianoAnalytics.privacyIncludeStorageKeys(keys, modes);
  },
  excludeStorageKeys: function (keys: string[], modes: string[] = ['*']) {
    PianoAnalytics.privacyExcludeStorageKeys(keys, modes);
  },
  includeProperties: function (
    properties: string[],
    modes: string[] = ['*'],
    events: string[] = ['*']
  ) {
    PianoAnalytics.privacyIncludeProperties(properties, modes, events);
  },
  excludeProperties: function (
    properties: string[],
    modes: string[] = ['*'],
    events: string[] = ['*']
  ) {
    PianoAnalytics.privacyExcludeProperties(properties, modes, events);
  },
};

export function setVisitorId(id: string) {
  PianoAnalytics.setVisitorId(id);
}

export async function getVisitorId() {
  return (await PianoAnalytics.getVisitorId()) as string;
}

export function setUser(
  id: string,
  category?: string,
  enableStorage?: boolean
) {
  PianoAnalytics.setUser(
    id,
    typeof category === 'string' ? category : null,
    typeof enableStorage === 'boolean' ? enableStorage : true
  );
}

export async function getUser() {
  return (await PianoAnalytics.getUser()) as any;
}

export function deleteUser() {
  PianoAnalytics.deleteUser();
}
