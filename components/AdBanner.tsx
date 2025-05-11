import React, { useState } from "react";
import { View } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

export default function AdBanner() {
  const [loaded, setLoaded] = useState(false);

  return (
    <View style={{ minHeight: loaded ? 50 : 0 }}>
      <BannerAd
        unitId={TestIds.BANNER}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdLoaded={() => setLoaded(true)}
        onAdFailedToLoad={() => setLoaded(false)}
      />
      {!loaded && (
        <View style={{ height: 50, backgroundColor: "#eee", alignItems: "center", justifyContent: "center" }} />
      )}
    </View>
  );
} 