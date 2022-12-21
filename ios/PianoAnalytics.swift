import PianoAnalytics

@objc(PianoAnalytics)
class PianoAnalytics: RCTEventEmitter, PianoAnalyticsWorkProtocol {
    
    var disabledObservation: Bool = false;
    var resolver: Optional<RCTPromiseResolveBlock> = nil;
    var rejecter: Optional<RCTPromiseRejectBlock> = nil;
    
    @objc(configure:)
    func configure(map: NSDictionary) -> Void {
        guard let collectDomain = map["collectDomain"], collectDomain as! String? != nil else {
            self.dispatchEvent(name: "error", body: "In `\(#function)`, collectDomain is not defined");
            return;
        }
        
        guard let site = map["site"], site as! Int? != nil else {
            self.dispatchEvent(name: "error", body: "In `\(#function)`, site is not defined");
            return;
        }
        
        var configuration = ConfigurationBuilder()
            .withCollectDomain(collectDomain as! String)
            .withSite(site as! Int);
        
        if let path = map["path"] {
            configuration = configuration.withPath(path as! String);
        }
        
        if let customUserAgent = map["customUserAgent"] {
            configuration = configuration.withCustomUserAgent(customUserAgent as! String);
        }
        
        if let crashDetection = map["crashDetection"] {
            configuration = configuration.enableCrashDetection(crashDetection as! Bool);
        }
        
        if let sessionBackgroundDuration = map["sessionBackgroundDuration"] {
            configuration = configuration.withSessionBackgroundDuration(sessionBackgroundDuration as! Int);
        }
        
        if let ignoreLimitedAdvertisingTracking = map["ignoreLimitedAdvertisingTracking"] {
            configuration = configuration.enableIgnoreLimitedAdTracking(ignoreLimitedAdvertisingTracking as! Bool);
        }
        
        if let sendEventWhenOptout = map["sendEventWhenOptout"] {
            configuration = configuration.enableSendEventWhenOptout(sendEventWhenOptout as! Bool);
        }
        
        if let privacyDefaultMode = map["privacyDefaultMode"] {
            configuration = configuration.withPrivacyDefaultMode(privacyDefaultMode as! String);
        }
        
        if let offlineEncryptionMode = map["offlineEncryptionMode"] {
            configuration = configuration.withOfflineEncryptionMode(offlineEncryptionMode as! String);
        }
        
        if let offlineStorageMode = map["offlineStorageMode"] {
            configuration = configuration.withOfflineStorageMode(offlineStorageMode as! String);
        }
        
        if let offlineSendInterval = map["offlineSendInterval"] {
            configuration = configuration.withOfflineSendInterval(offlineSendInterval as! Int);
        }
        
        if let storageLifetimePrivacy = map["storageLifetimePrivacy"] {
            configuration = configuration.withStorageLifetimePrivacy(storageLifetimePrivacy as! Int);
        }
        
        if let storageLifetimeUser = map["storageLifetimeUser"] {
            configuration = configuration.withStorageLifetimeUser(storageLifetimeUser as! Int);
        }
        
        if let storageLifetimeVisitor = map["storageLifetimeVisitor"] {
            configuration = configuration.withStorageLifetimeVisitor(storageLifetimeVisitor as! Int);
        }
        
        if let visitorStorageMode = map["visitorStorageMode"] {
            configuration = configuration.withVisitorStorageMode(visitorStorageMode as! String);
        }
        
        if let visitorIdType = map["visitorIdType"] {
            configuration = configuration.withVisitorIdType(visitorIdType as! String);
        }
        
        if let visitorId = map["visitorId"] {
            configuration = configuration.withVisitorID(visitorId as! String);
        }
        
        pa.setConfiguration(configuration.build());
        
    }
    
    
    @objc(sendPianoEvent:withData:)
    func sendPianoEvent(name: String, data: NSDictionary) {
        if let properties = data as? [String: Any] {
            pa.sendEvent(Event(name, data: properties), config: nil, p: self)
        } else {
            self.dispatchEvent(name: "error", body: "In `\(#function)`, Invalid properties definition: \(data).");
        }
    }
    
    @objc(setProperties:withPersistence:withEvents:)
    func setProperties(data: NSDictionary, persistent: Bool, events: NSArray) {
        if let properties = data as? [String: Any] {
            pa.setProperties(properties, persistent: persistent,events: events.compactMap({ $0 as? String }))
        } else {
            self.dispatchEvent(name: "error", body: "In `\(#function)`, Invalid properties definition: \(data).");
        }
    }
    
