import { useEffect, useRef, useState } from "react";
import { InterstitialAd, AdEventType, TestIds } from "react-native-google-mobile-ads";

// Singleton instance
const interstitialInstance = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
  requestNonPersonalizedAdsOnly: true,
});

let isAdShown = false;
let isInitialized = false;

export function useInterstitial() {
  const [loaded, setLoaded] = useState(false);
  const listenersRef = useRef<{ loaded: () => void; closed: () => void; error: (error: any) => void } | null>(null);

  useEffect(() => {
    // Only set up listeners once
    if (isInitialized) {
      console.log('[AdInterstitial] Skipping initialization - already initialized');
      return;
    }

    console.log('[AdInterstitial] Setting up event listeners');
    
    const onAdLoaded = interstitialInstance.addAdEventListener(AdEventType.LOADED, () => {
      console.log('[AdInterstitial] Ad loaded successfully');
      setLoaded(true);
    });

    const onAdClosed = interstitialInstance.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('[AdInterstitial] Ad closed');
      setLoaded(false);
      isAdShown = false;
      console.log('[AdInterstitial] Loading next ad');
      interstitialInstance.load();
    });

    const onAdFailedToLoad = interstitialInstance.addAdEventListener(AdEventType.ERROR, (error) => {
      console.warn("[AdInterstitial] Failed to load:", error);
      setLoaded(false);
    });

    // Store listeners for cleanup
    listenersRef.current = {
      loaded: onAdLoaded,
      closed: onAdClosed,
      error: onAdFailedToLoad
    };

    console.log('[AdInterstitial] Starting initial ad load');
    interstitialInstance.load();
    isInitialized = true;

    return () => {
      console.log('[AdInterstitial] Cleaning up event listeners');
      if (listenersRef.current) {
        listenersRef.current.loaded();
        listenersRef.current.closed();
        listenersRef.current.error({});
        listenersRef.current = null;
      }
    };
  }, []);

  const show = () => {
    console.log('[AdInterstitial] Show called - Current state:', {
      loaded,
      isAdShown,
      isInitialized
    });
    
    if (loaded && !isAdShown) {
      console.log('[AdInterstitial] Showing ad');
      interstitialInstance.show();
      isAdShown = true;
    } else {
      console.log('[AdInterstitial] Cannot show ad:', {
        reason: !loaded ? 'not loaded' : 'already shown'
      });
    }
  };

  return { show, loaded };
}