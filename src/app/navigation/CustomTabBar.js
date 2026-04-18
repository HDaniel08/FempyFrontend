import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Platform,
  Animated,
  Easing,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Non-expo:
// import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
  isLeader,
}) {
  const insets = useSafeAreaInsets();
  const visibleRoutes = useMemo(() => {
    return state.routes.filter((r) => {
      if (r.name === "Leadership") return !!isLeader;
      return true;
    });
  }, [state.routes, isLeader]);

  // fókuszolt route -> látható index
  const focusedRouteKey = state.routes[state.index]?.key;
  const focusedVisibleIndex = Math.max(
    0,
    visibleRoutes.findIndex((r) => r.key === focusedRouteKey),
  );

  // layout mérés a tab szélességhez
  const [barWidth, setBarWidth] = useState(0);
  const tabCount = visibleRoutes.length;
  const tabWidth = barWidth > 0 ? barWidth / tabCount : 0;

  // animált indikátor X
  const indicatorX = useRef(new Animated.Value(0)).current;

  // ikon “pop” animok tabonként
  const scalesRef = useRef({}).current;
  useEffect(() => {
    visibleRoutes.forEach((r) => {
      if (!scalesRef[r.key]) scalesRef[r.key] = new Animated.Value(1);
    });
  }, [visibleRoutes, scalesRef]);

  // animálás tabváltáskor
  useEffect(() => {
    if (!tabWidth) return;

    Animated.timing(indicatorX, {
      toValue: focusedVisibleIndex * tabWidth,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // aktív ikon “spring”
    visibleRoutes.forEach((r, idx) => {
      const v = scalesRef[r.key];
      if (!v) return;
      Animated.spring(v, {
        toValue: idx === focusedVisibleIndex ? 1.08 : 1,
        stiffness: 260,
        damping: 18,
        mass: 0.8,
        useNativeDriver: true,
      }).start();
    });
  }, [focusedVisibleIndex, tabWidth, indicatorX, visibleRoutes, scalesRef]);

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}
    >
      <View style={styles.topHairline} />

      <View
        style={styles.row}
        onLayout={(e) => setBarWidth(e?.nativeEvent?.layout?.width ?? 0)}
      >
        {/* Egyetlen animált indikátor */}
        {tabWidth ? (
          <Animated.View
            style={[
              styles.indicator,
              {
                width: Math.max(44, tabWidth - 36),
                transform: [{ translateX: indicatorX }],
              },
            ]}
          />
        ) : null}

        {visibleRoutes.map((route, idx) => {
          const isFocused = idx === focusedVisibleIndex;
          const { options } = descriptors[route.key] || {};
          const label = options?.tabBarLabel ?? options?.title ?? route.name;
          const iconName = options?.tabBarIconName ?? "circle-outline";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented)
              navigation.navigate(route.name);
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          const scale = scalesRef[route.key] || 1;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [
                styles.item,
                isFocused && styles.itemActive,
                pressed && styles.itemPressed,
              ]}
            >
              <Animated.View style={{ transform: [{ scale }] }}>
                <MaterialCommunityIcons
                  name={iconName}
                  size={22}
                  color={isFocused ? colors.accent300 : colors.textLight}
                />
              </Animated.View>

              <Text
                style={[styles.label, isFocused && styles.labelActive]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = {
  container: {
    backgroundColor: "rgba(255,255,255,0.98)",
  },
  topHairline: {
    height: 1,
    backgroundColor: colors.primary50,
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    position: "relative",
    paddingTop: 2,
  },

  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    paddingBottom: 10,
    gap: 4,
  },
  itemActive: {
    backgroundColor: "rgba(250, 83, 147, 0.10)",
  },
  itemPressed: {
    opacity: 0.9,
  },

  // indikátor: felül, középre igazítva tab-on belül
  indicator: {
    position: "absolute",
    top: 0,
    left: 18, // az Animated translateX a tab elejére visz, ez pedig középre húzza
    height: 3,
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 999,
    backgroundColor: colors.accent300,
  },

  label: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.textLight,
    opacity: 0.72,
    letterSpacing: 0.2,
  },
  labelActive: {
    opacity: 1,
    color: colors.accent300,
  },
};