    @objc(sendPianoEvents:)
    func sendPianoEvents(arr: NSArray) {
        var events: Array<Event> = [];
        for e in arr {
            if let event = e as? NSDictionary {
                if let name = event["name"] {
                    if let properties = event["properties"] as? [String: Any] {
                        events.append(Event(name as! String, data: properties))
                    } else {
                        events.append(Event(name as! String))
                    }
                }
            } else {
                self.dispatchEvent(name: "error", body: "In `\(#function)`, Invalid event definition: \(e).");
                
                return;
            }
        }
        pa.sendEvents(events, config: nil, p: self)
    }
    
    @objc(setUser:withCategory:withStorageEnabled:)
    func setUser(id: NSString, category: NSString, enableStorage: Bool) {
        pa.setUser(id as String, category: category as String, enableStorage: enableStorage);
    }
    
    @objc(deleteUser:rejecter:)
    func deleteUser(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        pa.deleteUser();
        resolve(nil)
    }
    
    @objc(getUser:rejecter:)
    func getUser(resolve: @escaping RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        pa.getUser { user in
            if (user != nil) {
                resolve([
                    "id": user!.id,
                    "category": user!.category,
                ])
            } else {
                resolve(nil)
            }
            
        }
    }
    
    @objc(setVisitorId:)
    func setVisitorId(id: NSString) {
        pa.setVisitorId(id as String);
    }
    
    @objc(getVisitorId:rejecter:)
    func getVisitorId(resolve: @escaping RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        pa.getVisitorId { visitorId in
            resolve(visitorId)
        }
    }
    
    @objc(setPrivacyMode:)
    func setPrivacyMode(mode: NSString) {
        pa.privacySetMode(mode as String);
    }
    
    @objc(getPrivacyMode:rejecter:)
    func getPrivacyMode(resolve: @escaping RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        pa.privacyGetMode { privacyMode in
            resolve(privacyMode)
        }
    }
    
    @objc(privacyIncludeEvents:inModes:)
    func privacyIncludeEvents(events: NSArray, modes: NSArray) {
        pa.privacyIncludeEvents(events.compactMap({ $0 as? String }), privacyModes: modes.compactMap({ $0 as? String }));
    }
    
    @objc(privacyExcludeEvents:inModes:)
    func privacyExcludeEvents(events: NSArray, modes: NSArray) {
        pa.privacyExcludeEvents(events.compactMap({ $0 as? String }), privacyModes: modes.compactMap({ $0 as? String }));
    }
    
    @objc(privacyIncludeProperties:inModes:inEvents:)
    func privacyIncludeProperties(properties: NSArray, modes: NSArray, events: NSArray) {
        pa.privacyIncludeProperties(
            properties.compactMap({ $0 as? String }),
            privacyModes: modes.compactMap({ $0 as? String }),
            eventNames:  events.compactMap({ $0 as? String })
        );
    }
    
    @objc(privacyExcludeProperties:inModes:inEvents:)
    func privacyExcludeProperties(properties: NSArray, modes: NSArray, events: NSArray) {
        pa.privacyExcludeProperties(
            properties.compactMap({ $0 as? String }),
            privacyModes: modes.compactMap({ $0 as? String }),
            eventNames:  events.compactMap({ $0 as? String })
        );
    }
    
    @objc(privacyIncludeStorageKeys:inModes:)
    func privacyIncludeStorageKeys(keys: NSArray, modes: NSArray) {
        pa.privacyIncludeStorageKeys(
            keys.compactMap({ $0 as? String }),
            privacyModes: modes.compactMap({ $0 as? String })
        );
    }
    
    @objc(privacyExcludeStorageKeys:inModes:)
    func privacyExcludeStorageKeys(keys: NSArray, modes: NSArray) {
        pa.privacyExcludeStorageKeys(
            keys.compactMap({ $0 as? String }),
            privacyModes: modes.compactMap({ $0 as? String })
        );
    }
    
    func onBeforeBuild(model: inout Model) -> Bool {
        if (self.disabledObservation == false) {
            self.dispatchEvent(name: "beforeBuild", body: nil)
        }
        
        return true;
    }
    
    func onBeforeSend(built: BuiltModel?, stored: [String: BuiltModel]?) -> Bool {
        if (self.disabledObservation == false) {
            self.dispatchEvent(name: "beforeSend", body: [
                "uri": built?.uri,
                "body": built?.body
            ])
        }
        
        return true;
    }
    
    func dispatchEvent(name: String, body: Any?) {
        self.sendEvent(withName: "pianoEvent", body: [
            "__name": name,
            "__body": body
        ])
    }
    
    override func supportedEvents() -> [String]! {
        [
            "pianoEvent",
        ]
    }
}
