import React from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";
import dayjs from "dayjs";
import { Launch } from "../types/spacex";

export default React.memo(function LaunchItem({
  launch,
  onPress,
}: {
  launch: Launch;
  onPress: () => void;
}) {
  const padName = launch.name || launch.launchpad || "";
  
  let statusText = "Upcoming";
  let statusColor = "#FF9800";
  if (launch.success === true) {
    statusText = "Success";
    statusColor = "#4CAF50";
  }
  if (launch.success === false) {
    statusText = "Failed";
    statusColor = "#F44336";
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 16,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
        marginVertical: 6,
        marginHorizontal: 18,
        padding: 16,
      }}
    >
      {launch.links.patch.small ? (
        <Image
          source={{
            uri: `https://images.weserv.nl/?url=${encodeURIComponent(
              launch.links.patch.small
            )}`,
          }}
          style={{
            width: 54,
            height: 54,
            borderRadius: 12,
            backgroundColor: "#f5f5f5",
            marginRight: 14,
          }}
          resizeMode="contain"
        />
      ) : (
        <View
          style={{
            width: 54,
            height: 54,
            marginRight: 14,
            backgroundColor: "#eee",
            borderRadius: 12,
          }}
        />
      )}

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: "#111",
            marginBottom: 2,
          }}
          numberOfLines={1}
        >
          {launch.name}
        </Text>
        <Text style={{ color: "#262626", fontSize: 15 }}>{padName}</Text>
        <Text style={{ color: "#888", fontSize: 14, marginTop: 1 }}>
          {dayjs(launch.date_utc).format("YYYY.MM.DD HH:mm [UTC]")}
        </Text>
      </View>

      <View
        style={{
          marginLeft: 12,
          paddingHorizontal: 14,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: statusColor,
          alignSelf: "flex-start",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 13 }}>
          {statusText}
        </Text>
      </View>
    </TouchableOpacity>
  );
});
