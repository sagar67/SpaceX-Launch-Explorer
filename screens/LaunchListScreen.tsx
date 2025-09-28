import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  FlatList,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import LaunchItem from "../components/LaunchItem";
import { Launch } from "../types/spacex";
import { useGetLaunchesQuery } from "../services/spacexApi";

const PAGE_SIZE = 20;

function filterByName(launches: Launch[], q: string): Launch[] {
  if (!Array.isArray(launches)) return [];
  return launches.filter((ln) =>
    ln.name.toLowerCase().includes(q.toLowerCase())
  );
}

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function LaunchListScreen({ navigation }: any) {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isFocused, setIsFocused] = useState(false);
  const [allLaunches, setAllLaunches] = useState<Launch[]>([]);
  const fetchedPages = useRef(new Set<number>());
  let isEndReachedCalledDuringMomentum = false;

  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useGetLaunchesQuery({
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
    searchTerm: debouncedSearchTerm,
  });

  useEffect(() => {
    if (response?.docs) {
      setAllLaunches((prev) => [...prev, ...response.docs]);
    }
  }, [response]);

  const filteredLaunches = useMemo(
    () => filterByName(allLaunches, debouncedSearchTerm),
    [allLaunches, debouncedSearchTerm]
  );

  const handleRefresh = () => {
    if (!isFetching) {
      fetchedPages.current.clear();
      setAllLaunches([]);
      setPage(1);
      refetch();
    }
  };

  const handleEndReached = () => {
    if (
      !isFetching &&
      response?.hasNextPage &&
      !isEndReachedCalledDuringMomentum
    ) {
      isEndReachedCalledDuringMomentum = true;
      setPage(response.nextPage);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SpaceX Launch</Text>
      </View>
      <TextInput
        placeholder="Search mission name..."
        placeholderTextColor="#888"
        style={[
          styles.searchInput,
          { borderColor: isFocused ? "#FF5722" : "#F9E7DE" },
        ]}
        onChangeText={setSearchTerm}
        value={searchTerm}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCorrect={false}
        autoCapitalize="none"
      />

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF5722" />
          <Text style={styles.loadingText}>Loading launches...</Text>
        </View>
      )}

      {filteredLaunches.length === 0 && !isLoading && (
        <Text style={styles.emptyText}>No launches found 🚀</Text>
      )}

      <FlatList
        data={filteredLaunches}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <LaunchItem
            launch={item}
            onPress={() =>
              navigation.navigate("LaunchDetails", { launch: item })
            }
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={handleRefresh}
            tintColor="#FF5722"
          />
        }
        onMomentumScrollBegin={() => {
          isEndReachedCalledDuringMomentum = false;
        }}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        ListFooterComponent={
          isFetching && !isLoading ? (
            <ActivityIndicator style={{ marginVertical: 16 }} color="#FF5722" />
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0d6b6ff",
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  header: {
    paddingTop: 44,
    paddingBottom: 10,
    backgroundColor: "#FF5722",
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 8,
    elevation: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 0.5,
    lineHeight: 38,
    marginBottom: 4,
  },
  searchInput: {
    margin: 18,
    marginTop: 0,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: "#fff",
    color: "#111",
    fontSize: 16,
    elevation: 2,
  },
  centered: {
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: "#FF5722",
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 36,
    fontSize: 17,
    color: "#AAA",
    fontWeight: "500",
  },
});
