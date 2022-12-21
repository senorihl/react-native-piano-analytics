#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(PianoAnalytics, RCTEventEmitter)

RCT_EXTERN_METHOD(configure:(NSDictionary)map)
RCT_EXTERN_METHOD(setProperties:(NSDictionary)map withPersistence:(BOOL)persistent withEvents:(NSArray)events)

RCT_EXTERN_METHOD(sendPianoEvent:(NSString)name withData:(NSDictionary)data)
RCT_EXTERN_METHOD(sendPianoEvents:(NSArray)arr)

RCT_EXTERN_METHOD(setPrivacyMode:(NSString)mode)
RCT_EXTERN_METHOD(getPrivacyMode:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(privacyIncludeEvents:(NSArray)events inModes:(NSArray)modes)
RCT_EXTERN_METHOD(privacyExcludeEvents:(NSArray)events inModes:(NSArray)modes)

RCT_EXTERN_METHOD(privacyIncludeStorageKeys:(NSArray)keys inModes:(NSArray)modes)
RCT_EXTERN_METHOD(privacyExcludeStorageKeys:(NSArray)keys inModes:(NSArray)modes)

RCT_EXTERN_METHOD(privacyIncludeProperties:(NSArray)properties inModes:(NSArray)modes inEvents:(NSArray)events)
RCT_EXTERN_METHOD(privacyExcludeProperties:(NSArray)properties inModes:(NSArray)modes inEvents:(NSArray)events)

RCT_EXTERN_METHOD(setUser:(NSString)id withCategory:(NSString)category withStorageEnabled:(BOOL)enableStorage)
RCT_EXTERN_METHOD(deleteUser:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getUser:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setVisitorId:(NSString)id)
RCT_EXTERN_METHOD(getVisitorId:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
